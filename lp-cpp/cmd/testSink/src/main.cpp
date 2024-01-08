#include <iostream>
#include <liveplot-sub.h>
#include <logger.h>

int main()
{
    auto *sub1 = lpNewSubscription("ipc:///tmp/lp", "sin", nullptr,
                                   [](double x, double y, const char *quantity, void *) {
                                       fmt::print("got values for {}: ({}, {})\n", quantity, x, y);
                                   });

    auto *sub2 = lpNewSubscription("ipc:///tmp/lp", "cos", nullptr,
                                   [](double x, double y, const char *quantity, void *) {
                                       fmt::print("got values for {}: ({}, {})\n", quantity, x, y);
                                   });

    std::cout << "Press enter to exit this program\n";
    std::cin.ignore();

    lpDestroySubscription(sub1);
    lpDestroySubscription(sub2);

    return 0;
}