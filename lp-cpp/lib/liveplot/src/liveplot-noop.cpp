#include "liveplot.h"

namespace lp
{

class LivePlot::d final
{};

LivePlot::LivePlot(std::string)
    : d_(nullptr)
{}

void LivePlot::plot(std::string_view, double, double) const
{}

LivePlot::~LivePlot() = default;

} // namespace lp