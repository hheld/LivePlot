#include <liveplot.h>

int main()
{
    lp::LivePlot lp;

    for (auto i = 0; i < 20; ++i)
    {
        lp.plot("test", i, i);
    }

    return 0;
}