declare module "searoute-js" {
  interface GeoJSONFeature {
    type: "Feature";
    properties: {
      length?: number;
      units?: string;
      [key: string]: unknown;
    };
    geometry: {
      type: "LineString" | "Point";
      coordinates: [number, number][];
    };
  }

  interface GeoJSONPoint {
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: {
      type: "Point";
      coordinates: [number, number];
    };
  }

  function searoute(
    origin: GeoJSONPoint,
    destination: GeoJSONPoint,
    options?: { units?: "km" | "nm" }
  ): GeoJSONFeature;

  export = searoute;
}
