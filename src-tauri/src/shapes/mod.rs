pub mod rectangle;
pub mod circle;
pub mod triangle;
pub mod lshape;
pub mod trapezoid;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShapeParameters {
    pub width: Option<f64>,
    pub height: Option<f64>,
    pub radius: Option<f64>,
    pub base: Option<f64>,
    pub angle: Option<f64>,
    pub outer_width: Option<f64>,
    pub outer_height: Option<f64>,
    pub inner_width: Option<f64>,
    pub inner_height: Option<f64>,
    pub top_width: Option<f64>,
    pub bottom_width: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BoundingBox {
    pub min_x: f64,
    pub min_y: f64,
    pub max_x: f64,
    pub max_y: f64,
    pub width: f64,
    pub height: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dimension {
    pub start_point: Point,
    pub end_point: Point,
    pub text_position: Point,
    pub value: f64,
    pub label: String,
    pub orientation: DimensionOrientation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum DimensionOrientation {
    Horizontal,
    Vertical,
    Radial,
    Angular,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ShapeInfo {
    pub shape_type: String,
    pub parameters: ShapeParameters,
    pub path: String,
    pub bounding_box: BoundingBox,
    pub area: f64,
    pub perimeter: f64,
    pub center: Point,
    pub vertices: Vec<Point>,
    pub dimensions: Vec<Dimension>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Point {
    pub x: f64,
    pub y: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Transform {
    pub rotation: f64,
    pub flip_x: bool,
    pub flip_y: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ValidationError {
    pub is_valid: bool,
    pub errors: Vec<String>,
}

pub trait ShapeGeometry {
    fn generate_path(&self, params: &ShapeParameters) -> String;
    fn get_bounding_box(&self, params: &ShapeParameters) -> BoundingBox;
    fn get_area(&self, params: &ShapeParameters) -> f64;
    fn get_perimeter(&self, params: &ShapeParameters) -> f64;
    fn get_center(&self, params: &ShapeParameters) -> Point;
    fn get_vertices(&self, params: &ShapeParameters) -> Vec<Point>;
    fn validate_parameters(&self, params: &ShapeParameters) -> ValidationError;
    fn get_dimensions(&self, params: &ShapeParameters) -> Vec<Dimension>;
}
