cmake_minimum_required(VERSION 3.15)

########################################################################################################################

project(liveplot VERSION 0.0.1 LANGUAGES CXX)

option(BUILD_PYTHON_MODULE "build Python module" OFF)

########################################################################################################################

add_subdirectory(logging)
add_subdirectory(lib)
add_subdirectory(cmd)

add_subdirectory(tests)
enable_testing()

# generate documentation ###############################################################################################
find_package(Doxygen
        OPTIONAL_COMPONENTS mscgen dot)

if (DOXYGEN_FOUND)
    doxygen_add_docs(
            doxygen
            ${PROJECT_SOURCE_DIR}
            COMMENT "Generate API documentation"
    )
endif (DOXYGEN_FOUND)

# install #############################################################################################################
install(EXPORT liveplotTargets
        FILE liveplotTargets.cmake
        NAMESPACE liveplot::
        DESTINATION lib/cmake/liveplot
)

include(CMakePackageConfigHelpers)

configure_package_config_file(${CMAKE_CURRENT_SOURCE_DIR}/Config.cmake.in
        "${CMAKE_CURRENT_BINARY_DIR}/liveplotConfig.cmake"
        INSTALL_DESTINATION "lib/cmake/liveplot"
        NO_SET_AND_CHECK_MACRO
        NO_CHECK_REQUIRED_COMPONENTS_MACRO
)

write_basic_package_version_file(
        "${CMAKE_CURRENT_BINARY_DIR}/liveplotConfigVersion.cmake"
        VERSION ${CMAKE_PROJECT_VERSION}
        COMPATIBILITY AnyNewerVersion
)

install(FILES
        ${CMAKE_CURRENT_BINARY_DIR}/liveplotConfig.cmake
        ${CMAKE_CURRENT_BINARY_DIR}/liveplotConfigVersion.cmake
        DESTINATION lib/cmake/liveplot
)
