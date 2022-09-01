#include <iostream>
#include <liveplot-sub.h>
#include <logger.h>

int main()
{
    auto *sub = lpNewSubscription("test", [](double x, double y) { fmt::print("got values: ({}, {})\n", x, y); });

    std::cout << "Press enter to exit this program\n";
    std::cin.ignore();

    lpDestroySubscription(sub);

    return 0;
}