set(SOURCES_AND_PRIVATE_HEADERS
    src/logger.cpp
    )

set(PUBLIC_HEADERS
    include/logger.h
    )

add_library(logging_obj OBJECT ${PUBLIC_HEADERS} ${SOURCES_AND_PRIVATE_HEADERS})

set_target_properties(logging_obj PROPERTIES
                      CXX_STANDARD 17
                      POSITION_INDEPENDENT_CODE ON
                      )

find_package(spdlog)

target_link_libraries(logging_obj
                      PUBLIC
                      spdlog::spdlog
                      )

target_include_directories(logging_obj
                           PUBLIC
                           $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
                           $<INSTALL_INTERFACE:include/${PROJECT_NAME}>

                           PRIVATE
                           src
                           )
