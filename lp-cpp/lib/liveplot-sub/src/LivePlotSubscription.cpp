#include "LivePlotSubscription.h"
#include "logger.h"

#include <nlohmann/json.hpp>
#include <zmq.hpp>

namespace lp
{

LivePlotSubscription::LivePlotSubscription(std::string connection, std::string quantity, void *state,
                                           std::function<void(double, double, void *)> &&cb)
    : quantity_(std::move(quantity))
    , connection_(std::move(connection))
    , state_(state)
    , log_(logging::logger("liveplot-sub"))
    , ctx_(std::make_unique<zmq::context_t>())
    , cb_(std::move(cb))
{
    log_->info("subscribing to '{}'", quantity_);

    listenThread_ = std::thread(&LivePlotSubscription::startListening, this);
}

LivePlotSubscription::~LivePlotSubscription()
{
    quit_ = true;
    ctx_->shutdown();
    listenThread_.join();

    log_->info("stopped subscription to '{}'", quantity_);
}

void LivePlotSubscription::startListening() const
{
    zmq::socket_t sock(*ctx_, zmq::socket_type::sub);

    sock.connect(connection_);
    sock.set(zmq::sockopt::subscribe, quantity_);

    while (!quit_)
    {
        zmq::message_t address;
        try
        {
            (void)sock.recv(address);
        }
        catch (const zmq::error_t &e)
        {
            if (!quit_)
            {
                throw e;
            }
        }

        if (quit_)
        {
            break;
        }

        zmq::message_t msg;
        try
        {
            (void)sock.recv(msg);
        }
        catch (const zmq::error_t &e)
        {
            if (!quit_)
            {
                throw e;
            }
        }

        if (!quit_)
        {
            using json         = nlohmann::json;
            const auto jsonMsg = json::parse(msg.to_string_view());
            cb_(jsonMsg["x"].get<double>(), jsonMsg["y"].get<double>(), state_);
        }
    }

    sock.close();
}

} // namespace lp