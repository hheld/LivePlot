set(EXE_TARGET testSink)

set(SOURCES_AND_PRIVATE_HEADERS
    src/main.cpp
    )

add_executable(${EXE_TARGET} ${SOURCES_AND_PRIVATE_HEADERS})

set_target_properties(${EXE_TARGET} PROPERTIES
                      CXX_STANDARD 17
                      )

find_package(cppzmq REQUIRED)

target_link_libraries(${EXE_TARGET}
                      PRIVATE
                      logging_obj
                      cppzmq
                      liveplot-sub
                      )

target_include_directories(${EXE_TARGET}
                           PRIVATE
                           src
                           )
