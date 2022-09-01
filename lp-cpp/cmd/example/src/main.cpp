#include <liveplot.h>

int main()
{
    lp::LivePlot lp;

    for (auto i = 0; i < 20; ++i)
    {
        lp.plot("test1", i, i);
        lp.plot("test2", -i, -i);
    }

    return 0;
}