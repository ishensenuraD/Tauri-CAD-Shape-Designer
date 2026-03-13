use crate::shapes::{ShapeParameters, Transform, ShapeInfo};
use crate::svg_generator::SvgGenerator;
use base64::{Engine as _, engine::general_purpose};
use image::{ImageFormat, RgbaImage, Rgba};
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
        include_dimensions: bool,
    ) -> Result<Vec<u8>, String> {
        // Get shape info with dimensions
        let shape_info = self.svg_generator.generate_shape_info(shape_type, params, transform)?;
        
        // Generate SVG without dimensions
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
        let mut image = RgbaImage::from_raw(width, height, image_data.to_vec())
            .ok_or("Failed to create image from pixmap data")?;

        // Draw dimensions on the image if requested
        if include_dimensions {
            self.draw_dimensions_on_image(&mut image, &shape_info, width, height)?;
        }

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
        include_dimensions: bool,
    ) -> Result<String, String> {
        let png_data = self.render_shape_to_png(shape_type, params, transform, width, height, include_dimensions)?;
        
        let base64_string = general_purpose::STANDARD.encode(&png_data);
        Ok(format!("data:image/png;base64,{}", base64_string))
    }

    fn draw_dimensions_on_image(
        &self,
        image: &mut RgbaImage,
        shape_info: &ShapeInfo,
        _width: u32,
        _height: u32,
    ) -> Result<(), String> {
        for dimension in &shape_info.dimensions {
            // Apply scale factors to transform from SVG coordinates to image coordinates
            let scaled_start = (
                dimension.start_point.x * shape_info.svg_to_image_scale_x,
                dimension.start_point.y * shape_info.svg_to_image_scale_y,
            );
            let scaled_end = (
                dimension.end_point.x * shape_info.svg_to_image_scale_x,
                dimension.end_point.y * shape_info.svg_to_image_scale_y,
            );
            let scaled_text = (
                dimension.text_position.x * shape_info.svg_to_image_scale_x,
                dimension.text_position.y * shape_info.svg_to_image_scale_y,
            );

            // Draw dimension line (blue color #2563eb)
            self.draw_line_on_image(
                image,
                scaled_start.0 as i32,
                scaled_start.1 as i32,
                scaled_end.0 as i32,
                scaled_end.1 as i32,
                (37, 99, 235), // RGB for #2563eb
            )?;

            // Draw arrows at both ends
            self.draw_arrow_on_image(
                image,
                scaled_start.0 as i32,
                scaled_start.1 as i32,
                scaled_end.0 as i32,
                scaled_end.1 as i32,
                (37, 99, 235),
            )?;
            self.draw_arrow_on_image(
                image,
                scaled_end.0 as i32,
                scaled_end.1 as i32,
                scaled_start.0 as i32,
                scaled_start.1 as i32,
                (37, 99, 235),
            )?;

            // Draw dimension text
            self.draw_text_on_image(
                image,
                &dimension.label,
                scaled_text.0 as i32,
                scaled_text.1 as i32,
                (37, 99, 235),
            )?;
        }
        Ok(())
    }

    fn draw_line_on_image(
        &self,
        image: &mut RgbaImage,
        x1: i32,
        y1: i32,
        x2: i32,
        y2: i32,
        color: (u8, u8, u8),
    ) -> Result<(), String> {
        // Simple line drawing using Bresenham's algorithm
        let dx = (x2 - x1).abs();
        let dy = (y2 - y1).abs();
        let sx = if x1 < x2 { 1 } else { -1 };
        let sy = if y1 < y2 { 1 } else { -1 };
        let mut err = dx - dy;

        let mut x = x1;
        let mut y = y1;

        loop {
            if x >= 0 && y >= 0 && x < image.width() as i32 && y < image.height() as i32 {
                image.put_pixel(x as u32, y as u32, Rgba([color.0, color.1, color.2, 255]));
            }

            if x == x2 && y == y2 {
                break;
            }

            let e2 = 2 * err;
            if e2 > -dy {
                err -= dy;
                x += sx;
            }
            if e2 < dx {
                err += dx;
                y += sy;
            }
        }
        Ok(())
    }

    fn draw_arrow_on_image(
        &self,
        image: &mut RgbaImage,
        from_x: i32,
        from_y: i32,
        to_x: i32,
        to_y: i32,
        color: (u8, u8, u8),
    ) -> Result<(), String> {
        let angle = ((to_y - from_y) as f64).atan2((to_x - from_x) as f64);
        let arrow_length = 8.0;
        let arrow_angle = std::f64::consts::PI / 6.0;

        // Calculate arrow points
        let x1 = to_x as f64 - arrow_length * (angle - arrow_angle).cos();
        let y1 = to_y as f64 - arrow_length * (angle - arrow_angle).sin();
        let x2 = to_x as f64 - arrow_length * (angle + arrow_angle).cos();
        let y2 = to_y as f64 - arrow_length * (angle + arrow_angle).sin();

        // Draw arrow lines
        self.draw_line_on_image(image, to_x, to_y, x1 as i32, y1 as i32, color)?;
        self.draw_line_on_image(image, to_x, to_y, x2 as i32, y2 as i32, color)?;

        Ok(())
    }

    fn draw_text_on_image(
        &self,
        image: &mut RgbaImage,
        text: &str,
        x: i32,
        y: i32,
        color: (u8, u8, u8),
    ) -> Result<(), String> {
        // Improved text rendering with better readability
        let text_width = text.len() as i32 * 10; // Better width calculation
        let text_height = 16;
        
        // Draw white background rectangle for text
        let bg_x = (x - text_width/2 - 5).max(0);
        let bg_y = (y - text_height/2 - 3).max(0);
        let bg_width = (text_width + 10).min(image.width() as i32 - bg_x);
        let bg_height = (text_height + 6).min(image.height() as i32 - bg_y);
        
        // Draw white background
        for by in bg_y..(bg_y + bg_height) {
            for bx in bg_x..(bg_x + bg_width) {
                if bx >= 0 && by >= 0 && bx < image.width() as i32 && by < image.height() as i32 {
                    image.put_pixel(bx as u32, by as u32, Rgba([255, 255, 255, 255]));
                }
            }
        }
        
        // Draw text with better character representation
        let char_spacing = 10;
        let start_x = x - text_width/2 + char_spacing/2;
        
        for (i, ch) in text.chars().enumerate() {
            let char_x = start_x + (i as i32 * char_spacing);
            
            // Draw different patterns for different characters
            match ch {
                '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' => {
                    // Draw digits as solid rectangles with clear patterns
                    for dx in -3..=3 {
                        for dy in -6..=6 {
                            let px = char_x + dx;
                            let py = y + dy;
                            
                            if px >= 0 && py >= 0 && px < image.width() as i32 && py < image.height() as i32 {
                                // Create digit-specific patterns
                                let should_draw = match ch {
                                    '0' => dx.abs() == 3 || dy.abs() == 6 || (dy.abs() <= 4 && dx.abs() == 2),
                                    '1' => dx >= -1 && dx <= 1,
                                    '2' => dy.abs() == 6 || dy == 0 || (dy > 0 && dx > 0) || (dy < 0 && dx < 0),
                                    '3' => dy.abs() == 6 || dy == 0 || dx == 3,
                                    '4' => dx >= 0 && dy <= 0 || dx == 0,
                                    '5' => dy.abs() == 6 || dy == 0 || (dy > 0 && dx < 0) || (dy < 0 && dx > 0),
                                    '6' => dy.abs() == 6 || dy == 0 || dx <= 0,
                                    '7' => dy >= 0 && dx >= -2,
                                    '8' => dy.abs() == 6 || dy == 0 || dx.abs() == 3 || (dy.abs() == 3 && dx.abs() == 2),
                                    '9' => dy.abs() == 6 || dy == 0 || (dy >= 0 && dx >= 0) || (dy <= 0 && dx <= 0),
                                    _ => false,
                                };
                                
                                if should_draw {
                                    image.put_pixel(px as u32, py as u32, Rgba([color.0, color.1, color.2, 255]));
                                }
                            }
                        }
                    }
                },
                'm' | 'M' => {
                    // Draw 'm' as two vertical lines with connecting arch
                    for dx in -4..=4 {
                        for dy in -4..=4 {
                            let px = char_x + dx;
                            let py = y + dy;
                            
                            if px >= 0 && py >= 0 && px < image.width() as i32 && py < image.height() as i32 {
                                let should_draw = (dx == -3 || dx == 3) && dy >= -4 && dy <= 4 ||
                                                 (dy == -4 && dx >= -3 && dx <= 3) ||
                                                 (dy == 0 && dx >= -2 && dx <= 2);
                                
                                if should_draw {
                                    image.put_pixel(px as u32, py as u32, Rgba([color.0, color.1, color.2, 255]));
                                }
                            }
                        }
                    }
                },
                _ => {
                    // Draw other characters as simple patterns
                    for dx in -2..=2 {
                        for dy in -4..=4 {
                            let px = char_x + dx;
                            let py = y + dy;
                            
                            if px >= 0 && py >= 0 && px < image.width() as i32 && py < image.height() as i32 {
                                // Create a simple pattern for other characters
                                let pattern = (dx.abs() + dy.abs()) <= 3;
                                if pattern {
                                    image.put_pixel(px as u32, py as u32, Rgba([color.0, color.1, color.2, 255]));
                                }
                            }
                        }
                    }
                }
            }
        }
        
        Ok(())
    }
}