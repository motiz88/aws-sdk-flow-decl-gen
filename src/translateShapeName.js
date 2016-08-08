/* @flow */

export default function translateShapeName (shape: string, scope: string): string {
  return scope + '$' + shape;
}
