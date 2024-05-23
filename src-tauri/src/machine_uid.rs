use machine_uid;

#[tauri::command]
pub fn get_machine_uid() -> String {
    machine_uid::get().unwrap().to_string()
}