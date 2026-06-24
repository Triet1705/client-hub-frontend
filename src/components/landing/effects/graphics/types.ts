export interface GraphicShapeProps {
  gradientId: string;
  colorConfig: {
    from: string;
    to: string;
    glow?: string;
  };
}
