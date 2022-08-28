#ifndef LOGGER_H
#define LOGGER_H

#include <memory>
#include <string>

#include <spdlog/logger.h>

namespace logging
{

std::shared_ptr<spdlog::logger> logger(const std::string &loggerName);

}

#endif // LOGGER_H
