use crate::shapes::{
    rectangle::RectangleGeometry,
    circle::CircleGeometry,
    triangle::TriangleGeometry,
    lshape::LShapeGeometry,
    trapezoid::TrapezoidGeometry,
    ShapeGeometry, ShapeInfo, ShapeParameters, Transform, Point, BoundingBox
};
use svg::node::element::Path;
use svg::node::element::Circle as SvgCircle;
use svg::node::element::Group;
use svg::Document;

pub struct SvgGenerator;

impl SvgGenerator {
    pub fn new() -> Self {
        Self
    }

    pub fn generate_shape_info(&self, shape_type: &str, params: &ShapeParameters) -> Result<ShapeInfo, String> {
        let geometry = self.get_geometry(shape_type)?;
        
        // Validate parameters first
        let validation = geometry.validate_parameters(params);
        if !validation.is_valid {
            return Err(format!("Invalid parameters: {}", validation.errors.join(", ")));
        }

        let bounding_box = geometry.get_bounding_box(params);
        let center = geometry.get_center(params);

        Ok(ShapeInfo {
            shape_type: shape_type.to_string(),
            parameters: params.clone(),
            path: geometry.generate_path(params),
            bounding_box,
            area: geometry.get_area(params),
            perimeter: geometry.get_perimeter(params),
            center,
            vertices: geometry.get_vertices(params),
            dimensions: geometry.get_dimensions(params),
        })
    }

    pub fn generate_svg(&self, shape_type: &str, params: &ShapeParameters, transform: &Transform, width: u32, height: u32) -> Result<String, String> {
        let shape_info = self.generate_shape_info(shape_type, params)?;
        
        // Calculate viewBox with padding
        let padding = 50;
        let view_box = self.calculate_view_box(&shape_info.bounding_box, transform, padding);
        
        // Create SVG document
        let mut document = Document::new()
            .set("viewBox", view_box)
            .set("width", width)
            .set("height", height)
            .set("xmlns", "http://www.w3.org/2000/svg");

        // Add background - completely removed to fix line artifacts
        // Background is handled by the frontend canvas

        // Add shape with transformations
        let shape_element = if shape_type == "circle" {
            self.create_circle_element(&shape_info, transform)?
        } else {
            self.create_path_element(&shape_info, transform)?
        };

        document = document.add(shape_element);

        // Return SVG as string
        let svg_string = document.to_string();
        Ok(svg_string)
    }

    fn get_geometry(&self, shape_type: &str) -> Result<Box<dyn ShapeGeometry>, String> {
        match shape_type {
            "rectangle" => Ok(Box::new(RectangleGeometry)),
            "circle" => Ok(Box::new(CircleGeometry)),
            "triangle" => Ok(Box::new(TriangleGeometry)),
            "lshape" => Ok(Box::new(LShapeGeometry)),
            "trapezoid" => Ok(Box::new(TrapezoidGeometry)),
            _ => Err(format!("Unknown shape type: {}", shape_type)),
        }
    }

    fn calculate_view_box(&self, bounding_box: &BoundingBox, transform: &Transform, padding: i32) -> (i32, i32, i32, i32) {
        let mut min_x = bounding_box.min_x;
        let mut min_y = bounding_box.min_y;
        let mut max_x = bounding_box.max_x;
        let mut max_y = bounding_box.max_y;

        // Apply rotation to bounding box corners
        if transform.rotation != 0.0 || transform.flip_x || transform.flip_y {
            let corners = vec![
                Point { x: min_x, y: min_y },
                Point { x: max_x, y: min_y },
                Point { x: max_x, y: max_y },
                Point { x: min_x, y: max_y },
            ];

            let transformed_corners = corners.iter()
                .map(|p| self.transform_point(p, &bounding_box, transform))
                .collect::<Vec<_>>();

            min_x = transformed_corners.iter().map(|p| p.x).fold(f64::INFINITY, f64::min);
            max_x = transformed_corners.iter().map(|p| p.x).fold(f64::NEG_INFINITY, f64::max);
            min_y = transformed_corners.iter().map(|p| p.y).fold(f64::INFINITY, f64::min);
            max_y = transformed_corners.iter().map(|p| p.y).fold(f64::NEG_INFINITY, f64::max);
        }

        (
            (min_x - padding as f64) as i32,
            (min_y - padding as f64) as i32,
            (max_x - min_x + 2.0 * padding as f64) as i32,
            (max_y - min_y + 2.0 * padding as f64) as i32,
        )
    }

    fn transform_point(&self, point: &Point, bounding_box: &BoundingBox, transform: &Transform) -> Point {
        let center = Point {
            x: bounding_box.width / 2.0,
            y: bounding_box.height / 2.0,
        };

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

    fn create_path_element(&self, shape_info: &ShapeInfo, transform: &Transform) -> Result<Group, String> {
        let mut group = Group::new();

        let path = Path::new()
            .set("d", shape_info.path.as_str())
            .set("fill", "none")
            .set("stroke", "#2563eb")
            .set("stroke-width", "2");

        let mut element = Group::new().add(path);

        // Apply transformations
        if transform.rotation != 0.0 || transform.flip_x || transform.flip_y {
            let center = &shape_info.center;
            let mut transform_str = String::new();
            
            if transform.rotation != 0.0 {
                transform_str.push_str(&format!("rotate({} {} {})", transform.rotation, center.x, center.y));
            }
            
            if transform.flip_x {
                if !transform_str.is_empty() { transform_str.push(' '); }
                transform_str.push_str("scale(-1, 1)");
            }
            
            if transform.flip_y {
                if !transform_str.is_empty() { transform_str.push(' '); }
                transform_str.push_str("scale(1, -1)");
            }
            
            element = element.set("transform", transform_str);
        }

        group = group.add(element);
        Ok(group)
    }

    fn create_circle_element(&self, shape_info: &ShapeInfo, transform: &Transform) -> Result<Group, String> {
        let mut group = Group::new();

        let radius = shape_info.parameters.radius.unwrap_or(50.0);
        let circle = SvgCircle::new()
            .set("cx", shape_info.center.x)
            .set("cy", shape_info.center.y)
            .set("r", radius)
            .set("fill", "none")
            .set("stroke", "#2563eb")
            .set("stroke-width", "2");

        let mut element = Group::new().add(circle);

        // Apply transformations
        if transform.rotation != 0.0 || transform.flip_x || transform.flip_y {
            let center = &shape_info.center;
            let mut transform_str = String::new();
            
            if transform.rotation != 0.0 {
                transform_str.push_str(&format!("rotate({} {} {})", transform.rotation, center.x, center.y));
            }
            
            if transform.flip_x {
                if !transform_str.is_empty() { transform_str.push(' '); }
                transform_str.push_str("scale(-1, 1)");
            }
            
            if transform.flip_y {
                if !transform_str.is_empty() { transform_str.push(' '); }
                transform_str.push_str("scale(1, -1)");
            }
            
            element = element.set("transform", transform_str);
        }

        group = group.add(element);
        Ok(group)
    }
}
