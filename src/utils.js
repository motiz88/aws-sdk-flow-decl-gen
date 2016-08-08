/* @flow */

export function lowerFirst (string: string): string {
  return string[0].toLowerCase() + string.substr(1);
}

export function entries<T> (o: {[key: string]: T}): Array<[string, T]> {
  // $FlowIssue: Flow 0.30's Object.entries erases the value type, so we abstract over it here.
  return (Object.entries(o): Array<[string, T]>);
}

export function values<T> (o: {[key: string]: T}): Array<T> {
  // $FlowIssue: Flow 0.30's Object.values erases the value type, so we abstract over it here.
  return (Object.values(o): Array<T>);
}
