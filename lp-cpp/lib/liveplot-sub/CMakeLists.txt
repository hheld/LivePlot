set(LIB_NAME liveplot-sub)

set(SOURCES_AND_PRIVATE_HEADERS
    src/liveplot-sub.cpp
    src/LivePlotSubscription.cpp
    src/LivePlotSubscription.h)

set(PUBLIC_HEADERS
    include/liveplot-sub.h
    )

add_library(${LIB_NAME} SHARED ${PUBLIC_HEADERS} ${SOURCES_AND_PRIVATE_HEADERS})

include(GenerateExportHeader)
generate_export_header(${LIB_NAME} PREFIX_NAME API_)

find_package(cppzmq REQUIRED)
find_package(nlohmann_json REQUIRED)

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
                      nlohmann_json::nlohmann_json
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
