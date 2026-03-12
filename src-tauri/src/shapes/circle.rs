use crate::shapes::{BoundingBox, Dimension, DimensionOrientation, Point, ShapeGeometry, Transform, ValidationError, ShapeParameters};

pub struct CircleGeometry;

impl ShapeGeometry for CircleGeometry {
    fn generate_path(&self, params: &ShapeParameters) -> String {
        let radius = params.radius.unwrap_or(50.0);
        let segments = 32;
        let mut points = Vec::new();
        
        for i in 0..=segments {
            let angle = (i as f64 / segments as f64) * 2.0 * std::f64::consts::PI;
            let x = radius + radius * angle.cos();
            let y = radius + radius * angle.sin();
            
            if i == 0 {
                points.push(format!("M {} {}", x, y));
            } else {
                points.push(format!("L {} {}", x, y));
            }
        }
        
        format!("{} Z", points.join(" "))
    }

    fn get_bounding_box(&self, params: &ShapeParameters) -> BoundingBox {
        let radius = params.radius.unwrap_or(50.0);
        let diameter = radius * 2.0;
        
        BoundingBox {
            min_x: 0.0,
            min_y: 0.0,
            max_x: diameter,
            max_y: diameter,
            width: diameter,
            height: diameter,
        }
    }

    fn get_area(&self, params: &ShapeParameters) -> f64 {
        let radius = params.radius.unwrap_or(50.0);
        std::f64::consts::PI * radius * radius
    }

    fn get_perimeter(&self, params: &ShapeParameters) -> f64 {
        let radius = params.radius.unwrap_or(50.0);
        2.0 * std::f64::consts::PI * radius
    }

    fn get_center(&self, params: &ShapeParameters) -> Point {
        let radius = params.radius.unwrap_or(50.0);
        Point {
            x: radius,
            y: radius,
        }
    }

    fn get_vertices(&self, params: &ShapeParameters) -> Vec<Point> {
        let radius = params.radius.unwrap_or(50.0);
        let num_points = 8;
        let mut points = Vec::new();
        
        for i in 0..num_points {
            let angle = (i as f64 / num_points as f64) * 2.0 * std::f64::consts::PI;
            points.push(Point {
                x: radius + radius * angle.cos(),
                y: radius + radius * angle.sin(),
            });
        }
        
        points
    }

    fn validate_parameters(&self, params: &ShapeParameters) -> ValidationError {
        let mut errors = Vec::new();
        
        if let Some(radius) = params.radius {
            if radius <= 0.0 {
                errors.push("Radius must be greater than 0".to_string());
            }
            if radius > 5000.0 {
                errors.push("Radius must be less than 5000mm".to_string());
            }
        } else {
            errors.push("Radius is required".to_string());
        }
        
        ValidationError {
            is_valid: errors.is_empty(),
            errors,
        }
    }

    fn get_dimensions(&self, params: &ShapeParameters, render_offset: &Point, transform: &Transform) -> Vec<Dimension> {
        let radius = params.radius.unwrap_or(50.0);
        let diameter = radius * 2.0;
        let _center = Point { x: radius + render_offset.x, y: radius + render_offset.y };
        
        // Dynamic offset calculation - 8% of dimension with bounds
        let diameter_offset = (diameter * 0.08).max(5.0).min(30.0);
        
        // Create base dimensions (before transformation)
        let base_dimensions = vec![
            // Diameter dimension (vertical through center)
            Dimension {
                start_point: Point { x: radius + render_offset.x, y: diameter_offset + render_offset.y },
                end_point: Point { x: radius + render_offset.x, y: diameter - diameter_offset + render_offset.y },
                text_position: Point { x: radius + diameter_offset + (diameter_offset * 0.75) + render_offset.x, y: radius + render_offset.y },
                value: diameter,
                label: format!("Ø {:.0}mm", diameter),
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
        // For circle, use the same center as the shape
        self.get_center(params)
    }
}
