#include <logger.h>
#include <zmq.hpp>

int main()
{
    zmq::context_t ctx;
    zmq::socket_t  sock(ctx, zmq::socket_type::sub);

    sock.connect("ipc://../../../test");
    sock.set(zmq::sockopt::subscribe, "");

    while (true)
    {
        zmq::message_t address;
        (void)sock.recv(address);

        zmq::message_t msg;
        (void)sock.recv(msg);

        fmt::print("got message: {} for {}\n", msg.to_string_view(), address.to_string_view());
    }

    return 0;
}