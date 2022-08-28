#include <catch2/catch_test_macros.hpp>

#include <logger.h>

constexpr auto loggerName = "logger-test";

using namespace logging;

TEST_CASE("the logger works", "[logging]")
{
    auto lg = logger(loggerName);

    REQUIRE_NOTHROW(lg->info("info log message"));
}