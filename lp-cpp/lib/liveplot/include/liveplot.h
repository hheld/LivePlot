#pragma once

#include "liveplot_export.h"

#include <memory>
#include <string>
#include <string_view>

namespace lp
{

class LivePlot
{
public:
    API_LIVEPLOT_EXPORT explicit LivePlot(std::string connection);
    API_LIVEPLOT_EXPORT ~LivePlot();

    API_LIVEPLOT_EXPORT void plot(std::string_view quantity, double x, double y) const;

private:
    class d;
    std::unique_ptr<d> d_;
};

} // namespace lp
