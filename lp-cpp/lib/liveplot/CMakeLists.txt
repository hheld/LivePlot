set(LIB_NAME liveplot)

set(SOURCES_AND_PRIVATE_HEADERS
        src/liveplot.cpp
)

set(PUBLIC_HEADERS
        include/liveplot.h
)

add_library(${LIB_NAME} SHARED ${PUBLIC_HEADERS} ${SOURCES_AND_PRIVATE_HEADERS})

include(GenerateExportHeader)
generate_export_header(${LIB_NAME} PREFIX_NAME API_)

set(PUBLIC_HEADERS ${PUBLIC_HEADERS} ${CMAKE_CURRENT_BINARY_DIR}/${LIB_NAME}_export.h)

find_package(cppzmq REQUIRED)

set_target_properties(${LIB_NAME} PROPERTIES
        CXX_STANDARD 17
        POSITION_INDEPENDENT_CODE ON
        CXX_VISIBILITY_PRESET hidden
        VISIBILITY_INLINES_HIDDEN 1
        PUBLIC_HEADER "${PUBLIC_HEADERS}"
)

target_link_libraries(${LIB_NAME}
        PRIVATE
        logging_obj
        cppzmq
)

target_include_directories(${LIB_NAME}
        PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}>
        $<INSTALL_INTERFACE:include/${PROJECT_NAME}>

        PRIVATE
        src
)

# No-op library ########################################################################################################

add_library(${LIB_NAME}-noop SHARED ${PUBLIC_HEADERS} src/liveplot-noop.cpp)

set_target_properties(${LIB_NAME}-noop PROPERTIES
        CXX_STANDARD 17
        POSITION_INDEPENDENT_CODE ON
        CXX_VISIBILITY_PRESET hidden
        VISIBILITY_INLINES_HIDDEN 1
        PUBLIC_HEADER "${PUBLIC_HEADERS}"
)

target_link_libraries(${LIB_NAME}-noop
        PRIVATE
        logging_obj
)

target_include_directories(${LIB_NAME}-noop
        PUBLIC
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}>
        $<INSTALL_INTERFACE:include/${PROJECT_NAME}>

        PRIVATE
        src
)

# install information ##################################################################################################

install(TARGETS ${LIB_NAME} ${LIB_NAME}-noop
        EXPORT liveplotTargets
        RUNTIME DESTINATION bin
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib
        PUBLIC_HEADER DESTINATION include/${PROJECT_NAME}
)

# Python bindings ######################################################################################################

find_package(Python COMPONENTS Development Interpreter)
find_package(pybind11 CONFIG REQUIRED)
pybind11_add_module(py${LIB_NAME} $<TARGET_OBJECTS:${LIB_NAME}> src/pyliveplot.cpp)

set_target_properties(py${LIB_NAME} PROPERTIES
        CXX_STANDARD 17
        POSITION_INDEPENDENT_CODE ON
        CXX_VISIBILITY_PRESET hidden
        VISIBILITY_INLINES_HIDDEN 1
)

target_include_directories(py${LIB_NAME}
        PRIVATE
        $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
        $<BUILD_INTERFACE:${CMAKE_CURRENT_BINARY_DIR}>
        src
)

target_link_libraries(py${LIB_NAME}
        PRIVATE
        logging_obj
        cppzmq
)
