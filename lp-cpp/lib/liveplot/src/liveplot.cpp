#include "liveplot.h"
#include "logger.h"

#include <zmq.hpp>

namespace lp
{

namespace
{
constexpr auto loggerName = "liveplot";
}

class LivePlot::d final
{
public:
    d()
        : sock_(std::make_unique<zmq::socket_t>(ctx_, zmq::socket_type::push))
    {
        sock_->bind("ipc://../../../test");
    }

    void send(std::string_view msg) const
    {
        sock_->send(zmq::buffer(msg), zmq::send_flags::dontwait);
    }

private:
    zmq::context_t                 ctx_;
    std::unique_ptr<zmq::socket_t> sock_;
};

LivePlot::LivePlot()
    : log_(logging::logger(loggerName))
    , d_(std::make_unique<d>())
{}

void LivePlot::plot(double x, double y) const
{
    const auto msg = fmt::format(R"({{"x": {}, "y": {}}})", x, y);
    log_->debug("sending message '{}'", msg);
    d_->send(msg);
}

LivePlot::~LivePlot() = default;

} // namespace lp