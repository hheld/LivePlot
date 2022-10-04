use cmake;
use conan;
use std::env;
use std::path::Path;

fn main() {
    let out_dir = env::var("OUT_DIR").unwrap();
    let target_os = env::var("CARGO_CFG_TARGET_OS");

    println!("cargo:rerun-if-changed=../../lp-cpp/conanfile.txt");

    std::fs::copy(
        "../../lp-cpp/conanfile.txt",
        format!("{}/conanfile.txt", &out_dir),
    )
    .expect("could not copy conanfile.txt");

    let conan_profile = "default";

    let command = conan::InstallCommandBuilder::new()
        .with_profile(conan_profile)
        .build_policy(conan::BuildPolicy::Missing)
        .recipe_path(Path::new(&format!("{}/conanfile.txt", &out_dir)))
        .output_dir(Path::new(&format!("{}/conan", &out_dir)))
        .build();

    if let Some(build_info) = command.generate() {
        println!("using conan build info");
        build_info.cargo_emit();
    }

    let lp_sub_lib = cmake::Config::new("../../lp-cpp/")
        .define(
            "CMAKE_TOOLCHAIN_FILE",
            &format!("{}/build/generators/conan_toolchain.cmake", &out_dir),
        )
        .generator("Ninja")
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
                format!("{}/lib/liveplot-sub.dll", &out_dir),
                format!("{}/../../../liveplot-sub.dll", &out_dir),
            )
            .expect("could not copy libliveplot-sub.so to build folder");
        }
        tos => panic!("unsupported target os {:?}!", tos),
    };

    tauri_build::build()
}
