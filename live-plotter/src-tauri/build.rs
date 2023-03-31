use cmake;
use std::env;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();
    let src_dir_path = std::path::PathBuf::from(".");
    let abs_src_dir = std::fs::canonicalize(&src_dir_path).unwrap();
    let src_dir = abs_src_dir.to_str().unwrap();
    let target_os = env::var("CARGO_CFG_TARGET_OS");

    let lp_sub_lib = cmake::Config::new("../../lp-cpp/")
        .define(
            "CMAKE_TOOLCHAIN_FILE",
            format!("{}/target/vcpkg/scripts/buildsystems/vcpkg.cmake", src_dir),
        )
        .build();

    println!("cargo:rerun-if-changed=../../lp-cpp/lib/liveplot-sub");
    println!(
        "cargo:rustc-link-search=native={}/lib",
        lp_sub_lib.display()
    );
    println!("cargo:rustc-link-lib=dylib=liveplot-sub");

    match target_os.as_ref().map(|x| &**x) {
        Ok("linux") => {
            let home_dir = env::var("HOME").unwrap();

            std::fs::copy(
                format!("{}/lib/libliveplot-sub.so", &out_dir),
                format!("{}/.local/lib/libliveplot-sub.so", &home_dir),
            )
            .expect("could not copy libliveplot-sub.so to user's lib folder");

            // this makes bundling as a Debian package easier
            std::fs::copy(
                format!("{}/lib/libliveplot-sub.so", &out_dir),
                format!("{}/../../../libliveplot-sub.so", &out_dir),
            )
            .expect("could not copy libliveplot-sub.so to build folder");
        }
        Ok("windows") => {
            // this makes bundling as an MSI installer easier
            std::fs::copy(
                format!("{}/bin/liveplot-sub.dll", &out_dir),
                format!("{}/../../../liveplot-sub.dll", &out_dir),
            )
            .expect("could not copy liveplot-sub.dll to build folder");
        }
        tos => panic!("unsupported target os {:?}!", tos),
    };

    tauri_build::build()
}
