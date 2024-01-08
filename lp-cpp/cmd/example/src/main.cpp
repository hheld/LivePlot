#include <atomic>
#include <cmath>
#include <condition_variable>
#include <iostream>
#include <liveplot.h>
#include <thread>

#include <logger.h>

int main(int argc, const char *argv[])
{
    if (argc != 4)
    {
        fmt::print(stderr, "Usage: {} <connection> <base time step in seconds> <max. num time iterations>\n", argv[0]);
        return 1;
    }

    auto logger = logging::logger("example");

    lp::LivePlot lp(argv[1]);

    std::atomic<bool> quit{ false };
    double            t                = 0;
    const auto        tStep            = std::stod(argv[2]);
    const auto        maxNumIterations = std::stoi(argv[3]);

    std::mutex              mtx;
    std::condition_variable cv_sin;
    std::condition_variable cv_cos;
    std::condition_variable cv_func;

    auto th_clock = std::thread([&t, &quit, logger, &cv_sin, &cv_cos, &cv_func, tStep, maxNumIterations] {
        unsigned int stepCounter = 0;

        while (!quit)
        {
            //            logger->info("time: {} seconds", t);
            std::this_thread::sleep_for(std::chrono::milliseconds(static_cast<int64_t>(1000. * tStep)));
            t += tStep;

            // plot sin on every time step
            cv_sin.notify_all();

            // plot cos every 3rd time step
            if (stepCounter % 3 == 0)
            {
                cv_cos.notify_all();
            }

            // plot func every 4th time step
            if (stepCounter % 4 == 0)
            {
                cv_func.notify_all();
            }

            ++stepCounter;

            if (stepCounter == maxNumIterations)
            {
                quit = true;
            }
        }

        cv_sin.notify_all();
        cv_cos.notify_all();
        cv_func.notify_all();
    });

    auto th1 = std::thread([&lp, &t, &quit, logger, &mtx, &cv_sin] {
        while (!quit)
        {
            std::unique_lock lock(mtx);
            cv_sin.wait(lock);

            logger->info("sending sin({})", t);
            lp.plot("sin", t, sin(t));
        }
    });

    auto th2 = std::thread([&lp, &t, &quit, logger, &mtx, &cv_cos] {
        while (!quit)
        {
            std::unique_lock lock(mtx);
            cv_cos.wait(lock);

            logger->info("sending cos({})", t);
            lp.plot("cos", t, cos(t));
        }
    });

    auto th3 = std::thread([&lp, &t, &quit, logger, &mtx, &cv_func] {
        while (!quit)
        {
            std::unique_lock lock(mtx);
            cv_func.wait(lock);

            logger->info("sending func({})", t);
            lp.plot("func", t, sin(0.01 * t) * exp(sin(t) + tanh(cos(t))));
        }
    });

    th_clock.join();
    th1.join();
    th2.join();
    th3.join();

    return 0;
}