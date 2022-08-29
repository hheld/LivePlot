#include <liveplot.h>
#include <thread>

int main()
{
    lp::LivePlot lp;

    while (true)
    {
        lp.plot(0.1, 1.2);
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    }

    return 0;
}