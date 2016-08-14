/* @flow */

import path from 'path';
import generate from './generate';
import translateServiceMap from './translateServiceMap';
import fs from 'mz/fs';
import globby from 'globby';
import readServiceMap from './readServiceMap';
import readJsonFile from './readJsonFile';
import indentString from 'indent-string';

export default async function translateApisDir (apisDir: string): Promise<string> {
  let result = '';
  const preamble = await fs.readFile(require.resolve('../data/preamble.js'), 'utf8');
  result += preamble + '\n\n';
  const services = await readServiceMap(apisDir);
  const body = generate(await translateServiceMap(services, async (versionPattern: string): Promise<ServiceVersionDef> => {
    await globby(path.resolve(apisDir, versionPattern + '.normal.json'));
    const [versionFile] = await globby(path.resolve(apisDir, versionPattern + '.normal.json'));
    if (!versionFile) return;
    return (await readJsonFile(versionFile): any);
  })) + '\n\n';
  result += indentString(body, 1, '  ');
  const postamble = await fs.readFile(require.resolve('../data/postamble.js'), 'utf8');
  result += postamble + '\n\n';
  result = result
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\n\n( *\})/g, '\n$1')
    .replace(/(\{)\n\n/g, '$1\n')
    .replace(/\n*$/, '\n');
  return result;
}
