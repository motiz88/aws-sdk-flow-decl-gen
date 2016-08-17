/* @flow */
import { builders as b } from 'ast-types';
import isEmptyObject from 'is-empty-object';
import resolveShapeRef from './resolveShapeRef';
import translateShapeRef from './translateShapeRef';
import simpleTypeAnnotation from './simpleTypeAnnotation';
import { entries, values } from './utils';
import stringEscape from 'js-string-escape';
import invariant from 'invariant';
import { isPascalCase } from 'casey-js';

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
      const asDiscriminatedUnion = tryTranslateDiscriminatedUnion(shape, shapes, scope);
      if (asDiscriminatedUnion) {
        return asDiscriminatedUnion;
      }
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
        return b.unionTypeAnnotation(shape.enum.map(makeStringLiteralType));
      }
      return b.stringTypeAnnotation();
    }
    default:
      throw new Error(shape.type);
  }
}

function makeStringLiteralType (value) {
  return b.stringLiteralTypeAnnotation(value, "'" + stringEscape(value) + "'");
}

function tryTranslateDiscriminatedUnion (shape: ShapeDef, shapes: Shapes, scope: string) {
  const next = (nextRef: ?(ShapeRef | ShapeDef)) => translateShape(nextRef, shapes, scope);
  invariant(shape.type === 'structure', 'Only structures can be discriminated unions');
  if (!shape.required) {
    // the discriminant must be a required member
    return null;
  }
  const { members, required } = shape;
  const enumCandidates = shape.required.map(enumKey => {
    const discriminantShape = resolveShapeRef(members[enumKey], shapes, scope);
    if (!discriminantShape) return null;
    if (isEmptyObject(discriminantShape)) return null;
    if (discriminantShape.type === 'string' && discriminantShape.enum) {
      const { enum: enumValues } = discriminantShape;
      if (!enumValues.every(enumValue => enumValue && isPascalCase(enumValue))) {
        return;
      }
      const payloadCandidates = enumValues.map(enumValue =>
        Object.keys(members).filter(
          candidateKey => candidateKey.startsWith(enumValue[0].toLowerCase() + enumValue.substring(1))
        )
      );
      if (!payloadCandidates.every(candidates => candidates.length === 1)) {
        return null;
      }
      let tailCandidate = '';
      const payloadKeys = payloadCandidates.map(ck => ck[0]);
      const enumMapping = {};
      for (let i = 0; i < enumValues.length; ++i) {
        const enumValue = enumValues[i];
        const candidateKey = payloadKeys[i];
        const tail = candidateKey.substring(enumValue.length);
        if (tailCandidate && tail !== tailCandidate) {
          return null;
        }
        if (required.indexOf(candidateKey) !== -1) {
          return null;
        }
        tailCandidate = tail;
        enumMapping[enumValue] = candidateKey;
      }
      return {key: enumKey, mapping: enumMapping};
    }
    return null;
  }).filter(Boolean);
  if (enumCandidates.length !== 1) {
    return null;
  }
  const [{key: enumKey, mapping: enumMapping}] = enumCandidates;
  const payloadKeys = values(enumMapping);
  const commonPart = b.objectTypeAnnotation(
    entries(members)
      .filter(([key]) => key !== enumKey && payloadKeys.indexOf(key) === -1)
      // $FlowFixMe: why does Flow 0.30 not like this?
      .map(([key, member]: [string, ShapeRef | ShapeDef]) => {
        const optional = !required || required.indexOf(key) === -1;
        return b.objectTypeProperty(b.identifier(key), next(member), optional);
      })
  );
  const discriminatedParts = entries(enumMapping).map(([enumValue, payloadKey]) =>
    b.objectTypeAnnotation([
      b.objectTypeProperty(b.identifier(enumKey), makeStringLiteralType(enumValue), false),
      b.objectTypeProperty(b.identifier(payloadKey), next(members[payloadKey]), false)
    ])
  );
  return flattenIntersection(b.intersectionTypeAnnotation([commonPart, b.unionTypeAnnotation(discriminatedParts)]));
}

function flattenIntersection (intersectionType) {
  invariant(intersectionType.type === 'IntersectionTypeAnnotation', 'Not an intersection type');
  invariant(intersectionType.types.length === 2, 'Expected an intersection of two types');
  invariant(intersectionType.types[0].type === 'ObjectTypeAnnotation', 'First type should be the common part, an object type');
  invariant(intersectionType.types[1].type === 'UnionTypeAnnotation', 'Second type should be a union');
  invariant(intersectionType.types[1].types.every(memberType => memberType.type === 'ObjectTypeAnnotation'), 'Second type must be a union of object types');
  const [commonPart, {types: discriminatedParts}] = intersectionType.types;
  return b.unionTypeAnnotation(discriminatedParts.map(part => ({
    type: 'ObjectTypeAnnotation',
    properties: [...commonPart.properties, ...part.properties],
    indexers: [...commonPart.indexers, ...part.indexers],
    callProperties: [...commonPart.callProperties, ...part.callProperties]
  })));
}
