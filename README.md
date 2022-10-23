# LivePlot

## Idea

What `LivePlot` does is actually pretty simple: It allows you to send pairs of numbers associated with a string
(think of a category or quantity) to be plotted and collected *somewhere else*. That *somewhere else* can be on the
very same machine, or literally somewhere else reachable over a network connection, e.g., an edge device. It should
be as lightweight, easy to integrate, and unobtrusive as possible ... and ideally easy to *disable* if desired in
case it only serves to gather information needed for debugging purposes during development. Think of simulations, or
any kind of data collection application.

## Implementation

To really keep things simple, we don't require anything like an `MQTT` broker running. Instead, we rely on the
pub/sub mechanism of [ZeroMQ](https://zeromq.org/). `LivePlot` consists of the following parts:

1. a C++ library [liveplot](./lp-cpp/lib/liveplot) that can be linked to an application to *produce* data to plot (
   see [example](./lp-cpp/cmd/example/src/main.cpp))
    1. additionally, there is another C++ library, `liveplot-noop`, that simply consists of empy functions and can
       therefore be replaced with the `liveplot` library to completely disable any sending, i.e., plotting of data,
       at any time
    2. a Python module `pyliveplot` (see [example](./examples/liveplot_rtp.py) how to use it in a script)
2. a C++ library [liveplot-sub](./lp-cpp/lib/liveplot-sub) with a plain C interface to subscribe to pairs of data
3. a GUI application (made with the awesome [TAURI](https://tauri.app/) framework), able to connect to such data
   producers and plot it. It also allows to save plots as images, and collected data to CSV file for further processing.
   Again, simplicity here is key. This makes use of the C library of `liveplot-sub`, and also demonstrate how to
   subscribe from [Rust](https://www.rust-lang.org/) code (cf. [main.rs](./live-plotter/src-tauri/src/main.rs)).

## Build

See [compilation instructions](./doc/compile.md) for details how to build this project.

## Example

The following video shows how the [C++ example](./lp-cpp/cmd/example/src/main.cpp) runs first locally, then on a remote
machine, and the `live-plotter` application connects via IPC and TCP, respectively, to plot the produced sample data.

![example](doc/liveplot.webp)

In [examples](./examples), you find two Python scripts that show the usage of the Python binding in comparison to
[matplotlib.animation](https://matplotlib.org/stable/api/animation_api.html). That particular example produces data
in 1ms intervals for 1s; rendering as `matplotlib` real time plot takes about 16 seconds elapsed time, while
`LivePlot` does the same thing without slowing anything down at all.