#ifndef LIVEPLOT_SUB_H
#define LIVEPLOT_SUB_H

#include "liveplot-sub_export.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef void *LivePlotSub;
typedef void (*Callback)(double x, double y, void *state);

API_LIVEPLOT_SUB_EXPORT LivePlotSub lpNewSubscription(const char *connection, const char *quantity, void *state,
                                                      Callback cb);
API_LIVEPLOT_SUB_EXPORT void        lpDestroySubscription(LivePlotSub sub);

#ifdef __cplusplus
}
#endif

#endif // LIVEPLOT_SUB_H
