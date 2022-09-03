#include <iostream>
#include <liveplot-sub.h>
#include <logger.h>

int main()
{
    auto *sub1 = lpNewSubscription("tcp://localhost:12345", "sin", nullptr, [](double x, double y, void *) {
        fmt::print("got values for sin: ({}, {})\n", x, y);
    });

    auto *sub2 = lpNewSubscription("tcp://localhost:12345", "cos", nullptr, [](double x, double y, void *) {
        fmt::print("got values for cos: ({}, {})\n", x, y);
    });

    std::cout << "Press enter to exit this program\n";
    std::cin.ignore();

    lpDestroySubscription(sub1);
    lpDestroySubscription(sub2);

    return 0;
}