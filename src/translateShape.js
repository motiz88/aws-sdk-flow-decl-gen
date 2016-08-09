/* @flow */
import { builders as b } from 'ast-types';
import isEmptyObject from 'is-empty-object';
import resolveShapeRef from './resolveShapeRef';
import translateShapeRef from './translateShapeRef';
import simpleTypeAnnotation from './simpleTypeAnnotation';
import { entries } from './utils';
import stringEscape from 'js-string-escape';

export default function translateShape (shapeOrRef: ?(ShapeRef | ShapeDef), shapes: Shapes, scope: string) {
  const next = (nextRef: ?(ShapeRef | ShapeDef)) => translateShape(nextRef, shapes, scope);
  if (shapeOrRef && typeof shapeOrRef.shape === 'string') {
    // $FlowIssue: Flow 0.30 doesn't agree that shapeOrRef is a ShapeRef here
    return translateShapeRef((shapeOrRef: ShapeRef), shapes, scope);
  }
  const shape = resolveShapeRef(shapeOrRef, shapes, scope);
  if (!shape) return b.voidTypeAnnotation();
  if (isEmptyObject(shape)) {
    return b.stringTypeAnnotation();
  }
  /*
  structure
string
boolean
string with enum
string with min/max
list
integer
timestamp
map
blob*/
  switch (shape.type) {
    case 'structure': {
      const { members, required } = shape;
      return b.objectTypeAnnotation(
        entries(members)
        .map(([key, member]: [string, ShapeRef | ShapeDef]) => {
          const optional = !required || required.indexOf(key) === -1;
          return b.objectTypeProperty(b.identifier(key), next(member), optional);
        })
      );
    }
    case 'list': {
      const { member } = shape;
      return b.arrayTypeAnnotation(next(member));
    }
    case 'map': {
      const { key, value } = shape;
      return b.objectTypeAnnotation(
        [], /* properties */
        [
          b.objectTypeIndexer(b.identifier('key'),
          next(key),
          next(value))
        ]
      );
    }
    case 'blob':
      return b.unionTypeAnnotation(['Buffer', '$TypedArray', 'Blob'].map(simpleTypeAnnotation).concat(b.stringTypeAnnotation()));
    case 'integer':
    /* falls through */
    case 'long':
    /* falls through */
    case 'double':
    /* falls through */
    case 'float':
      return b.numberTypeAnnotation();
    case 'boolean':
      return b.booleanTypeAnnotation();
    case 'timestamp':
      return simpleTypeAnnotation('Date');
    case 'string': {
      if (shape.enum) {
        return b.unionTypeAnnotation(shape.enum.map(value => b.stringLiteralTypeAnnotation(value, "'" + stringEscape(value) + "'")));
      }
      return b.stringTypeAnnotation();
    }
    default:
      throw new Error(shape.type);
  }
}
