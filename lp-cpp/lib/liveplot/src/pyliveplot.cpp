#include <pybind11/pybind11.h>

#include "liveplot.h"

namespace py = pybind11;

PYBIND11_MODULE(pyliveplot, m)
{
    py::class_<lp::LivePlot>(m, "LivePlot").def(py::init<std::string>()).def("plot", &lp::LivePlot::plot);
}