#include <atomic>
#include <cmath>
#include <iostream>
#include <liveplot.h>
#include <thread>

#include <logger.h>

int main()
{
    auto logger = logging::logger("example");

    lp::LivePlot lp;

    std::atomic<bool> quit{ false };
    double            t = 0;

    auto th_clock = std::thread([&t, &quit, logger] {
        while (!quit)
        {
            logger->info("time: {} seconds", t);
            std::this_thread::sleep_for(std::chrono::seconds(1));
            ++t;
        }
    });

    auto th1 = std::thread([&lp, &t, &quit, logger] {
        while (!quit)
        {
            logger->info("sending sin({})", t);
            lp.plot("sin", t, sin(t));
            std::this_thread::sleep_for(std::chrono::seconds(2));
        }
    });

    auto th2 = std::thread([&lp, &t, &quit, logger] {
        while (!quit)
        {
            logger->info("sending cos({})", t);
            lp.plot("cos", t, cos(t));
            std::this_thread::sleep_for(std::chrono::seconds(3));
        }
    });

    std::cout << "Press enter to exit this program\n";
    std::cin.ignore();
    quit = true;

    th_clock.join();
    th1.join();
    th2.join();

    return 0;
}