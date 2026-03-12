use crate::shapes::{BoundingBox, Point, ShapeGeometry, ShapeParameters, ValidationError, Dimension, DimensionOrientation};



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



    fn get_dimensions(&self, params: &ShapeParameters, render_offset: &Point) -> Vec<Dimension> {

        let width = params.width.unwrap_or(100.0);

        let height = params.height.unwrap_or(100.0);

        

        // Dynamic offset calculation - 8% of dimension with bounds

        let width_offset = (width * 0.08).max(5.0).min(30.0);

        let height_offset = (height * 0.08).max(5.0).min(30.0);

        

        vec![

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

        ]

    }

}

