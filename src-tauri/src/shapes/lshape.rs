use crate::shapes::{BoundingBox, Point, ShapeGeometry, ShapeParameters, ValidationError, Dimension, DimensionOrientation};

pub struct LShapeGeometry;

impl ShapeGeometry for LShapeGeometry {
    fn generate_path(&self, params: &ShapeParameters) -> String {
        let outer_width = params.outer_width.unwrap_or(120.0);
        let outer_height = params.outer_height.unwrap_or(80.0);
        let inner_width = params.inner_width.unwrap_or(40.0);
        let inner_height = params.inner_height.unwrap_or(40.0);
        
        // L-shape vertices (clockwise from top-left)
        let vertices = vec![
            (0.0, 0.0),                              // Top-left outer
            (outer_width, 0.0),                     // Top-right outer
            (outer_width, inner_height),            // Inner corner top-right
            (inner_width, inner_height),            // Inner corner top-left
            (inner_width, outer_height),            // Inner corner bottom-left
            (0.0, outer_height),                    // Bottom-left outer
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
        let outer_width = params.outer_width.unwrap_or(120.0);
        let outer_height = params.outer_height.unwrap_or(80.0);
        
        BoundingBox {
            min_x: 0.0,
            min_y: 0.0,
            max_x: outer_width,
            max_y: outer_height,
            width: outer_width,
            height: outer_height,
        }
    }

    fn get_area(&self, params: &ShapeParameters) -> f64 {
        let outer_width = params.outer_width.unwrap_or(120.0);
        let outer_height = params.outer_height.unwrap_or(80.0);
        let inner_width = params.inner_width.unwrap_or(40.0);
        let inner_height = params.inner_height.unwrap_or(40.0);
        
        // Area of outer rectangle minus area of cut-out
        (outer_width * outer_height) - (inner_width * inner_height)
    }

    fn get_perimeter(&self, params: &ShapeParameters) -> f64 {
        let outer_width = params.outer_width.unwrap_or(120.0);
        let outer_height = params.outer_height.unwrap_or(80.0);
        let inner_width = params.inner_width.unwrap_or(40.0);
        let inner_height = params.inner_height.unwrap_or(40.0);
        
        // Calculate perimeter of L-shape
        let outer_perimeter = 2.0 * (outer_width + outer_height);
        let inner_perimeter = 2.0 * (inner_width + inner_height);
        
        // L-shape perimeter = outer perimeter + inner perimeter
        outer_perimeter + inner_perimeter
    }

    fn get_center(&self, params: &ShapeParameters) -> Point {
        let outer_width = params.outer_width.unwrap_or(120.0);
        let outer_height = params.outer_height.unwrap_or(80.0);
        
        // Approximate center of L-shape
        Point {
            x: outer_width / 3.0,
            y: outer_height / 3.0,
        }
    }

    fn get_vertices(&self, params: &ShapeParameters) -> Vec<Point> {
        let outer_width = params.outer_width.unwrap_or(120.0);
        let outer_height = params.outer_height.unwrap_or(80.0);
        let inner_width = params.inner_width.unwrap_or(40.0);
        let inner_height = params.inner_height.unwrap_or(40.0);
        
        vec![
            Point { x: 0.0, y: 0.0 },                           // Top-left outer
            Point { x: outer_width, y: 0.0 },                  // Top-right outer
            Point { x: outer_width, y: inner_height },          // Inner corner top-right
            Point { x: inner_width, y: inner_height },          // Inner corner top-left
            Point { x: inner_width, y: outer_height },          // Inner corner bottom-left
            Point { x: 0.0, y: outer_height },                  // Bottom-left outer
        ]
    }

    fn validate_parameters(&self, params: &ShapeParameters) -> ValidationError {
        let mut errors = Vec::new();
        
        // Validate outer dimensions
        if let Some(outer_width) = params.outer_width {
            if outer_width <= 0.0 {
                errors.push("Outer width must be greater than 0".to_string());
            }
            if outer_width > 10000.0 {
                errors.push("Outer width must be less than 10000mm".to_string());
            }
        } else {
            errors.push("Outer width is required".to_string());
        }
        
        if let Some(outer_height) = params.outer_height {
            if outer_height <= 0.0 {
                errors.push("Outer height must be greater than 0".to_string());
            }
            if outer_height > 10000.0 {
                errors.push("Outer height must be less than 10000mm".to_string());
            }
        } else {
            errors.push("Outer height is required".to_string());
        }
        
        // Validate inner dimensions
        if let Some(inner_width) = params.inner_width {
            if inner_width <= 0.0 {
                errors.push("Inner width must be greater than 0".to_string());
            }
            if inner_width > 10000.0 {
                errors.push("Inner width must be less than 10000mm".to_string());
            }
            if let Some(outer_width) = params.outer_width {
                if inner_width >= outer_width {
                    errors.push("Inner width must be less than outer width".to_string());
                }
            }
        } else {
            errors.push("Inner width is required".to_string());
        }
        
        if let Some(inner_height) = params.inner_height {
            if inner_height <= 0.0 {
                errors.push("Inner height must be greater than 0".to_string());
            }
            if inner_height > 10000.0 {
                errors.push("Inner height must be less than 10000mm".to_string());
            }
            if let Some(outer_height) = params.outer_height {
                if inner_height >= outer_height {
                    errors.push("Inner height must be less than outer height".to_string());
                }
            }
        } else {
            errors.push("Inner height is required".to_string());
        }
        
        ValidationError {
            is_valid: errors.is_empty(),
            errors,
        }
    }

    fn get_dimensions(&self, params: &ShapeParameters) -> Vec<Dimension> {
        let outer_width = params.outer_width.unwrap_or(120.0);
        let outer_height = params.outer_height.unwrap_or(80.0);
        let inner_width = params.inner_width.unwrap_or(40.0);
        let inner_height = params.inner_height.unwrap_or(40.0);
        let offset = 15.0;
        
        vec![
            // Outer width dimension (horizontal at top)
            Dimension {
                start_point: Point { x: offset, y: offset },
                end_point: Point { x: outer_width - offset, y: offset },
                text_position: Point { x: outer_width / 2.0, y: offset - 10.0 },
                value: outer_width,
                label: format!("{:.0}mm", outer_width),
                orientation: DimensionOrientation::Horizontal,
            },
            // Outer height dimension (vertical at left)
            Dimension {
                start_point: Point { x: offset, y: offset },
                end_point: Point { x: offset, y: outer_height - offset },
                text_position: Point { x: offset - 15.0, y: outer_height / 2.0 },
                value: outer_height,
                label: format!("{:.0}mm", outer_height),
                orientation: DimensionOrientation::Vertical,
            },
            // Inner width dimension (horizontal inside)
            Dimension {
                start_point: Point { x: inner_width + offset, y: inner_height + offset },
                end_point: Point { x: outer_width - offset, y: inner_height + offset },
                text_position: Point { x: (inner_width + outer_width) / 2.0, y: inner_height + offset + 15.0 },
                value: outer_width - inner_width,
                label: format!("{:.0}mm", outer_width - inner_width),
                orientation: DimensionOrientation::Horizontal,
            },
            // Inner height dimension (vertical inside)
            Dimension {
                start_point: Point { x: inner_width + offset, y: inner_height + offset },
                end_point: Point { x: inner_width + offset, y: outer_height - offset },
                text_position: Point { x: inner_width + offset + 15.0, y: (inner_height + outer_height) / 2.0 },
                value: outer_height - inner_height,
                label: format!("{:.0}mm", outer_height - inner_height),
                orientation: DimensionOrientation::Vertical,
            },
        ]
    }
}
