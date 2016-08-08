import astring from 'astring';
import flowGenerator from 'astring-flow';
import { isCollection, forEach } from 'iterall';

export default function generate (ast): string {
  if (isCollection(ast)) {
    let result = '';
    forEach(ast, node => {
      if (result) result += '\n';
      result += generate(node);
    });
    return result;
  }
  return astring(ast, {generator: flowGenerator, indent: '  '});
}
