use crate::shapes::{
    rectangle::RectangleGeometry,
    circle::CircleGeometry,
    triangle::TriangleGeometry,
    lshape::LShapeGeometry,
    trapezoid::TrapezoidGeometry,
    ShapeGeometry, ShapeInfo, ShapeParameters, Transform, Point, DimensionOrientation
};

pub struct DxfGenerator;

impl DxfGenerator {
    pub fn new() -> Self {
        Self
    }

    pub fn generate_dxf_basic(&self, shape_type: &str, params: &ShapeParameters, transform: &Transform) -> Result<String, String> {
        let mut drawing = dxf::Drawing::new();
        
        // Set units to millimeters (DXF default is already millimeters)
        
        // Get shape geometry
        let geometry = self.get_geometry(shape_type)?;
        let mut shape_info = self.create_shape_info(&geometry, params)?;
        shape_info.shape_type = shape_type.to_string();
        
        // Add shape outline
        self.add_shape_outline(&mut drawing, &shape_info, transform)?;
        
        // Convert to DXF string
        let mut dxf_string = Vec::new();
        drawing.save(&mut dxf_string).map_err(|e| format!("DXF generation failed: {}", e))?;
        Ok(String::from_utf8(dxf_string).map_err(|e| format!("DXF encoding failed: {}", e))?)
    }

    pub fn generate_dxf_detailed(&self, shape_type: &str, params: &ShapeParameters, transform: &Transform) -> Result<String, String> {
        let mut drawing = dxf::Drawing::new();
        
        // Set units to millimeters (DXF default is already millimeters)
        
        // Get shape geometry
        let geometry = self.get_geometry(shape_type)?;
        let mut shape_info = self.create_shape_info(&geometry, params)?;
        shape_info.shape_type = shape_type.to_string();
        
        // Add shape outline
        self.add_shape_outline(&mut drawing, &shape_info, transform)?;
        
        // Add dimensions
        self.add_dimensions(&mut drawing, &shape_info, transform)?;
        
        // Add centerlines if applicable
        self.add_centerlines(&mut drawing, &shape_info, transform)?;
        
        // Convert to DXF string
        let mut dxf_string = Vec::new();
        drawing.save(&mut dxf_string).map_err(|e| format!("DXF generation failed: {}", e))?;
        Ok(String::from_utf8(dxf_string).map_err(|e| format!("DXF encoding failed: {}", e))?)
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

    fn create_shape_info(&self, geometry: &Box<dyn ShapeGeometry>, params: &ShapeParameters) -> Result<ShapeInfo, String> {
        // Validate parameters first
        let validation = geometry.validate_parameters(params);
        if !validation.is_valid {
            return Err(format!("Invalid parameters: {}", validation.errors.join(", ")));
        }

        let bounding_box = geometry.get_bounding_box(params);
        let center = geometry.get_center(params);
        
        // Calculate render offset - shape is positioned at (padding, padding) in viewBox
        let padding = 50.0;
        let render_offset = Point {
            x: padding,
            y: padding,
        };

        Ok(ShapeInfo {
            shape_type: "custom".to_string(), // We'll set this properly in the calling method
            parameters: params.clone(),
            path: geometry.generate_path(params),
            bounding_box,
            area: geometry.get_area(params),
            perimeter: geometry.get_perimeter(params),
            center,
            vertices: geometry.get_vertices(params),
            dimensions: geometry.get_dimensions(params, &render_offset, &Transform { rotation: 0.0, flip_x: false, flip_y: false }),
            render_offset,
            svg_to_image_scale_x: 1.0, // DXF doesn't have scaling issues
            svg_to_image_scale_y: 1.0,
        })
    }

    fn add_shape_outline(&self, drawing: &mut dxf::Drawing, shape_info: &ShapeInfo, transform: &Transform) -> Result<(), String> {
        let vertices = &shape_info.vertices;
        
        if vertices.len() < 2 {
            return Err("Shape must have at least 2 vertices".to_string());
        }

        // Transform vertices
        let transformed_vertices: Vec<Point> = vertices.iter()
            .map(|v| self.transform_point(v, &shape_info.center, transform))
            .collect();

        // Create lines between consecutive vertices
        for i in 0..transformed_vertices.len() {
            let start = &transformed_vertices[i];
            let end = &transformed_vertices[(i + 1) % transformed_vertices.len()];
            
            let line = dxf::entities::Line {
                p1: dxf::Point::new(start.x, start.y, 0.0),
                p2: dxf::Point::new(end.x, end.y, 0.0),
                ..Default::default()
            };
            
            let line_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Line(line));
            drawing.add_entity(line_entity);
        }

        Ok(())
    }

    fn add_dimensions(&self, drawing: &mut dxf::Drawing, shape_info: &ShapeInfo, transform: &Transform) -> Result<(), String> {
        for dimension in &shape_info.dimensions {
            let transformed_start = self.transform_point(&dimension.start_point, &shape_info.center, transform);
            let transformed_end = self.transform_point(&dimension.end_point, &shape_info.center, transform);
            let transformed_text = self.transform_point(&dimension.text_position, &shape_info.center, transform);

            // Add dimension lines
            let dim_line = dxf::entities::Line {
                p1: dxf::Point::new(transformed_start.x, transformed_start.y, 0.0),
                p2: dxf::Point::new(transformed_end.x, transformed_end.y, 0.0),
                ..Default::default()
            };
            let dim_line_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Line(dim_line));
            drawing.add_entity(dim_line_entity);

            // Note: Extension lines removed to match SVG rendering style

            // Add dimension text
            let text = dxf::entities::Text {
                location: dxf::Point::new(transformed_text.x, transformed_text.y, 0.0),
                value: dimension.label.clone(),
                text_height: 15.0, // 15mm text height to match SVG proportions
                rotation: match dimension.orientation {
                    DimensionOrientation::Vertical => 90.0, // Rotate vertical text to read horizontally
                    _ => 0.0,
                },
                ..Default::default()
            };
            let text_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Text(text));
            drawing.add_entity(text_entity);
        }

        Ok(())
    }

    fn add_extension_lines(&self, drawing: &mut dxf::Drawing, start: &Point, end: &Point, orientation: &DimensionOrientation) -> Result<(), String> {
        let extension_length = 20.0; // 20mm extension lines

        match orientation {
            DimensionOrientation::Horizontal => {
                // Vertical extension lines
                let start_ext = dxf::entities::Line {
                    p1: dxf::Point::new(start.x, start.y, 0.0),
                    p2: dxf::Point::new(start.x, start.y - extension_length, 0.0),
                    ..Default::default()
                };
                let end_ext = dxf::entities::Line {
                    p1: dxf::Point::new(end.x, end.y, 0.0),
                    p2: dxf::Point::new(end.x, end.y - extension_length, 0.0),
                    ..Default::default()
                };
                let start_ext_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Line(start_ext));
                drawing.add_entity(start_ext_entity);
                let end_ext_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Line(end_ext));
                drawing.add_entity(end_ext_entity);
            },
            DimensionOrientation::Vertical => {
                // Horizontal extension lines
                let start_ext = dxf::entities::Line {
                    p1: dxf::Point::new(start.x, start.y, 0.0),
                    p2: dxf::Point::new(start.x - extension_length, start.y, 0.0),
                    ..Default::default()
                };
                let end_ext = dxf::entities::Line {
                    p1: dxf::Point::new(end.x, end.y, 0.0),
                    p2: dxf::Point::new(end.x - extension_length, end.y, 0.0),
                    ..Default::default()
                };
                let start_ext_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Line(start_ext));
                drawing.add_entity(start_ext_entity);
                let end_ext_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Line(end_ext));
                drawing.add_entity(end_ext_entity);
            },
            _ => {} // No extension lines for radial/angular dimensions
        }

        Ok(())
    }

    fn add_centerlines(&self, drawing: &mut dxf::Drawing, shape_info: &ShapeInfo, transform: &Transform) -> Result<(), String> {
        // Add centerlines for circles
        if shape_info.shape_type == "circle" {
            let center = self.transform_point(&shape_info.center, &shape_info.center, transform);
            let radius = shape_info.parameters.radius.unwrap_or(50.0);
            
            // Horizontal centerline
            let h_line = dxf::entities::Line {
                p1: dxf::Point::new(center.x - radius * 1.5, center.y, 0.0),
                p2: dxf::Point::new(center.x + radius * 1.5, center.y, 0.0),
                ..Default::default()
            };
            
            // Vertical centerline
            let v_line = dxf::entities::Line {
                p1: dxf::Point::new(center.x, center.y - radius * 1.5, 0.0),
                p2: dxf::Point::new(center.x, center.y + radius * 1.5, 0.0),
                ..Default::default()
            };
            
            let h_line_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Line(h_line));
            drawing.add_entity(h_line_entity);
            let v_line_entity = dxf::entities::Entity::new(dxf::entities::EntityType::Line(v_line));
            drawing.add_entity(v_line_entity);
        }

        Ok(())
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
}
