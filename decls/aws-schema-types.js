/* @flow */

declare type ShapeRef = {
  shape: string
};

declare type ResultWrapperRef = ShapeRef & {
  resultWrapper: string
};

declare type ShapeDef = {
  type: 'structure',
  required?: string[],
  members: {
    [key: string]: ShapeRef
  }
}
|
{ type: 'string' | 'boolean' | 'timestamp'}
|
{
  type: 'string',
  enum: string[]
}
|
{
  type: 'string',
  min: number,
  max: number,
}
|
{
  type: 'list',
  member: ShapeRef
}
|
{
  type: 'integer' | 'long',
  min?: number,
  max?: number
}
|
{
  type: 'map',
  key: ShapeRef,
  value: ShapeRef
}
;

declare type OperationDef = {
  input: ShapeRef | ShapeDef,
  output?: ShapeRef | ShapeDef
};

declare type ServiceVersionMetadata = {
  apiVersion: string,
  endpointPrefix: string,
  jsonVersion: string,
  serviceAbbreviation: string,
  serviceFullName: string,
  signatureVersion: string,
  targetPrefix: string,
  timestampFormat: string,
  protocol: string
};

declare type Shapes = {
  [key: string]: ShapeDef
};

declare type Operations = {
  [key: string]: OperationDef
};

declare type ServiceVersionDef = {
  metadata: ServiceVersionMetadata,
  operations: Operations,
  shapes: Shapes
};

declare type ServiceDef = {
  name: string,
  prefix?: string,
  versions?: string[]
};

declare type ServiceMap = {
  [key: string]: ServiceDef
};
