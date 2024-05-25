#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    api::{
        path::{app_data_dir, app_dir},
        shell::{self, open},
    },
    http::header::{ACCEPT, USER_AGENT},
};
mod machine_uid;
use std::{fs::File, io::Write};
use tauri::Manager;

use serde::Deserialize;
use serde::Serialize;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Progress {
    pub filesize: u64,
    pub transfered: u64,
    pub transfer_rate: f64,
    pub percentage: f64,
}
use tauri::AppHandle;

impl Progress {
    pub fn emit_progress(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_PROGRESS", &self).ok();
    }

    pub fn emit_finished(&self, handle: &AppHandle) {
        handle.emit_all("DOWNLOAD_FINISHED", &self).ok();
    }
}

use std::fs;
use std::time::Instant;

use futures::StreamExt;
use reqwest::Client;
// use std::fs::File;
// use std::time::Instant;
use tokio::runtime::Runtime;

#[tauri::command]
async fn download_file_custom(app: AppHandle, url: String, path: String) -> Result<(), String> {
    let dir = app
        .path_resolver()
        .app_data_dir()
        .expect("Failed to get data dir");

    let start_time = Instant::now();
    let client = Client::new();
    let res = client
        .get(&url)
        .header(
            USER_AGENT,
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0",
        )
        .header(ACCEPT, "application/octet-stream")
        .send()
        .await
        .or(Err(format!("解析 `{}` 文件失败", &url)))?;

    let total_size = res
        .content_length()
        .ok_or(format!("获取 `{}` 文件大小失败", &url))?;

    let mut progress = Progress {
        filesize: total_size,
        transfered: 0,
        transfer_rate: 0.0,
        percentage: 0.0,
    };

    // 如果目录不存在则创建
    if !dir.exists() {
        fs::create_dir_all(&dir).or(Err(format!("创建 `{}` 目录失败", &dir.to_string_lossy())))?;
    }

    // 存放在 app_data_dir 目录下
    let mut file = fs::File::create(dir.join(&path)).or(Err(format!(
        "创建 `{}` 文件失败",
        &dir.join(&path).to_string_lossy()
    )))?;

    // 打印位置
    println!("dir => {:?}", dir);

    let mut downloaded: u64 = 0;
    let mut stream = res.bytes_stream();

    let mut count = 0;
    loop {
        let item_result = stream.next().await;
        if let Some(item) = item_result {
            let chunk = item.or_else(|err| {
                println!("下载 `{}` 文件失败: {}", &path, err);
                Err(format!("下载 `{}` 文件失败", &path))
            })?;

            if let Err(err) = file.write(&chunk) {
                println!("写入 `{}` 文件失败: {}", &path, err);
                return Err(format!("写入 `{}` 文件失败", &path));
            }

            downloaded = std::cmp::min(downloaded + (chunk.len() as u64), total_size);
            progress.transfered = downloaded;
            progress.percentage = downloaded as f64 / total_size as f64;

            // 尝试发送进度更新,如果失败则打印错误信息
            count += 1;
            if (count % 30 == 29) {
                progress.emit_progress(&app.app_handle());
            }

            println!("downloaded => {}", downloaded);
            println!("total_size => {}", total_size);
        } else {
            break;
        }
    }

    // wait 2s
    std::thread::sleep(std::time::Duration::from_secs(2));

    progress.emit_finished(&app.app_handle());

    return Ok(());
}

#[tauri::command]
async fn install_dmg(app: AppHandle, path: &str) -> Result<(), String> {
    let dir = app
        .path_resolver()
        .app_data_dir()
        .expect("Failed to get data dir");
    let dmg_path = dir.join(&path);
    if let Err(err) = open::that(dmg_path) {
        return Err(format!("Failed to open DMG: {}", err).into());
    }
    Ok(())
}

#[tauri::command]
async fn delete_file(app: AppHandle, path: &str) -> Result<(), String> {
    let dir = app
        .path_resolver()
        .app_data_dir()
        .expect("Failed to get data dir");
    let file_path = dir.join(&path);
    if let Err(err) = fs::remove_file(file_path) {
        return Err(format!("Failed to delete file: {}", err).into());
    }
    Ok(())
}

fn main() {
    let ctx = tauri::generate_context!();
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            machine_uid::get_machine_uid,
            download_file_custom,
            install_dmg,
            delete_file
        ])
        .setup(|_app| {
            #[cfg(debug_assertions)]
            {
                let main_window = _app.get_window("main").unwrap();
                main_window.open_devtools();
            }
            Ok(())
        })
        .run(ctx)
        .expect("error while running tauri application");
}
