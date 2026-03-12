use crate::shapes::{BoundingBox, Dimension, DimensionOrientation, Point, ShapeGeometry, Transform, ValidationError, ShapeParameters};

pub struct TrapezoidGeometry;

impl ShapeGeometry for TrapezoidGeometry {
    fn generate_path(&self, params: &ShapeParameters) -> String {
        let top_width = params.top_width.unwrap_or(80.0);
        let bottom_width = params.bottom_width.unwrap_or(120.0);
        let height = params.height.unwrap_or(60.0);
        
        // Calculate horizontal offsets to center the top width
        let bottom_offset = (bottom_width - top_width) / 2.0;
        
        // Trapezoid vertices (clockwise from top-left)
        let vertices = vec![
            (bottom_offset, 0.0),                    // Top-left
            (bottom_offset + top_width, 0.0),         // Top-right
            (bottom_width, height),                   // Bottom-right
            (0.0, height),                            // Bottom-left
        ];
        
        let mut path_parts = Vec::new();
        for (i, (x, y)) in vertices.iter().enumerate() {
            if i == 0 {
                path_parts.push(format!("M {} {}", x, y));
            } else {
                path_parts.push(format!("L {} {}", x, y));
            }
        }
        path_parts.push("Z".to_string());
        
        path_parts.join(" ")
    }

    fn get_bounding_box(&self, params: &ShapeParameters) -> BoundingBox {
        let bottom_width = params.bottom_width.unwrap_or(120.0);
        let height = params.height.unwrap_or(60.0);
        
        BoundingBox {
            min_x: 0.0,
            min_y: 0.0,
            max_x: bottom_width,
            max_y: height,
            width: bottom_width,
            height,
        }
    }

    fn get_area(&self, params: &ShapeParameters) -> f64 {
        let top_width = params.top_width.unwrap_or(80.0);
        let bottom_width = params.bottom_width.unwrap_or(120.0);
        let height = params.height.unwrap_or(60.0);
        
        // Area of trapezoid: (a + b) / 2 * h
        ((top_width + bottom_width) / 2.0) * height
    }

    fn get_perimeter(&self, params: &ShapeParameters) -> f64 {
        let top_width = params.top_width.unwrap_or(80.0);
        let bottom_width = params.bottom_width.unwrap_or(120.0);
        let height = params.height.unwrap_or(60.0);
        
        // Calculate the length of the slanted sides
        let bottom_offset = (bottom_width - top_width) / 2.0;
        let side_length = (bottom_offset * bottom_offset + height * height).sqrt();
        
        top_width + bottom_width + 2.0 * side_length
    }

    fn get_center(&self, params: &ShapeParameters) -> Point {
        let bottom_width = params.bottom_width.unwrap_or(120.0);
        let height = params.height.unwrap_or(60.0);
        
        // Center of trapezoid (approximate)
        Point {
            x: bottom_width / 2.0,
            y: height / 2.0,
        }
    }

    fn get_vertices(&self, params: &ShapeParameters) -> Vec<Point> {
        let top_width = params.top_width.unwrap_or(80.0);
        let bottom_width = params.bottom_width.unwrap_or(120.0);
        let height = params.height.unwrap_or(60.0);
        
        let bottom_offset = (bottom_width - top_width) / 2.0;
        
        vec![
            Point { x: bottom_offset, y: 0.0 },                    // Top-left
            Point { x: bottom_offset + top_width, y: 0.0 },         // Top-right
            Point { x: bottom_width, y: height },                   // Bottom-right
            Point { x: 0.0, y: height },                           // Bottom-left
        ]
    }

    fn validate_parameters(&self, params: &ShapeParameters) -> ValidationError {
        let mut errors = Vec::new();
        
        if let Some(top_width) = params.top_width {
            if top_width <= 0.0 {
                errors.push("Top width must be greater than 0".to_string());
            }
            if top_width > 10000.0 {
                errors.push("Top width must be less than 10000mm".to_string());
            }
        } else {
            errors.push("Top width is required".to_string());
        }
        
        if let Some(bottom_width) = params.bottom_width {
            if bottom_width <= 0.0 {
                errors.push("Bottom width must be greater than 0".to_string());
            }
            if bottom_width > 10000.0 {
                errors.push("Bottom width must be less than 10000mm".to_string());
            }
        } else {
            errors.push("Bottom width is required".to_string());
        }
        
        if let Some(height) = params.height {
            if height <= 0.0 {
                errors.push("Height must be greater than 0".to_string());
            }
            if height > 10000.0 {
                errors.push("Height must be less than 10000mm".to_string());
            }
        } else {
            errors.push("Height is required".to_string());
        }
        
        // Validate that widths are reasonable relative to each other
        if let (Some(top_width), Some(bottom_width)) = (params.top_width, params.bottom_width) {
            if top_width > bottom_width * 2.0 || bottom_width > top_width * 2.0 {
                errors.push("Top and bottom widths should be reasonably proportional".to_string());
            }
        }
        
        ValidationError {
            is_valid: errors.is_empty(),
            errors,
        }
    }

    fn get_dimensions(&self, params: &ShapeParameters, render_offset: &Point, transform: &Transform) -> Vec<Dimension> {
        let top_width = params.top_width.unwrap_or(80.0);
        let bottom_width = params.bottom_width.unwrap_or(120.0);
        let height = params.height.unwrap_or(60.0);
        let bottom_offset = (bottom_width - top_width) / 2.0;
        let offset = 20.0;
        
        // Create base dimensions (before transformation)
        let base_dimensions = vec![
            // Top width dimension (horizontal at top)
            Dimension {
                start_point: Point { x: bottom_offset + render_offset.x, y: -offset + render_offset.y },
                end_point: Point { x: bottom_offset + top_width + render_offset.x, y: -offset + render_offset.y },
                text_position: Point { x: bottom_offset + top_width / 2.0 + render_offset.x, y: -offset - 10.0 + render_offset.y },
                value: top_width,
                label: format!("{:.0}mm", top_width),
                orientation: DimensionOrientation::Horizontal,
            },
            // Bottom width dimension (horizontal at bottom)
            Dimension {
                start_point: Point { x: 0.0 + render_offset.x, y: height + offset + render_offset.y },
                end_point: Point { x: bottom_width + render_offset.x, y: height + offset + render_offset.y },
                text_position: Point { x: bottom_width / 2.0 + render_offset.x, y: height + offset + 15.0 + render_offset.y },
                value: bottom_width,
                label: format!("{:.0}mm", bottom_width),
                orientation: DimensionOrientation::Horizontal,
            },
            // Height dimension (vertical at center)
            Dimension {
                start_point: Point { x: bottom_width / 2.0 + offset + render_offset.x, y: 0.0 + render_offset.y },
                end_point: Point { x: bottom_width / 2.0 + offset + render_offset.x, y: height + render_offset.y },
                text_position: Point { x: bottom_width / 2.0 + offset + 15.0 + render_offset.x, y: height / 2.0 + render_offset.y },
                value: height,
                label: format!("{:.0}mm", height),
                orientation: DimensionOrientation::Vertical,
            },
        ];
        
        // Apply rotation transformation if needed
        if transform.rotation != 0.0 {
            let center = self.get_center(params);
            let adjusted_center = Point {
                x: center.x + render_offset.x,
                y: center.y + render_offset.y,
            };
            
            base_dimensions.into_iter().map(|mut dim| {
                dim.start_point = self.transform_point(&dim.start_point, &adjusted_center, transform);
                dim.end_point = self.transform_point(&dim.end_point, &adjusted_center, transform);
                dim.text_position = self.transform_point(&dim.text_position, &adjusted_center, transform);
                
                // Update dimension orientation based on rotation
                let rotation_degrees = transform.rotation;
                let normalized_rotation = rotation_degrees % 360.0;
                
                if (normalized_rotation >= 45.0 && normalized_rotation < 135.0) || 
                   (normalized_rotation >= 225.0 && normalized_rotation < 315.0) {
                    // Swap orientations for 90° and 270° rotations
                    match dim.orientation {
                        DimensionOrientation::Horizontal => dim.orientation = DimensionOrientation::Vertical,
                        DimensionOrientation::Vertical => dim.orientation = DimensionOrientation::Horizontal,
                        _ => {}
                    }
                }
                
                dim
            }).collect()
        } else {
            base_dimensions
        }
    }
    
    fn transform_point(&self, point: &Point, center: &Point, transform: &Transform) -> Point {
        let mut x = point.x;
        let mut y = point.y;

        // Apply rotation
        if transform.rotation != 0.0 {
            let angle_rad = (transform.rotation * std::f64::consts::PI) / 180.0;
            let cos_a = angle_rad.cos();
            let sin_a = angle_rad.sin();
            
            let rel_x = x - center.x;
            let rel_y = y - center.y;
            
            x = rel_x * cos_a - rel_y * sin_a + center.x;
            y = rel_x * sin_a + rel_y * cos_a + center.y;
        }

        Point { x, y }
    }

    fn get_rotation_center(&self, params: &ShapeParameters) -> Point {
        // For trapezoid, use the same center as the shape
        self.get_center(params)
    }
}
