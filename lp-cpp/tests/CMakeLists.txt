set(TEST_FILES
    logger_test.cpp
    )

########################################################################################################################
set(TEST_TARGET ${PROJECT_NAME}_tests)

add_executable(${TEST_TARGET} ${TEST_FILES})
set_target_properties(${TEST_TARGET} PROPERTIES CXX_STANDARD 17)

enable_testing()

find_package(Catch2)

target_link_libraries(${TEST_TARGET}
                      PRIVATE
                      Catch2::Catch2WithMain
                      logging_obj
                      )

include(Catch)
catch_discover_tests(${TEST_TARGET})
