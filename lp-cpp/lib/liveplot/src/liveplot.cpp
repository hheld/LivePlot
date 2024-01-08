#include "liveplot.h"
#include "logger.h"

#include <atomic>
#include <queue>
#include <thread>
#include <zmq.hpp>

namespace lp
{

namespace
{
constexpr auto loggerName = "liveplot";
} // namespace

class Publisher final
{
public:
    explicit Publisher(std::string_view connection)
        : sock_(std::make_unique<zmq::socket_t>(ctx_, zmq::socket_type::pub))
    {
        sock_->bind(connection.data());
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    void send(std::string_view quantity, std::string_view msg) const
    {
        sock_->send(zmq::buffer(quantity), zmq::send_flags::sndmore);
        sock_->send(zmq::buffer(msg), zmq::send_flags::none);
    }

private:
    zmq::context_t                 ctx_;
    std::unique_ptr<zmq::socket_t> sock_;
};

struct PubData
{
    zmq::message_t quantity;
    zmq::message_t msg;
};

class LivePlot::d final
{
public:
    explicit d(std::string connection)
        : log_(logging::logger(loggerName))
        , sock_(std::make_unique<zmq::socket_t>(ctx_, zmq::socket_type::req))
        , connection_(std::move(connection))
    {
        sock_->bind("inproc://#1");

        thPub_ = std::thread([this]() {
            zmq::socket_t sock(ctx_, zmq::socket_type::rep);
            sock.connect("inproc://#1");

            Publisher pub(connection_);

            std::queue<PubData> q;

            do
            {
                try
                {
                    zmq::message_t quantity;
                    (void)sock.recv(quantity);
                    sock.send(zmq::str_buffer(""));

                    zmq::message_t msg;
                    (void)sock.recv(msg);
                    sock.send(zmq::str_buffer(""));

                    q.push(PubData{ std::move(quantity), std::move(msg) });
                }
                catch (const zmq::error_t &e)
                {
                    if (keepRunning_)
                    {
                        throw e;
                    }
                }

                if (keepRunning_)
                {
                    const auto &msg = q.front();
                    pub.send(msg.quantity.to_string_view(), msg.msg.to_string_view());
                    q.pop();
                }
            } while (keepRunning_);

            while (!q.empty())
            {
                const auto &msg = q.front();
                pub.send(msg.quantity.to_string_view(), msg.msg.to_string_view());
                q.pop();
            }
        });
    }

    void send(std::string_view quantity, std::string_view msg)
    {
        const std::lock_guard<std::mutex> lock(mtx_);

        {
            sock_->send(zmq::buffer(quantity));
            zmq::message_t rep;
            (void)sock_->recv(rep);
        }

        {
            sock_->send(zmq::buffer(msg));
            zmq::message_t rep;
            (void)sock_->recv(rep);
        }
    }

    void stop()
    {
        keepRunning_ = false;
        ctx_.shutdown();
        thPub_.join();
    }

    std::shared_ptr<spdlog::logger> log_;

private:
    zmq::context_t                 ctx_;
    std::unique_ptr<zmq::socket_t> sock_;
    std::thread                    thPub_;
    std::atomic<bool>              keepRunning_{ true };
    std::mutex                     mtx_;
    const std::string              connection_;
};

LivePlot::LivePlot(std::string connection)
    : d_(std::make_unique<d>(std::move(connection)))
{}

void LivePlot::plot(std::string_view quantity, double x, double y) const
{
    const auto msg = fmt::format(R"({{"x":{},"y":{},"quantity":"{}"}})", x, y, quantity);
    d_->log_->debug("sending message '{}' for '{}'", msg, quantity);
    d_->send(quantity, msg);
}

LivePlot::~LivePlot()
{
    d_->stop();
}

} // namespace lp