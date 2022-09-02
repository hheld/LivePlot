#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::ffi::{c_void, CString};
use std::os::raw::c_char;
use std::sync::Mutex;
use tauri::State;

type Callback = extern "C" fn(x: f64, y: f64);

struct RawPointer(*mut c_void);
unsafe impl Send for RawPointer {}

extern "C" fn cb(x: f64, y: f64) {
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

struct AppState {
    subscriptions: Mutex<HashMap<String, RawPointer>>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn subscribe(quantity: &str, app_state: State<'_, AppState>) {
    let mut subscriptions = app_state.subscriptions.lock().unwrap();

    if subscriptions.contains_key(quantity) {
        println!("already subscribed to '{}'", quantity);
        return;
    }

    let connection_c_str =
        CString::new("tcp://localhost:12345").expect("could not create Rust string");
    let quantity_c_str = CString::new(quantity).expect("could not create Rust string");

    let sub = unsafe { lpNewSubscription(connection_c_str.as_ptr(), quantity_c_str.as_ptr(), cb) };

    subscriptions.insert(quantity.into(), RawPointer(sub));
}

#[tauri::command]
fn unsubscribe(quantity: &str, app_state: State<'_, AppState>) {
    let mut subscriptions = app_state.subscriptions.lock().unwrap();

    if !subscriptions.contains_key(quantity) {
        println!("not subscribed to '{}'", quantity);
        return;
    }

    unsafe { lpDestroySubscription(subscriptions[quantity].0) };

    subscriptions.remove(quantity);
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            subscriptions: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![greet, subscribe, unsubscribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
