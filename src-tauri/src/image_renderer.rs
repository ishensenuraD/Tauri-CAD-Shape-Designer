use crate::shapes::{ShapeParameters, Transform};
use crate::svg_generator::SvgGenerator;
use base64::Engine;
use image::{ImageFormat, RgbaImage};
use usvg::Tree;
use std::io::Cursor;

pub struct ImageRenderer {
    svg_generator: SvgGenerator,
}

impl ImageRenderer {
    pub fn new() -> Self {
        Self {
            svg_generator: SvgGenerator::new(),
        }
    }

    pub fn render_shape_to_png(
        &self,
        shape_type: &str,
        params: &ShapeParameters,
        transform: &Transform,
        width: u32,
        height: u32,
    ) -> Result<Vec<u8>, String> {
        // Generate SVG
        let svg_string = self.svg_generator.generate_svg(shape_type, params, transform, width, height)?;
        
        // Parse SVG
        let options = usvg::Options::default();
        let tree = Tree::from_str(&svg_string, &options)
            .map_err(|e| format!("Failed to parse SVG: {}", e))?;

        // Create pixmap
        let mut pixmap = tiny_skia::Pixmap::new(width, height)
            .ok_or("Failed to create pixmap")?;

        // Render SVG to pixmap
        let transform = tiny_skia::Transform::default();
        resvg::render(&tree, transform, &mut pixmap.as_mut());

        // Convert to image
        let image_data = pixmap.data();
        let image = RgbaImage::from_raw(width, height, image_data.to_vec())
            .ok_or("Failed to create image from pixmap data")?;

        // Encode to PNG
        let mut buffer = Vec::new();
        let mut cursor = Cursor::new(&mut buffer);
        image.write_to(&mut cursor, ImageFormat::Png)
            .map_err(|e| format!("Failed to encode PNG: {}", e))?;

        Ok(buffer)
    }

    pub fn render_shape_to_base64(
        &self,
        shape_type: &str,
        params: &ShapeParameters,
        transform: &Transform,
        width: u32,
        height: u32,
    ) -> Result<String, String> {
        let png_data = self.render_shape_to_png(shape_type, params, transform, width, height)?;
        
        let base64_string = base64::engine::general_purpose::STANDARD.encode(&png_data);
        Ok(format!("data:image/png;base64,{}", base64_string))
    }

}