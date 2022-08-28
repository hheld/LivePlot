set(EXE_TARGET example)

set(SOURCES_AND_PRIVATE_HEADERS
    src/main.cpp
    )

add_executable(${EXE_TARGET} ${SOURCES_AND_PRIVATE_HEADERS})

set_target_properties(${EXE_TARGET} PROPERTIES
                      CXX_STANDARD 17
                      )

target_link_libraries(${EXE_TARGET}
                      PRIVATE
                      logging_obj
                      liveplot
                      )

target_include_directories(${EXE_TARGET}
                           PRIVATE
                           src
                           )

# install information ##################################################################################################
install(TARGETS ${EXE_TARGET}
        RUNTIME DESTINATION bin
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib
        )
