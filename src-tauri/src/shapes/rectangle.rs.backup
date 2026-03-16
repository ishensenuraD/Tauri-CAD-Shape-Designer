use crate::shapes::{BoundingBox, Point, ShapeGeometry, ShapeParameters, ValidationError, Dimension, DimensionOrientation, Transform};

// Helper function to calculate distance between two points
fn calculate_distance(p1: &Point, p2: &Point) -> f64 {
    ((p2.x - p1.x).powi(2) + (p2.y - p1.y).powi(2)).sqrt()
}

pub struct RectangleGeometry;

impl ShapeGeometry for RectangleGeometry {
    fn generate_path(&self, params: &ShapeParameters) -> String {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        format!("M 0 0 L {} 0 L {} {} L 0 {} Z", width, width, height, height)
    }

    fn get_bounding_box(&self, params: &ShapeParameters) -> BoundingBox {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);

        BoundingBox {
            min_x: 0.0,
            min_y: 0.0,
            max_x: width,
            max_y: height,
            width,
            height,
        }
    }

    fn get_area(&self, params: &ShapeParameters) -> f64 {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        width * height
    }

    fn get_perimeter(&self, params: &ShapeParameters) -> f64 {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        2.0 * (width + height)
    }

    fn get_center(&self, params: &ShapeParameters) -> Point {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        Point { x: width / 2.0, y: height / 2.0 }
    }

    fn get_vertices(&self, params: &ShapeParameters) -> Vec<Point> {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);

        vec![
            Point { x: 0.0, y: 0.0 },       // Top-left
            Point { x: width, y: 0.0 },     // Top-right
            Point { x: width, y: height },  // Bottom-right
            Point { x: 0.0, y: height },    // Bottom-left
        ]
    }

    fn validate_parameters(&self, params: &ShapeParameters) -> ValidationError {
        let mut errors = Vec::new();

        if let Some(width) = params.width {
            if width <= 0.0 {
                errors.push("Width must be greater than 0".to_string());
            }
            if width > 10000.0 {
                errors.push("Width must be less than 10000mm".to_string());
            }
        } else {
            errors.push("Width is required".to_string());
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

        ValidationError {
            is_valid: errors.is_empty(),
            errors,
        }
    }

    fn get_dimensions(&self, params: &ShapeParameters, render_offset: &Point, transform: &Transform) -> Vec<Dimension> {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);

        let width_offset = (width * 0.08).max(5.0).min(30.0);
        let height_offset = (height * 0.08).max(5.0).min(30.0);

        // Log original vertices and edge lengths
        let vertices = self.get_vertices(params);
        
        // Debug: Log original shape vertices
        println!("[BACKEND_VERTICES] rectangle: {:?}", vertices);
        
        // Calculate actual shape edge lengths
        let shape_width = calculate_distance(&vertices[0], &vertices[1]); // Top edge
        let shape_height = calculate_distance(&vertices[1], &vertices[2]); // Right edge

        let base_dimensions = vec![
            Dimension {
                start_point: Point { x: 0.0 + render_offset.x, y: -width_offset + render_offset.y },
                end_point: Point { x: width + render_offset.x, y: -width_offset + render_offset.y },
                text_position: Point { x: width / 2.0 + render_offset.x, y: -width_offset + 19.0 + render_offset.y },
                value: width,
                label: format!("{:.0}mm", width),
                orientation: DimensionOrientation::Horizontal,
            },
            Dimension {
                start_point: Point { x: -height_offset + render_offset.x, y: 0.0 + render_offset.y },
                end_point: Point { x: -height_offset + render_offset.x, y: height + render_offset.y },
                text_position: Point { x: -height_offset + 40.0 + render_offset.x, y: height / 2.0 + render_offset.y },
                value: height,
                label: format!("{:.0}mm", height),
                orientation: DimensionOrientation::Vertical,
            },
        ];

        // Calculate original dimension line lengths
        let orig_width_dim_length = calculate_distance(&base_dimensions[0].start_point, &base_dimensions[0].end_point);
        let orig_height_dim_length = calculate_distance(&base_dimensions[1].start_point, &base_dimensions[1].end_point);

        // Log dimensions before rotation

        if transform.rotation != 0.0 {
            let center = self.get_rotation_center(params);
            let adjusted_center = Point { x: center.x + render_offset.x, y: center.y + render_offset.y };

            let rotation_degrees = transform.rotation;
            let normalized_rotation = rotation_degrees % 360.0;
            
            // For 90° and 270° rotations, swap width/height in dimension calculations
            let (effective_width, effective_height, is_swapped) = 
                if (normalized_rotation >= 45.0 && normalized_rotation < 135.0) || 
                   (normalized_rotation >= 225.0 && normalized_rotation < 315.0) {
                    (height, width, true)  // Swap for 90°/270° rotations
                } else {
                    (width, height, false) // Keep original for 0°/180°
                };

            // Recalculate dimensions based on rotation
            let rotated_base_dimensions = if is_swapped {
                vec![
                    // Width dimension (now vertical after 90° rotation)
                    Dimension {
                        start_point: Point { x: -width_offset + render_offset.x, y: 0.0 + render_offset.y },
                        end_point: Point { x: -width_offset + render_offset.x, y: effective_width + render_offset.y },
                        text_position: Point { x: -width_offset + 40.0 + render_offset.x, y: effective_width / 2.0 + render_offset.y },
                        value: effective_width,
                        label: format!("{:.0}mm", effective_width),
                        orientation: DimensionOrientation::Vertical,
                    },
                    // Height dimension (now horizontal after 90° rotation)
                    Dimension {
                        start_point: Point { x: 0.0 + render_offset.x, y: -height_offset + render_offset.y },
                        end_point: Point { x: effective_height + render_offset.x, y: -height_offset + render_offset.y },
                        text_position: Point { x: effective_height / 2.0 + render_offset.x, y: -height_offset + 19.0 + render_offset.y },
                        value: effective_height,
                        label: format!("{:.0}mm", effective_height),
                        orientation: DimensionOrientation::Horizontal,
                    },
                ]
            } else {
                base_dimensions.clone()
            };

            let rotated_dimensions: Vec<Dimension> = rotated_base_dimensions.clone()
                .into_iter()
                .map(|mut dim| {
                    dim.start_point = self.transform_point(&dim.start_point, &adjusted_center, transform);
                    dim.end_point = self.transform_point(&dim.end_point, &adjusted_center, transform);
                    dim.text_position = self.transform_point(&dim.text_position, &adjusted_center, transform);

                    if (normalized_rotation >= 45.0 && normalized_rotation < 135.0)
                        || (normalized_rotation >= 225.0 && normalized_rotation < 315.0)
                    {
                        match dim.orientation {
                            DimensionOrientation::Horizontal => dim.orientation = DimensionOrientation::Vertical,
                            DimensionOrientation::Vertical => dim.orientation = DimensionOrientation::Horizontal,
                            _ => {}
                        }
                    }

                    dim
                })
                .collect();

            // Calculate expected dimension points based on rotated shape edges
            let expected_width_start = if is_swapped { 
                Point { x: -width_offset + render_offset.x, y: 0.0 + render_offset.y }
            } else { 
                Point { x: 0.0 + render_offset.x, y: -width_offset + render_offset.y }
            };
            
            let expected_width_end = if is_swapped {
                Point { x: -width_offset + render_offset.x, y: effective_width + render_offset.y }
            } else {
                Point { x: width + render_offset.x, y: -width_offset + render_offset.y }
            };
            
            let expected_height_start = if is_swapped {
                Point { x: 0.0 + render_offset.x, y: -height_offset + render_offset.y }
            } else {
                Point { x: -height_offset + render_offset.x, y: 0.0 + render_offset.y }
            };
            
            let expected_height_end = if is_swapped {
                Point { x: effective_height + render_offset.x, y: -height_offset + render_offset.y }
            } else {
                Point { x: -height_offset + render_offset.x, y: height + render_offset.y }
            };

            // Calculate rotated dimension line lengths and verify
            let rot_width_dim_length = calculate_distance(&rotated_dimensions[0].start_point, &rotated_dimensions[0].end_point);
            let rot_height_dim_length = calculate_distance(&rotated_dimensions[1].start_point, &rotated_dimensions[1].end_point);
            
            // Verify lengths match shape edges
            let width_match = (rot_width_dim_length - shape_width).abs() < 1.0;
            let height_match = (rot_height_dim_length - shape_height).abs() < 1.0;

            rotated_dimensions
        } else {
            // Verify lengths for non-rotated case
            let width_match = (orig_width_dim_length - shape_width).abs() < 1.0;
            let height_match = (orig_height_dim_length - shape_height).abs() < 1.0;
            base_dimensions
        }
    }

    fn transform_point(&self, point: &Point, center: &Point, transform: &Transform) -> Point {
        let mut x = point.x;
        let mut y = point.y;

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
        self.get_center(params)
    }
}
