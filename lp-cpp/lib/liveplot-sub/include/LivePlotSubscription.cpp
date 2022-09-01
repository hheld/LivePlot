#include "LivePlotSubscription.h"
#include "logger.h"

#include <zmq.hpp>

namespace lp
{

LivePlotSubscription::LivePlotSubscription(std::string quantity, std::function<void(double, double)> &&cb)
    : quantity_(std::move(quantity))
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
}

void LivePlotSubscription::startListening() const
{
    zmq::socket_t sock(*ctx_, zmq::socket_type::sub);

    sock.connect("ipc://../../../test");
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
            cb_(1.1, 2.2);
        }
    }

    sock.close();
}

} // namespace lp