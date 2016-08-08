/* @flow */

export default function translateServiceVersionName (
  { apiVersion }: ServiceVersionMetadata,
  { name }: ServiceDef
): string {
  return name + '$' + apiVersion.replace(/-/g, '');
}
