#include "liveplot.h"
#include "logger.h"

namespace lp
{

namespace
{
constexpr auto loggerName = "liveplot";
}

LivePlot::LivePlot()
    : log_(logging::logger(loggerName))
{
    log_->info("constructed LivePlot object");
}

} // namespace lp