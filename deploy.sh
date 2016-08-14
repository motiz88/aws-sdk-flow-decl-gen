#!/usr/bin/env bash

# Send a PR to $TARGET_REPO

PACKAGE_NAME=$(jq -r ".name" package.json)
PACKAGE_VERSION=$(jq -r ".version" package.json)

rm -rf targetRepo
git clone $TARGET_REPO targetRepo --depth 1
cd targetRepo
TARGET_BRANCH=gen-$PACKAGE_VERSION
git checkout -b $TARGET_BRANCH
cp ../test/artifacts/aws-sdk.decls.js .
git add aws-sdk.decls.js
if [[ -n "$(git diff --cached --exit-code)" ]]; then exit 0; fi
git commit -m "feat: regenerate with $PACKAGE_NAME@$PACKAGE_VERSION" "--author=$GH_COMMITTER"

which hub || gem install hub

mkdir -p ~/.config
if [[ ! -e ~/.config/hub ]]; then cat > ~/.config/hub <<CONFIG
---
github.com:
- protocol: https
  user: $GH_USER
  oauth_token: $GH_TOKEN
CONFIG
fi

hub push origin  $TARGET_BRANCH
hub pull-request -m "Use $PACKAGE_NAME@$PACKAGE_VERSION"
