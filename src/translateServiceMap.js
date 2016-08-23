/* @flow */

import translateServiceVersion from './translateServiceVersion';
import makeServiceClass from './makeServiceClass';
import { entries } from './utils';

export default async function translateServiceMap (
  services: ServiceMap,
  getServiceVersion: (versionPattern: string) => Promise<?ServiceVersionDef>
): Promise<mixed> {
  const allTypes = [];
  const allClasses = [];
  for (const [key, service]: [string, ServiceDef] of entries(services)) {
    const prefix = service.prefix || key;
    const versions = (await Promise.all(
      (service.versions || ['*'])
      .map((version: string) => getServiceVersion(prefix + '-' + version))
    )).filter(Boolean);

    for (const versionApi of versions) {
      const { types, classes } = translateServiceVersion(versionApi, service);
      allTypes.push(...types);
      allClasses.push(...classes);
    }
    const serviceClassAst = makeServiceClass(versions, service);
    allClasses.push(serviceClassAst);
  }
  return [
    ...allTypes, ...allClasses
  ];
}
