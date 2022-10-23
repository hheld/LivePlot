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

find_package(cppzmq REQUIRED)

set_target_properties(${LIB_NAME} PROPERTIES
                      CXX_STANDARD 17
                      POSITION_INDEPENDENT_CODE ON
                      CXX_VISIBILITY_PRESET hidden
                      VISIBILITY_INLINES_HIDDEN 1
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

# install information ##################################################################################################
install(TARGETS ${LIB_NAME}
        RUNTIME DESTINATION bin
        LIBRARY DESTINATION lib
        ARCHIVE DESTINATION lib
        )

install(DIRECTORY include/ DESTINATION include/${PROJECT_NAME})

install(FILES
        ${CMAKE_CURRENT_BINARY_DIR}/${LIB_NAME}_export.h DESTINATION include/${PROJECT_NAME}
        )

# Python bindings ######################################################################################################

find_package(pybind11 REQUIRED)
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

########################################################################################################################

