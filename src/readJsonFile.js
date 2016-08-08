/* @flow */

import fs from 'mz/fs';

export default async function readJsonFile (filename: string): Promise<mixed> {
  return JSON.parse(await fs.readFile(filename, 'utf8'));
}
