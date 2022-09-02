#include <iostream>
#include <liveplot-sub.h>
#include <logger.h>

int main()
{
    auto *sub1 = lpNewSubscription("tcp://localhost:12345", "test1", nullptr, [](double x, double y, void *) {
        fmt::print("got values for test1: ({}, {})\n", x, y);
    });

    auto *sub2 = lpNewSubscription("tcp://localhost:12345", "test2", nullptr, [](double x, double y, void *) {
        fmt::print("got values for test2: ({}, {})\n", x, y);
    });

    std::cout << "Press enter to exit this program\n";
    std::cin.ignore();

    lpDestroySubscription(sub1);
    lpDestroySubscription(sub2);

    return 0;
}