use crate::shapes::{BoundingBox, Point, ShapeGeometry, ShapeParameters, ValidationError, Dimension, DimensionOrientation, Transform};



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

        Point {

            x: width / 2.0,

            y: height / 2.0,

        }

    }



    fn get_vertices(&self, params: &ShapeParameters) -> Vec<Point> {

        let width = params.width.unwrap_or(100.0);

        let height = params.height.unwrap_or(100.0);

        

        vec![

            Point { x: 0.0, y: 0.0 },           // Top-left

            Point { x: width, y: 0.0 },         // Top-right

            Point { x: width, y: height },      // Bottom-right

            Point { x: 0.0, y: height },        // Bottom-left

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
        
        // Dynamic offset calculation - 8% of dimension with bounds
        let width_offset = (width * 0.08).max(5.0).min(30.0);
        let height_offset = (height * 0.08).max(5.0).min(30.0);
        
        // Create base dimensions (before transformation)
        let base_dimensions = vec![
            // Width dimension (horizontal, above the shape)
            Dimension {
                start_point: Point {
                    x: 0.0 + render_offset.x,
                    y: -width_offset + render_offset.y,
                },
                end_point: Point {
                    x: width + render_offset.x,
                    y: -width_offset + render_offset.y,
                },
                text_position: Point {
                    x: width / 2.0 + render_offset.x,
                    y: -width_offset - (width_offset * 0.5) + render_offset.y,
                },
                value: width,
                label: format!("{:.0}mm", width),
                orientation: DimensionOrientation::Horizontal,
            },
            // Height dimension (vertical, left of the shape)
            Dimension {
                start_point: Point {
                    x: -height_offset + render_offset.x,
                    y: 0.0 + render_offset.y,
                },
                end_point: Point {
                    x: -height_offset + render_offset.x,
                    y: height + render_offset.y,
                },
                text_position: Point {
                    x: -height_offset - (height_offset * 0.75) + render_offset.x,
                    y: height / 2.0 + render_offset.y,
                },
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
        // For rectangle, use the same center as the shape
        self.get_center(params)
    }

}
