#include "liveplot.h"
#include "logger.h"

#include <thread>
#include <zmq.hpp>

namespace lp
{

namespace
{
constexpr auto loggerName = "liveplot";
}

class Publisher final
{
public:
    Publisher()
        : sock_(std::make_unique<zmq::socket_t>(ctx_, zmq::socket_type::push))
    {
        sock_->bind("ipc://../../../test");
    }

    void send(std::string_view msg) const
    {
        auto ret = sock_->send(zmq::buffer(msg), zmq::send_flags::dontwait);

        while (!ret)
        {
            ret = sock_->send(zmq::buffer(msg), zmq::send_flags::dontwait);
        }
    }

private:
    zmq::context_t                 ctx_;
    std::unique_ptr<zmq::socket_t> sock_;
};

class LivePlot::d final
{
public:
    d()
        : log_(logging::logger(loggerName))
        , sock_(std::make_unique<zmq::socket_t>(ctx_, zmq::socket_type::pair))
    {
        sock_->bind("inproc://#1");

        thPub_ = std::thread([this]() {
            zmq::socket_t sock(ctx_, zmq::socket_type::pair);
            sock.connect("inproc://#1");

            Publisher pub;

            do
            {
                zmq::message_t msg;
                try
                {
                    (void)sock.recv(msg);
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
                    pub.send(msg.to_string_view());
                }
            } while (keepRunning_);
        });
    }

    void send(std::string_view msg) const
    {
        auto ret = sock_->send(zmq::buffer(msg), zmq::send_flags::dontwait);

        while (!ret)
        {
            ret = sock_->send(zmq::buffer(msg), zmq::send_flags::dontwait);
        }
    }

    void stop()
    {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));

        keepRunning_ = false;
        ctx_.shutdown();
        thPub_.join();
    }

    std::shared_ptr<spdlog::logger> log_;

private:
    zmq::context_t                 ctx_;
    std::unique_ptr<zmq::socket_t> sock_;
    std::thread                    thPub_;
    bool                           keepRunning_{ true };
};

LivePlot::LivePlot()
    : d_(std::make_unique<d>())
{}

void LivePlot::plot(std::string_view quantity, double x, double y) const
{
    const auto msg = fmt::format(R"({{"quantity": {}, "x": {}, "y": {}}})", quantity, x, y);
    d_->log_->debug("sending message '{}'", msg);
    d_->send(msg);
}

LivePlot::~LivePlot()
{
    d_->stop();
}

} // namespace lp