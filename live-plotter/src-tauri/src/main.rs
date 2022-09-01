#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::ffi::c_void;
use std::os::raw::c_char;

type Callback = extern "C" fn(x: f64, y: f64);

pub extern "C" fn cb(x: f64, y: f64) {
    println!("got this: ({}, {})", x, y);
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
    let _sub = unsafe {
        lpNewSubscription(
            "tcp://localhost:12345".as_ptr() as *const c_char,
            quantity.as_ptr() as *const c_char,
            cb,
        )
    };
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet, subscribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
