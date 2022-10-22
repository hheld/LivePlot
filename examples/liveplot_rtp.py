import sys
import time
from random import randrange

sys.path.append("../lp-cpp/build/Release/lib/liveplot")

import pyliveplot as lpl

st = time.time()

lp = lpl.LivePlot("ipc:///tmp/lp")

for x in range(1000):
    lp.plot("random", x, randrange(0, 10))
    time.sleep(0.001)

et = time.time()

print(f"time in seconds: {et - st}")
