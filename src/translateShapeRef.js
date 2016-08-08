/* @flow */

import translateShape from './translateShape';
import simpleTypeAnnotation from './simpleTypeAnnotation';
import translateShapeName from './translateShapeName';

export default function translateShapeRef (ref: ShapeRef, shapes: Shapes, scope: string) {
  const shape = shapes[ref.shape];
  switch (shape.type) {
    case 'structure':
    /* falls through */
    case 'list':
      return simpleTypeAnnotation(translateShapeName(ref.shape, scope));
    default:
      return translateShape(shape, shapes, scope);
  }
}
