#include <logger.h>
#include <zmq.hpp>

int main()
{
    zmq::context_t ctx;
    zmq::socket_t  sock(ctx, zmq::socket_type::pull);

    sock.connect("ipc://../../../test");

    while (true)
    {
        zmq::message_t msg;
        (void)sock.recv(msg);

        fmt::print("got message: {}\n", msg.to_string_view());
    }

    return 0;
}