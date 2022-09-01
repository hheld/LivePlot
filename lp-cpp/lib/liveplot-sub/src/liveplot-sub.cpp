#include "liveplot-sub.h"
#include "LivePlotSubscription.h"

LivePlotSub lpNewSubscription(const char *connection, const char *quantity, Callback cb)
{
    return static_cast<void *>(new lp::LivePlotSubscription(connection, quantity, cb));
}

void lpDestroySubscription(LivePlotSub sub)
{
    delete static_cast<lp::LivePlotSubscription *>(sub);
}
