/* @flow */

import readJsonFile from './readJsonFile';
import globby from 'globby';
import { entries } from './utils';
import path from 'path';
import uniq from 'lodash.uniq';

export default async function readServiceMap (apisDir: string): Promise<ServiceMap> {
  const services: ServiceMap = (await readJsonFile(path.resolve(apisDir, 'metadata.json')): any);
  for (const [key, service]: [string, ServiceDef] of entries(services)) {
    const prefix = service.prefix || key;
    const fileCandidates = await globby(path.resolve(apisDir, prefix + '-*.json'));
    service.versions = uniq(fileCandidates
      .map(f => path.basename(f))
      .map(f => /^(.+?)-(\d+-\d+-\d+)\.(normal|min)\.json$/.exec(f))
      .filter(m => m && m[1] === prefix)
      .map(m => m[2])); // version
  }
  return services;
}
