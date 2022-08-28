#pragma once

#include "liveplot_export.h"

#include <memory>

namespace spdlog
{
class logger;
}

namespace lp
{

class LivePlot
{
public:
    API_LIVEPLOT_EXPORT LivePlot();
    API_LIVEPLOT_EXPORT ~LivePlot();

    API_LIVEPLOT_EXPORT void plot(double x, double y) const;

private:
    std::shared_ptr<spdlog::logger> log_;

    class d;
    std::unique_ptr<d> d_;
};

} // namespace lp
