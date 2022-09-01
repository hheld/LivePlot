#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::ffi::{c_void, CString};
use std::os::raw::c_char;

type Callback = extern "C" fn(x: f64, y: f64);

pub extern "C" fn cb(x: f64, y: f64) {
    println!("got this: ({}, {})!", x, y);
}

extern "C" {
    fn lpNewSubscription(
        connection: *const c_char,
        quantity: *const c_char,
        cb: Callback,
    ) -> *mut c_void;
    fn lpDestroySubscription(sub: *mut c_void);
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn subscribe(quantity: &str) {
    let connection_c_str =
        CString::new("tcp://localhost:12345").expect("could not create Rust string");
    let quantity_c_str = CString::new(quantity).expect("could not create Rust string");

    let _sub = unsafe { lpNewSubscription(connection_c_str.as_ptr(), quantity_c_str.as_ptr(), cb) };
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, subscribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
