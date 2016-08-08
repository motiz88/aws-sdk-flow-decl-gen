/* @flow */

/*
// We're blocked by https://github.com/facebook/flow/issues/1815 from doing:

import http from 'http';
import https from 'https';
type httpAgent = http.Agent | https.Agent;

*/

type httpAgent = Object;

declare module 'aws-sdk' {
  declare type Credentials = any;

  declare type CredentialProviderChain = any;

  declare type $ConfigOptions = {
    accessKeyId?: string,
    secretAccessKey?: string,
    sessionToken?: Credentials,
    credentials?: Credentials,
    credentialProvider?: CredentialProviderChain,
    region?: string,
    maxRetries?: number,
    maxRedirects?: number,
    sslEnabled?: boolean,
    paramValidation?: boolean | {
      min?: boolean,
      max?: boolean,
      pattern?: boolean,
      enum?: boolean
    },
    computeChecksums?: boolean,
    convertResponseTypes?: boolean,
    correctClockSkew?: boolean,
    s3ForcePathStyle?: boolean,
    s3BucketEndpoint?: boolean,
    s3DisableBodySigning?: boolean,
    retryDelayOptions?: {
      base?: number,
      customBackoff?: (retryCount: number) => number
    },
    httpOptions?: {
      proxy?: string,
      agent?: httpAgent,
      timeout?: number,
      xhrAsync?: boolean,
      xhrWithCredentials?: boolean
    },
    apiVersion?: string | Date,
    apiVersions?: {[key: string]: string | Date},
    logger?: void | {write: Function} | {log: Function},
    systemClockOffset?: number,
    signatureVersion?: string,
    signatureCache?: boolean
  }

  declare class Config {
    logger?: void | {write: Function} | {log: Function}
  }

  declare var config: Config;

  declare class Service {
    constructor (config?: $ConfigOptions): Service;
    apiVersions: string[];
    defineService(serviceIdentifier: string, versions: string[], features: Object): Class<Service>;
    makeRequest(operation: string, params: Object, callback: (err: ?Error, data: ?Object) => void): void;
    makeUnauthenticatedRequest(operation: string, params: Object, callback: (err: ?Error, data: ?Object) => void): void;
    setupRequestListeners(): void;
    waitFor(state: string, params: Object, callback: (err: ?Error, data: ?Object) => void): void;
  }

  declare class Request<T> {
    promise(): Promise<T>;
  }
  declare type $Callback<T> = (error: ?Error, data: ?T) => void;
  declare type $APIMethod<Params, Result> = (params: Params, cb?: $Callback<Result>) => Request<Result>;
