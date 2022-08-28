#include "logger.h"

#include <spdlog/sinks/stdout_color_sinks.h>
#include <spdlog/spdlog.h>

namespace logging
{

std::shared_ptr<spdlog::logger> logger(const std::string &loggerName)
{
    std::shared_ptr<spdlog::logger> logger;

    if ((logger = spdlog::get(loggerName)))
    {
        return logger;
    }

    logger = spdlog::stdout_color_mt(loggerName);
    logger->set_level(spdlog::level::debug);

    return logger;
}

} // namespace logging
