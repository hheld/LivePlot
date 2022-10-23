set(EXE_TARGET example)

set(SOURCES_AND_PRIVATE_HEADERS
    src/main.cpp
    )

add_executable(${EXE_TARGET} ${SOURCES_AND_PRIVATE_HEADERS})
add_executable(${EXE_TARGET}-noop ${SOURCES_AND_PRIVATE_HEADERS})

set_target_properties(${EXE_TARGET} ${EXE_TARGET}-noop PROPERTIES
                      CXX_STANDARD 17
                      )

target_link_libraries(${EXE_TARGET}
                      PRIVATE
                      logging_obj
                      liveplot
                      )

target_link_libraries(${EXE_TARGET}-noop
                      PRIVATE
                      logging_obj
                      liveplot-noop
                      )
