cmake_minimum_required(VERSION 3.15)

########################################################################################################################

project(liveplot VERSION 0.0.1 LANGUAGES CXX)

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
