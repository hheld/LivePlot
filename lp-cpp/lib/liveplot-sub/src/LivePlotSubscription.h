#pragma once

#include <atomic>
#include <functional>
#include <memory>
#include <string>
#include <thread>

namespace spdlog
{
class logger;
}

namespace zmq
{
class context_t;
} // namespace zmq

namespace lp
{

class LivePlotSubscription final
{
public:
    LivePlotSubscription(std::string connection, std::string quantity, void *state,
                         std::function<void(double, double, void *)> &&cb);
    ~LivePlotSubscription();

private:
    const std::string quantity_;
    const std::string connection_;
    void             *state_;

    std::shared_ptr<spdlog::logger> log_;
    std::unique_ptr<zmq::context_t> ctx_;

    std::function<void(double, double, void *)> cb_;

    std::atomic<bool> quit_{ false };
    std::thread       listenThread_;

    void startListening() const;
};

} // namespace lp
