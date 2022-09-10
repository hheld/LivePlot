#include <atomic>
#include <cmath>
#include <condition_variable>
#include <iostream>
#include <liveplot.h>
#include <thread>

#include <logger.h>

int main()
{
    auto logger = logging::logger("example");

    lp::LivePlot lp;

    std::atomic<bool> quit{ false };
    double            t     = 0;
    constexpr auto    tStep = 0.2;

    std::mutex              mtx;
    std::condition_variable cv;

    auto th_clock = std::thread([&t, &quit, logger, &cv] {
        while (!quit)
        {
            logger->info("time: {} seconds", t);
            std::this_thread::sleep_for(std::chrono::milliseconds(static_cast<int64_t>(1000. * tStep)));
            t += tStep;
            cv.notify_all();
        }
    });

    auto th1 = std::thread([&lp, &t, &quit, logger, &mtx, &cv] {
        while (!quit)
        {
            std::unique_lock lock(mtx);
            cv.wait(lock);

            logger->info("sending sin({})", t);
            lp.plot("sin", t, sin(t));
        }
    });

    auto th2 = std::thread([&lp, &t, &quit, logger, &mtx, &cv] {
        while (!quit)
        {
            std::unique_lock lock(mtx);
            cv.wait(lock);

            logger->info("sending cos({})", t);
            lp.plot("cos", t, cos(t));
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