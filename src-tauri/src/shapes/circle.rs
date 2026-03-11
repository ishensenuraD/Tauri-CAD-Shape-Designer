use crate::shapes::{BoundingBox, Point, ShapeGeometry, ShapeParameters, ValidationError, Dimension, DimensionOrientation};

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

    fn get_dimensions(&self, params: &ShapeParameters) -> Vec<Dimension> {
        let radius = params.radius.unwrap_or(50.0);
        let center = Point { x: radius, y: radius };
        
        vec![
            // Radius dimension (horizontal from center to edge)
            Dimension {
                start_point: center,
                end_point: Point { x: radius * 2.0, y: radius },
                text_position: Point { x: radius * 1.5, y: radius - 15.0 },
                value: radius,
                label: format!("R {:.0}mm", radius),
                orientation: DimensionOrientation::Radial,
            },
            // Diameter dimension (vertical through center)
            Dimension {
                start_point: Point { x: radius, y: 10.0 },
                end_point: Point { x: radius, y: radius * 2.0 - 10.0 },
                text_position: Point { x: radius + 15.0, y: radius },
                value: radius * 2.0,
                label: format!("Ø {:.0}mm", radius * 2.0),
                orientation: DimensionOrientation::Vertical,
            },
        ]
    }
}
