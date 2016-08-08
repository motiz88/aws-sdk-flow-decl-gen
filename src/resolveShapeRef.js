export default function resolveShapeRef (sh: ?(ShapeRef | ShapeDef), shapes: Shapes): ?ShapeDef {
  if (!sh) return sh;
  if (typeof sh.shape === 'string') {
    if (!shapes[sh.shape]) {
      throw new Error(`Shape ${sh.shape} not found`);
    }
    const resolvedShape = shapes[sh.shape];
    return resolveShapeRef(resolvedShape, shapes);
  }
  // $FlowFixMe: Flow doesn't agree with me that sh is definitely a ShapeDef here
  return (sh: ShapeDef);
}
