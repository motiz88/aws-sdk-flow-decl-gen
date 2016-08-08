/* @flow */

import { builders as b } from 'ast-types';
import translateServiceName from './translateServiceName';
import translateServiceVersionName from './translateServiceVersionName';
import simpleTypeAnnotation from './simpleTypeAnnotation';
import stringEscape from 'js-string-escape';

export default function makeServiceClass (versions: ServiceVersionDef[], service: ServiceDef) {
  if (!versions.length) throw new Error(`service ${service.name}: no versions`);
  const latestVersion = versions.reduce((a, b) =>
    (a.metadata.apiVersion > b.metadata.apiVersion) ? a : b
  );
  return {
    type: 'DeclareClass',
    id: b.identifier(translateServiceName(service)),
    typeParameters: null,
    body: b.objectTypeAnnotation([
      ...versions.map(
        ({metadata}: ServiceVersionDef) => makeServiceVersionConstructor(metadata, service)
      ),
      makeServiceVersionDefaultConstructor(latestVersion.metadata, service)
    ]),
    extends: []
  };
}

function makeServiceVersionDefaultConstructor (metadata: ServiceVersionMetadata, service: ServiceDef) {
  return b.objectTypeProperty(
    b.identifier('constructor'),
    b.functionTypeAnnotation(
      [],
      simpleTypeAnnotation(translateServiceVersionName(metadata, service)),
      null,
      null
    ),
    false
  );
}

function makeServiceVersionConstructor (metadata: ServiceVersionMetadata, service: ServiceDef) {
  return b.objectTypeProperty(
    b.identifier('constructor'),
    b.functionTypeAnnotation(
      [b.functionTypeParam(
        b.identifier('config'),
        makeServiceVersionConfigType(metadata),
        false
      )],
      simpleTypeAnnotation(translateServiceVersionName(metadata, service)),
      null,
      null
    ),
    false
  );
}

function makeServiceVersionConfigType ({ apiVersion }: ServiceVersionMetadata) {
  return b.intersectionTypeAnnotation([
    simpleTypeAnnotation('$ConfigOptions'),
    b.objectTypeAnnotation(
      [b.objectTypeProperty(
        b.identifier('apiVersion'),
        b.stringLiteralTypeAnnotation(
          apiVersion,
          "'" + stringEscape(apiVersion) + "'"
        ),
        false
      )],
      [],
      []
    )
  ]);
}
