import time

import matplotlib.pyplot as plt
from matplotlib.animation import FuncAnimation
from random import randrange
import matplotlib

matplotlib.use("TkAgg")

fig = plt.figure(figsize=(6, 3))
x = [0]
y = [0]

ln, = plt.plot(x, y, "-")
plt.axis([0, 1000, 0, 10])

st = time.time()


def update(frame):
    x.append(x[-1] + 1)
    y.append(randrange(0, 10))

    ln.set_data(x, y)

    if frame == 1000:
        et = time.time()
        print(f"time in seconds: {et - st}")

    return ln


animation = FuncAnimation(fig, update, interval=1)

plt.show()
