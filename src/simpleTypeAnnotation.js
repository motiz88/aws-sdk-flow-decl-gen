/* @flow */

import { builders as b } from 'ast-types';

export default function simpleTypeAnnotation (typeName: string) {
  return b.genericTypeAnnotation(b.identifier(typeName), null);
}
