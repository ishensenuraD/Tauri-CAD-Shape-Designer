// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod shapes;
mod svg_generator;
mod image_renderer;
mod dxf_generator;

use serde::{Deserialize, Serialize};
use shapes::{ShapeParameters, Transform, ShapeInfo};
use svg_generator::SvgGenerator;
use image_renderer::ImageRenderer;
use dxf_generator::DxfGenerator;
use base64::Engine;

#[derive(Debug, Serialize, Deserialize)]
pub struct RenderRequest {
    pub shape_type: String,
    pub parameters: ShapeParameters,
    pub transform: Transform,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RenderResponse {
    pub success: bool,
    pub data: Option<Vec<u8>>,
    pub base64: Option<String>,
    pub shape_info: Option<ShapeInfo>,
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DxfRequest {
    pub shape_type: String,
    pub parameters: ShapeParameters,
    pub transform: Transform,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DxfResponse {
    pub success: bool,
    pub dxf_data: Option<String>,
    pub error: Option<String>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_shape_info(shape_type: String, parameters: ShapeParameters) -> Result<ShapeInfo, String> {
    let generator = SvgGenerator::new();
    generator.generate_shape_info(&shape_type, &parameters)
}

#[tauri::command]
fn generate_svg(shape_type: String, parameters: ShapeParameters, transform: Transform, width: u32, height: u32) -> Result<String, String> {
    let generator = SvgGenerator::new();
    generator.generate_svg(&shape_type, &parameters, &transform, width, height)
}

#[tauri::command]
fn render_shape_to_png(request: RenderRequest) -> Result<RenderResponse, String> {
    let renderer = ImageRenderer::new();
    
    // First get shape info
    let generator = SvgGenerator::new();
    let shape_info = match generator.generate_shape_info(&request.shape_type, &request.parameters) {
        Ok(info) => info,
        Err(e) => {
            return Ok(RenderResponse {
                success: false,
                data: None,
                base64: None,
                shape_info: None,
                error: Some(e),
            });
        }
    };

    // Render to PNG
    match renderer.render_shape_to_png(
        &request.shape_type,
        &request.parameters,
        &request.transform,
        request.width,
        request.height,
    ) {
        Ok(png_data) => {
            let base64_string = base64::engine::general_purpose::STANDARD.encode(&png_data);
            Ok(RenderResponse {
                success: true,
                data: Some(png_data),
                base64: Some(format!("data:image/png;base64,{}", base64_string)),
                shape_info: Some(shape_info),
                error: None,
            })
        }
        Err(e) => Ok(RenderResponse {
            success: false,
            data: None,
            base64: None,
            shape_info: Some(shape_info),
            error: Some(e),
        }),
    }
}

#[tauri::command]
fn render_shape_to_base64(shape_type: String, parameters: ShapeParameters, transform: Transform, width: u32, height: u32) -> Result<String, String> {
    let renderer = ImageRenderer::new();
    renderer.render_shape_to_base64(&shape_type, &parameters, &transform, width, height)
}

#[tauri::command]
fn generate_dxf_basic(request: DxfRequest) -> Result<DxfResponse, String> {
    let generator = DxfGenerator::new();
    
    match generator.generate_dxf_basic(&request.shape_type, &request.parameters, &request.transform) {
        Ok(dxf_data) => Ok(DxfResponse {
            success: true,
            dxf_data: Some(dxf_data),
            error: None,
        }),
        Err(e) => Ok(DxfResponse {
            success: false,
            dxf_data: None,
            error: Some(e),
        }),
    }
}

#[tauri::command]
fn generate_dxf_detailed(request: DxfRequest) -> Result<DxfResponse, String> {
    let generator = DxfGenerator::new();
    
    match generator.generate_dxf_detailed(&request.shape_type, &request.parameters, &request.transform) {
        Ok(dxf_data) => Ok(DxfResponse {
            success: true,
            dxf_data: Some(dxf_data),
            error: None,
        }),
        Err(e) => Ok(DxfResponse {
            success: false,
            dxf_data: None,
            error: Some(e),
        }),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_shape_info,
            generate_svg,
            render_shape_to_png,
            render_shape_to_base64,
            generate_dxf_basic,
            generate_dxf_detailed
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
