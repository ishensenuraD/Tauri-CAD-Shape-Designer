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

    // Helper function to calculate rotated corner point
    fn calculate_rotated_corner(&self, point: &Point, center: &Point, rotation_degrees: f64) -> Point {
        if rotation_degrees == 0.0 {
            return Point { x: point.x, y: point.y };
        }

        let angle_rad = (rotation_degrees * std::f64::consts::PI) / 180.0;
        let cos_a = angle_rad.cos();
        let sin_a = angle_rad.sin();
        
        let rel_x = point.x - center.x;
        let rel_y = point.y - center.y;
        
        Point {
            x: rel_x * cos_a - rel_y * sin_a + center.x,
            y: rel_x * sin_a + rel_y * cos_a + center.y,
        }
    }

    // Helper function to get all rotated corner points
    fn get_rotated_corners(&self, params: &ShapeParameters, transform: &Transform) -> Vec<Point> {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        let center = self.get_center(params);
        
        // Define corners relative to origin (0,0)
        let corners = vec![
            Point { x: 0.0, y: 0.0 },           // Top-left
            Point { x: width, y: 0.0 },         // Top-right
            Point { x: width, y: height },      // Bottom-right
            Point { x: 0.0, y: height },        // Bottom-left
        ];
        
        // Apply rotation to each corner
        corners.iter()
            .map(|corner| self.calculate_rotated_corner(corner, &center, transform.rotation))
            .collect()
    }

    // Helper function to calculate perpendicular offset direction
    fn get_perpendicular_offset(&self, start: &Point, end: &Point, offset_distance: f64) -> (f64, f64) {
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let length = (dx * dx + dy * dy).sqrt();
        
        if length == 0.0 {
            return (0.0, offset_distance);
        }
        
        // Normalize and rotate 90 degrees counter-clockwise for outward normal
        let normal_x = -dy / length;
        let normal_y = dx / length;
        
        (normal_x * offset_distance, normal_y * offset_distance)
    }

    // Helper function to create dimension along a rotated edge
    fn create_edge_dimension(&self, start: &Point, end: &Point, offset_distance: f64, 
                           value: f64, label: String, render_offset: &Point) -> Dimension {
        let (offset_x, offset_y) = self.get_perpendicular_offset(start, end, offset_distance);
        
        // Calculate dimension line endpoints with offset
        let start_point = Point {
            x: start.x + offset_x + render_offset.x,
            y: start.y + offset_y + render_offset.y,
        };
        
        let end_point = Point {
            x: end.x + offset_x + render_offset.x,
            y: end.y + offset_y + render_offset.y,
        };
        
        // Calculate text position (perpendicular to edge, further offset)
        let text_offset_distance = offset_distance + 19.0;
        let (text_offset_x, text_offset_y) = self.get_perpendicular_offset(start, end, text_offset_distance);
        
        let text_position = Point {
            x: (start.x + end.x) / 2.0 + text_offset_x + render_offset.x,
            y: (start.y + end.y) / 2.0 + text_offset_y + render_offset.y,
        };
        
        // Determine orientation based on edge direction
        let dx = end.x - start.x;
        let dy = end.y - start.y;
        let orientation = if dx.abs() > dy.abs() {
            DimensionOrientation::Horizontal
        } else {
            DimensionOrientation::Vertical
        };
        
        Dimension {
            start_point,
            end_point,
            text_position,
            value,
            label,
            orientation,
        }
    }

    fn get_dimensions(&self, params: &ShapeParameters, render_offset: &Point, transform: &Transform) -> Vec<Dimension> {
        let width = params.width.unwrap_or(100.0);
        let height = params.height.unwrap_or(100.0);
        
        // Dynamic offset calculation - 8% of dimension with bounds
        let width_offset = (width * 0.08).max(5.0).min(30.0);
        let height_offset = (height * 0.08).max(5.0).min(30.0);
        
        // If no rotation, use simple horizontal/vertical dimensions
        if transform.rotation == 0.0 && !transform.flip_x && !transform.flip_y {
            return vec![
                // Width dimension (horizontal, above the shape)
                Dimension {
                    start_point: Point {
                        x: width*0.05 + render_offset.x,
                        y: -width_offset + render_offset.y,
                    },
                    end_point: Point {
                        x: width *0.95 + render_offset.x,
                        y: -width_offset + render_offset.y,
                    },
                    text_position: Point {
                        x: width / 2.0 + render_offset.x,
                        y: -width_offset + 19.0 + render_offset.y,
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
                        x: -height_offset + 40.0 + render_offset.x,
                        y: height / 2.0 + render_offset.y,
                    },
                    value: height,
                    label: format!("{:.0}mm", height),
                    orientation: DimensionOrientation::Vertical,
                },
            ];
        
        // For rotated shapes, use edge-based dimensions
        let corners = self.get_rotated_corners(params, transform);
        
        // Apply flips if needed
        let final_corners = if transform.flip_x || transform.flip_y {
            let center = self.get_center(params);
            corners.iter()
                .map(|corner| self.transform_point(corner, &center, transform))
                .collect()
        } else {
            corners
        };
        
        // Create dimensions along rotated edges
        let width_dimension = self.create_edge_dimension(
            &final_corners[0], // Top-left
            &final_corners[1], // Top-right  
            width_offset,
            width,
            format!("{:.0}mm", width),
            render_offset,
        );
        
        let height_dimension = self.create_edge_dimension(
            &final_corners[1], // Top-right
            &final_corners[2], // Bottom-right
            height_offset,
            height,
            format!("{:.0}mm", height),
            render_offset,
        );
        
        vec![width_dimension, height_dimension]

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

 
 }  
 