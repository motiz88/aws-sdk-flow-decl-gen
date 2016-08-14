# aws-sdk-flow-decl-gen
[![circle][circle-image]][circle-url]
[![npm][npm-image]][npm-url]
[![coverage][coverage-image]][coverage-url]

[![semantic release][semantic-release-image]][semantic-release-url]
[![js-semistandard-style][semistandard-image]][semistandard-url]
[![Apache License, Version 2.0][license-image]][license-url]

Generate Flow declaration types from the AWS SDK for JavaScript.

`aws-sdk-flow-decl-gen` is the declaration _generator_; the actual type declarations are [here][gh-decls-url]. Occasionally, newer ones may be found on the CI server [here][ci-decls-url].

This is an early release. Use with caution. There will be changes (to be communicated via semver).

Built with [astring-flow](https://github.com/motiz88/astring-flow) and my (hopefully temporary) [fork](https://github.com/motiz88/astring) of [Astring](https://github.com/davidbonnet/astring).

[circle-image]: https://img.shields.io/circleci/project/motiz88/aws-sdk-flow-decl-gen.svg?style=flat-square
[circle-url]: https://circleci.com/gh/motiz88/aws-sdk-flow-decl-gen
[npm-image]: https://img.shields.io/npm/v/aws-sdk-flow-decl-gen.svg?style=flat-square
[npm-url]: https://npmjs.org/package/aws-sdk-flow-decl-gen
[semantic-release-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[license-image]: https://img.shields.io/badge/license-Apache2.0-brightgreen.svg?style=flat-square
[license-url]: http://www.apache.org/licenses/LICENSE-2.0
[semistandard-image]: https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square
[semistandard-url]: https://github.com/Flet/semistandard
[coverage-image]: https://img.shields.io/codecov/c/github/motiz88/aws-sdk-flow-decl-gen.svg
[coverage-url]: https://codecov.io/gh/motiz88/aws-sdk-flow-decl-gen
[gh-decls-url]: https://github.com/motiz88/aws-sdk-flow-decls
[ci-decls-url]: https://circleci.com/api/v1/project/motiz88/aws-sdk-flow-decl-gen/latest/artifacts/0/$CIRCLE_ARTIFACTS/aws-sdk.decls.js?filter=successful&branch=master
