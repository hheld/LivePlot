#include <liveplot.h>
// #include <thread>

int main()
{
    lp::LivePlot lp;

    for (auto i = 0; i < 200; ++i)
    {
        lp.plot("test", i, i);
        //        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }

    return 0;
}