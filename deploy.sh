#!/usr/bin/env bash

# Send a PR to $TARGET_REPO

PACKAGE_NAME=$(jq -r ".name" package.json)
PACKAGE_VERSION=$(npm view $PACKAGE_NAME@latest version)

rm -rf targetRepo
git clone $TARGET_REPO targetRepo --depth 1
cd targetRepo
TARGET_BRANCH=gen-$PACKAGE_VERSION
git checkout -b $TARGET_BRANCH
cp ../test/artifacts/aws-sdk.decls.js .
git add aws-sdk.decls.js
git diff --cached --exit-code
if [ $? -eq 0 ]; then
  echo "No changes detected, not deploying"
  exit 0;
fi
git config user.email "$GH_NAME"
git config user.name "$GH_EMAIL"
git commit -m "feat: regenerate with $PACKAGE_NAME@$PACKAGE_VERSION" "--author=$GH_NAME <$GH_EMAIL>"

mkdir -p hub
curl https://github.com/github/hub/releases/download/v2.2.4/hub-linux-amd64-2.2.4.tgz -sL | tar zxf - -C hub --strip-components 1

mkdir -p ~/.config
if [[ ! -e ~/.config/hub ]]; then cat > ~/.config/hub <<CONFIG
---
github.com:
- protocol: https
  user: $GH_USER
  oauth_token: $GH_BOT_TOKEN
CONFIG
fi

hub/bin/hub push origin  $TARGET_BRANCH
hub/bin/hub pull-request -m "Use $PACKAGE_NAME@$PACKAGE_VERSION"
