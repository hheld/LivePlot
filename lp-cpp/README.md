# Install or update dependencies

```shell
conan install . -c tools.cmake.cmaketoolchain.presets:max_schema_version=2 -c tools.cmake.cmaketoolchain:generator=Ninja -if build/conan --build=missing -s build_type=Debug -pr:b=default
conan install . -c tools.cmake.cmaketoolchain.presets:max_schema_version=2 -c tools.cmake.cmaketoolchain:generator=Ninja -if build/conan --build=missing -s build_type=Release -pr:b=default
```