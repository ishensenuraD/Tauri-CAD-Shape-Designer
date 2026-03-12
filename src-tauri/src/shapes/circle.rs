use crate::shapes::{BoundingBox, Point, ShapeGeometry, ShapeParameters, ValidationError, Dimension, DimensionOrientation, Transform};



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

        let center = Point { x: radius + render_offset.x, y: radius + render_offset.y };

        

        // Dynamic offset calculation - 8% of dimension with bounds

        let diameter_offset = (diameter * 0.08).max(5.0).min(30.0);

        

        vec![

            // Diameter dimension (vertical through center)

            Dimension {

                start_point: Point { x: radius + render_offset.x, y: diameter_offset + render_offset.y },

                end_point: Point { x: radius + render_offset.x, y: diameter - diameter_offset + render_offset.y },

                text_position: Point { x: radius + diameter_offset + (diameter_offset * 0.75) + render_offset.x, y: radius + render_offset.y },

                value: diameter,

                label: format!("Ø {:.0}mm", diameter),

                orientation: DimensionOrientation::Vertical,

            },

        ]

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

        // Apply flips
        if transform.flip_x {
            x = 2.0 * center.x - x;
        }
        if transform.flip_y {
            y = 2.0 * center.y - y;
        }

        Point { x, y }
    }

    fn get_rotation_center(&self, params: &ShapeParameters) -> Point {
        let radius = params.radius.unwrap_or(50.0);
        Point { x: radius, y: radius }
    }

}

