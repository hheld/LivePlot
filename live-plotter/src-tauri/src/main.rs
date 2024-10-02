#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use base64::Engine;
use polars::functions::concat_df_diagonal;
use polars::prelude::*;
use regex::Regex;
use std::collections::{HashMap, HashSet};
use std::ffi::{c_void, CStr, CString};
use std::fs::File;
use std::io::prelude::*;
use std::os::raw::c_char;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State, Wry};

type Callback = extern "C" fn(x: f64, y: f64, quantity: *const c_char, state: *mut c_void);

struct RawPointer(*mut c_void);
unsafe impl Send for RawPointer {}

#[derive(Clone, serde::Serialize)]
struct EventPayload {
    x: f64,
    y: f64,
    quantity: String,
    connection: String,
}

#[derive(Clone, serde::Serialize)]
struct QuantityPayload {
    quantity: String,
    connection: String,
}

#[derive(Clone, serde::Serialize)]
struct KnownQuantityPayload {
    quantity: String,
    subscribed: bool,
}

extern "C" fn cb(x: f64, y: f64, quantity: *const c_char, state: *mut c_void) {
    let state_ptr = state as *mut CallbackData;

    let quantity_rs_str = {
        let c_str = unsafe { CStr::from_ptr(quantity) };
        c_str.to_str().unwrap().to_owned()
    };

    let state = unsafe { state_ptr.as_ref().unwrap() };

    state
        .app_handle
        .emit(
            "data",
            EventPayload {
                x,
                y,
                quantity: quantity_rs_str,
                connection: state.connection.clone(),
            },
        )
        .unwrap();
}

extern "C" fn cb_all(_x: f64, _y: f64, quantity: *const c_char, state: *mut c_void) {
    let state_ptr = state as *mut CallbackData;

    let state = unsafe { state_ptr.as_ref().unwrap() };

    let quantity_rs_str = {
        let c_str = unsafe { CStr::from_ptr(quantity) };
        c_str.to_str().unwrap().to_owned()
    };

    let app_state: State<'_, AppState> = state.app_handle.state();
    let mut connections = app_state.connections.lock().unwrap();
    let known_quantities = &mut connections.get_mut(&state.connection).unwrap().quantities;

    if known_quantities.insert(quantity_rs_str.clone()) {
        state
            .app_handle
            .emit(
                "newQuantity",
                QuantityPayload {
                    quantity: quantity_rs_str,
                    connection: state.connection.clone(),
                },
            )
            .unwrap();
    }
}

struct CallbackData {
    app_handle: AppHandle<Wry>,
    connection: String,
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
    connections: Mutex<HashMap<String, Connection>>,
}

struct Connection {
    subscriptions: HashMap<String, SubscriptionData>,
    quantities: HashSet<String>,
}

struct SubscriptionData {
    raw_sub: RawPointer,
    raw_cb_data: RawPointer,
}

#[tauri::command]
fn subscribe(
    connection: &str,
    quantity: &str,
    app_state: State<'_, AppState>,
    app_handle: AppHandle<Wry>,
) {
    let mut connections = app_state.connections.lock().unwrap();
    let subscriptions = &mut connections.get_mut(connection).unwrap().subscriptions;

    if subscriptions.contains_key(quantity) {
        println!(
            "already subscribed to '{}' for connection '{}'",
            quantity, connection
        );
        return;
    }

    let connection_c_str = CString::new(connection).expect("could not create Rust string");
    let quantity_c_str = CString::new(quantity).expect("could not create Rust string");

    let cb_data_raw = {
        let cb_data = Box::new(CallbackData {
            app_handle,
            connection: connection.into(),
        });
        Box::into_raw(cb_data) as *mut c_void
    };

    let sub = unsafe {
        lpNewSubscription(
            connection_c_str.as_ptr(),
            quantity_c_str.as_ptr(),
            cb_data_raw,
            cb,
        )
    };

    subscriptions.insert(
        quantity.into(),
        SubscriptionData {
            raw_sub: RawPointer(sub),
            raw_cb_data: RawPointer(cb_data_raw),
        },
    );
}

#[tauri::command]
fn unsubscribe(connection: &str, quantity: &str, app_state: State<'_, AppState>) {
    let mut connections = app_state.connections.lock().unwrap();
    let subscriptions = &mut connections.get_mut(connection).unwrap().subscriptions;

    if !subscriptions.contains_key(quantity) {
        println!(
            "not subscribed to '{}' for connection '{}'",
            quantity, connection
        );
        return;
    }

    let sub_data = &subscriptions[quantity];

    unsafe { lpDestroySubscription(sub_data.raw_sub.0) };
    unsafe {
        drop(Box::<CallbackData>::from_raw(
            sub_data.raw_cb_data.0 as *mut _,
        ))
    };

    subscriptions.remove(quantity);
}

#[tauri::command]
fn known_quantities(connection: &str, app_state: State<'_, AppState>) -> Vec<KnownQuantityPayload> {
    let connections = app_state.connections.lock().unwrap();

    let matching_connection = &connections[connection];

    let known_quantities = &matching_connection.quantities;
    let subscriptions = &matching_connection.subscriptions;

    Vec::from_iter(known_quantities.iter().map(|s| KnownQuantityPayload {
        quantity: s.clone(),
        subscribed: subscriptions.contains_key(s),
    }))
}

const RE_VALID_ZMQ_CONNECTION: &'static str = r"^(?:tcp://(.+):\d+|ipc://(.+))$";

#[tauri::command]
fn connect(
    connection: &str,
    app_state: State<'_, AppState>,
    app_handle: AppHandle<Wry>,
) -> Result<(), String> {
    let re = Regex::new(RE_VALID_ZMQ_CONNECTION).unwrap();

    if !re.is_match(connection) {
        eprintln!(
            "'{}' is not a valid connection string, cannot connect to it",
            connection
        );
        return Err("invalid connection string".into());
    }

    let mut connections = app_state.connections.lock().unwrap();

    if connections.contains_key(connection) {
        println!("already connected to '{}'", connection);
        return Ok(());
    }

    let mut new_connection = Connection {
        subscriptions: HashMap::new(),
        quantities: HashSet::new(),
    };

    let connection_c_str = CString::new(connection).expect("could not create Rust string");
    let quantity_c_str = CString::new("").expect("could not create Rust string");

    let cb_data = Box::new(CallbackData {
        app_handle,
        connection: connection.into(),
    });
    let cb_data_raw = Box::into_raw(cb_data) as *mut c_void;

    let sub = unsafe {
        lpNewSubscription(
            connection_c_str.as_ptr(),
            quantity_c_str.as_ptr(),
            cb_data_raw,
            cb_all,
        )
    };

    new_connection.subscriptions.insert(
        "".into(),
        SubscriptionData {
            raw_sub: RawPointer(sub),
            raw_cb_data: RawPointer(cb_data_raw),
        },
    );

    connections.insert(connection.into(), new_connection);

    Ok(())
}

#[tauri::command]
fn disconnect(connection: &str, app_state: State<'_, AppState>) {
    let mut connections = app_state.connections.lock().unwrap();

    if !connections.contains_key(connection) {
        eprintln!("not connected to '{}', cannot disconnect", connection);
        return;
    }

    if let Some(mut connection_to_be_removed) = connections.remove(connection) {
        // unsubscribe from everything
        for (_, sub_data) in &connection_to_be_removed.subscriptions {
            unsafe { lpDestroySubscription(sub_data.raw_sub.0) };
            unsafe {
                drop(Box::<CallbackData>::from_raw(
                    sub_data.raw_cb_data.0 as *mut _,
                ))
            };
        }

        connection_to_be_removed.subscriptions.clear();
    }
}

#[tauri::command]
fn write_plot_image(file_name: &str, base64_encoded_image: &str) -> Result<(), String> {
    if let Ok(b) = base64::engine::general_purpose::STANDARD.decode(base64_encoded_image) {
        if let Ok(mut file) = File::create(file_name) {
            match file.write_all(&b) {
                Err(err) => return Err(err.to_string()),
                _ => (),
            }
        } else {
            return Err("could not write file".to_string());
        }
    } else {
        return Err("could not decode the image".to_string());
    }

    Ok(())
}

#[derive(serde::Deserialize)]
struct CsvData {
    label: String,
    x: Vec<f64>,
    y: Vec<f64>,
}

#[tauri::command]
fn write_data_csv(file_name: &str, data: Vec<CsvData>) -> Result<(), String> {
    let mut file = match File::create(file_name) {
        Ok(file) => file,
        Err(err) => return Err(err.to_string()),
    };

    let all_dfs = data
        .iter()
        .map(|d| {
            df![
                "x" => &d.x,
                &d.label => &d.y
            ]
            .unwrap()
        })
        .collect::<Vec<DataFrame>>();

    let mut merged_frames = match concat_df_diagonal(&all_dfs).unwrap().sort(
        ["x"],
        SortMultipleOptions::new()
            .with_order_descending(false)
            .with_maintain_order(true),
    ) {
        Ok(merged_frames) => merged_frames,
        Err(err) => return Err(err.to_string()),
    };

    if let Err(err) = CsvWriter::new(&mut file)
        .include_header(true)
        .with_separator(b'\t')
        .finish(&mut merged_frames)
    {
        return Err(err.to_string());
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            connections: Mutex::new(HashMap::new()),
        })
        .invoke_handler(tauri::generate_handler![
            subscribe,
            unsubscribe,
            known_quantities,
            connect,
            disconnect,
            write_plot_image,
            write_data_csv,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
