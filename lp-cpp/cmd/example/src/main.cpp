#include <liveplot.h>
#include <thread>

int main()
{
    lp::LivePlot lp;

    for (auto i = 0; i < 20; ++i)
    {
        lp.plot(0.1 * i, 1.2 * i);
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    }

    return 0;
}