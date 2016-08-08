/* @flow */

import { builders as b } from 'ast-types';
import { entries, lowerFirst } from './utils';
import translateShape from './translateShape';
import translateShapeName from './translateShapeName';
import translateServiceVersionName from './translateServiceVersionName';

export default function translateServiceVersion (
  { metadata, operations, shapes }: ServiceVersionDef,
  service: ServiceDef
) {
  const { protocol } = metadata;
  // console.log(`Translating ${serviceAbbreviation} API`);
  // if (version !== '2.0') {
  //   throw new Error(`Cannot translate API schema version ${version}`);
  // }
  if (['json', 'rest-json', 'query', 'rest-xml', 'ec2'].indexOf(protocol) === -1) {
    throw new Error(`Cannot translate API protocol ${protocol}`);
  }
  const scope = translateServiceVersionName(metadata, service);

  const namedShapesAsts =
    entries(shapes)
      .map(([key, shape]: [string, ShapeDef]) => {
        const node = translateShape(shape, shapes, scope);
        switch (node.type) {
          case 'BooleanTypeAnnotation':
          /* falls through */
          case 'StringTypeAnnotation':
          /* falls through */
          case 'NumberTypeAnnotation':
          /* falls through */
          case 'VoidTypeAnnotation':
            return;
        }
        return b.declareTypeAlias(b.identifier(translateShapeName(key, scope)), null, node);
      })
      .map(nodes => Array.isArray(nodes) ? nodes : [nodes].filter(Boolean))
      .reduce((a, b) => a.concat(b));

  const serviceClassAst = {
    type: 'DeclareClass',
    id: b.identifier(translateServiceVersionName(metadata, service)),
    typeParameters: null,
    body: b.objectTypeAnnotation(
      entries(operations)
      .map(([key, operation]: [string, OperationDef]) => {
        return b.objectTypeProperty(
          b.identifier(lowerFirst(key)),
          b.genericTypeAnnotation(
            b.identifier('$APIMethod'),
            b.typeParameterInstantiation([
              translateShape(operation.input, shapes, scope),
              translateShape(operation.output, shapes, scope)
            ])
          ),
          false
        );
      })
    ),
    extends: []
  };

  const classes = [serviceClassAst];
  const types = namedShapesAsts;
  return { types, classes };
}
