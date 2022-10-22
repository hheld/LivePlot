#ifndef LIVEPLOT_SUB_H
#define LIVEPLOT_SUB_H

#include "liveplot-sub_export.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef void *LivePlotSub;

/**
 * Callback o inform the subscriber about new values (x, y) for \a quantity. \a state is passed on as well.
 */
typedef void (*Callback)(double x, double y, const char *quantity, void *state);

/**
 * Subscribe to a quantity on a connection. \a state can be anything; nothing is done with it internally, it is just
 * passed on to the callback \a cb.
 * @param connection connection string to connect to (ipc://<path>/<to>/<pipe>, tpc://<host>:<port>)
 * @param quantity topic to listen for and subscribe to
 * @param state anything; it is passed to the callback \a cb on each call
 * @param cb callback called to notify subscribers about new data
 * @return
 */
API_LIVEPLOT_SUB_EXPORT LivePlotSub lpNewSubscription(const char *connection, const char *quantity, void *state,
                                                      Callback cb);
API_LIVEPLOT_SUB_EXPORT void        lpDestroySubscription(LivePlotSub sub);

#ifdef __cplusplus
}
#endif

#endif // LIVEPLOT_SUB_H
