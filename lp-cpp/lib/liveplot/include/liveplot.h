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

private:
    std::shared_ptr<spdlog::logger> log_;
};

} // namespace lp
