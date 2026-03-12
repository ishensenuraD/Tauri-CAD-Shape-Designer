use crate::shapes::{BoundingBox, Dimension, DimensionOrientation, Point, ShapeGeometry, Transform, ValidationError, ShapeParameters};

pub struct TriangleGeometry;

impl ShapeGeometry for TriangleGeometry {
    fn generate_path(&self, params: &ShapeParameters) -> String {
        let base = params.base.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        let angle = params.angle.unwrap_or(60.0);
        
        // Calculate triangle vertices
        let center_x = base / 2.0;
        let top_y = 0.0;
        let bottom_y = height;
        
        // Calculate top vertex based on angle
        let _angle_rad = (angle * std::f64::consts::PI) / 180.0;
        let top_x = center_x;
        
        format!(
            "M {} {} L {} {} L {} {} Z",
            top_x, top_y,                    // Top vertex
            0.0, bottom_y,                   // Bottom-left
            base, bottom_y                   // Bottom-right
        )
    }

    fn get_bounding_box(&self, params: &ShapeParameters) -> BoundingBox {
        let base = params.base.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        
        BoundingBox {
            min_x: 0.0,
            min_y: 0.0,
            max_x: base,
            max_y: height,
            width: base,
            height,
        }
    }

    fn get_area(&self, params: &ShapeParameters) -> f64 {
        let base = params.base.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        0.5 * base * height
    }

    fn get_perimeter(&self, params: &ShapeParameters) -> f64 {
        let base = params.base.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        
        // Calculate the length of the two equal sides
        let side_length = (base * base / 4.0 + height * height).sqrt();
        base + 2.0 * side_length
    }

    fn get_center(&self, params: &ShapeParameters) -> Point {
        let base = params.base.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        
        // Centroid of a triangle is at 1/3 of the height from the base
        Point {
            x: base / 2.0,
            y: height / 3.0,
        }
    }

    fn get_vertices(&self, params: &ShapeParameters) -> Vec<Point> {
        let base = params.base.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        
        vec![
            Point { x: base / 2.0, y: 0.0 },      // Top vertex
            Point { x: 0.0, y: height },         // Bottom-left
            Point { x: base, y: height },        // Bottom-right
        ]
    }

    fn validate_parameters(&self, params: &ShapeParameters) -> ValidationError {
        let mut errors = Vec::new();
        
        if let Some(base) = params.base {
            if base <= 0.0 {
                errors.push("Base must be greater than 0".to_string());
            }
            if base > 10000.0 {
                errors.push("Base must be less than 10000mm".to_string());
            }
        } else {
            errors.push("Base is required".to_string());
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
        
        if let Some(angle) = params.angle {
            if angle <= 0.0 || angle >= 180.0 {
                errors.push("Angle must be between 0 and 180 degrees".to_string());
            }
        }
        
        ValidationError {
            is_valid: errors.is_empty(),
            errors,
        }
    }

    fn get_dimensions(&self, params: &ShapeParameters, render_offset: &Point, transform: &Transform) -> Vec<Dimension> {
        let base = params.base.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        let offset = 20.0;
        
        // Create base dimensions (before transformation)
        let base_dimensions = vec![
            // Base dimension (horizontal at bottom)
            Dimension {
                start_point: Point { x: base *0.13 + render_offset.x, y: height +10.0 + render_offset.y },
                end_point: Point { x: base *0.87 + render_offset.x, y: height + 10.0 + render_offset.y },
                text_position: Point { x: base / 2.0 + render_offset.x, y: height + offset + 5.0 + render_offset.y },
                value: base,
                label: format!("{:.0}mm", base),
                orientation: DimensionOrientation::Horizontal,
            },
            // Height dimension (vertical from base to top, positioned inside triangle)
            Dimension {
                start_point: Point { x: base * 0.5 + render_offset.x, y: height -offset * 0.5 + render_offset.y },
                end_point: Point { x: base * 0.5 + render_offset.x, y: 10.0 + render_offset.y },
                text_position: Point { x: base * 0.5 + 15.0 + render_offset.x, y: height / 2.0 + render_offset.y },
                value: height ,
                label: format!("{:.0}mm", height ),
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
        // For triangle, use the same center as the shape (centroid)
        self.get_center(params)
    }
}
