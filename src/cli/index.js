/* @flow */

import path from 'path';
import translateApisDir from '../translateApisDir';
import meow from 'meow';

async function main () {
  const cli = meow(false && `
  Usage
    $ aws-sdk-flow-decl-gen [apis-dir]
  `);
  const { input } = cli;
  const apisDir = input[0] || path.resolve(__dirname, '..', '..', 'test', 'data', 'aws-sdk', 'apis');
  process.stdout.write(await translateApisDir(apisDir));
}

main().catch(e => {
  process.stderr.write(e.stack);
  process.exit(64);
});
