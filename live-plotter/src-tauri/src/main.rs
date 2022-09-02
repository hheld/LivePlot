#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::collections::HashMap;
use std::ffi::{c_void, CString};
use std::os::raw::c_char;
use std::sync::Mutex;
use tauri::{AppHandle, Manager, State, Wry};

type Callback = extern "C" fn(x: f64, y: f64, state: *mut c_void);

struct RawPointer(*mut c_void);
unsafe impl Send for RawPointer {}

#[derive(Clone, serde::Serialize)]
struct EventPayload {
    x: f64,
    y: f64,
    quantity: String,
}

extern "C" fn cb(x: f64, y: f64, state: *mut c_void) {
    let state_ptr = state as *mut CallbackData;

    let state = unsafe { state_ptr.as_ref().unwrap() };
    state
        .app_handle
        .emit_all(
            "data",
            EventPayload {
                x,
                y,
                quantity: state.quantity.clone(),
            },
        )
        .unwrap();
}

struct CallbackData {
    quantity: String,
    app_handle: AppHandle<Wry>,
}

extern "C" {
    fn lpNewSubscription(
        connection: *const c_char,
        quantity: *const c_char,
        state: *mut c_void,
        cb: Callback,
    ) -> *mut c_void;
    fn lpDestroySubscription(sub: *mut c_void);
}

struct AppState {
    subscriptions: Mutex<HashMap<String, RawPointer>>,
    callback_data: Mutex<HashMap<String, RawPointer>>,
}

#[tauri::command]
fn subscribe(quantity: &str, app_state: State<'_, AppState>, app_handle: AppHandle<Wry>) {
    let mut subscriptions = app_state.subscriptions.lock().unwrap();

    if subscriptions.contains_key(quantity) {
        println!("already subscribed to '{}'", quantity);
        return;
    }

    let connection_c_str =
        CString::new("tcp://localhost:12345").expect("could not create Rust string");
    let quantity_c_str = CString::new(quantity).expect("could not create Rust string");

    let cb_data = Box::new(CallbackData {
        app_handle,
        quantity: quantity.to_string(),
    });

    let cb_data_raw = Box::into_raw(cb_data) as *mut c_void;

    let sub = unsafe {
        lpNewSubscription(
            connection_c_str.as_ptr(),
            quantity_c_str.as_ptr(),
            cb_data_raw,
            cb,
        )
    };

    subscriptions.insert(quantity.into(), RawPointer(sub));

    let mut callback_data = app_state.callback_data.lock().unwrap();
    callback_data.insert(quantity.into(), RawPointer(cb_data_raw));
}

#[tauri::command]
fn unsubscribe(quantity: &str, app_state: State<'_, AppState>) {
    let mut subscriptions = app_state.subscriptions.lock().unwrap();

    if !subscriptions.contains_key(quantity) {
        println!("not subscribed to '{}'", quantity);
        return;
    }

    let mut callback_data = app_state.callback_data.lock().unwrap();

    unsafe { lpDestroySubscription(subscriptions[quantity].0) };
    unsafe { Box::<CallbackData>::from_raw(callback_data[quantity].0 as *mut _) };

    subscriptions.remove(quantity);
    callback_data.remove(quantity);
}

fn main() {
    tauri::Builder::default()
        .manage(AppState {
            subscriptions: Mutex::new(HashMap::new()),
            callback_data: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![subscribe, unsubscribe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
