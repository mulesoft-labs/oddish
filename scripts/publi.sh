#!/usr/bin/env bash
export PACKAGE_NAME="$1"
if [ -z "$PACKAGE_NAME" ]; then
  PACKAGE_NAME=`npm view . name`
fi
if [ -z "$PACKAGE_NAME" ]; then
  echo ERROR: a valid npm package name is required
  exit 1
fi

export DEFAULT_BASE_VERSION=`npm view $PACKAGE_NAME version`
if [ -z "$DEFAULT_BASE_VERSION" ]; then
   DEFAULT_BASE_VERSION='1.0.0'
fi

echo "pwd=`pwd`"

export GIT_BRANCH="$TRAVIS_BRANCH"
if [ -z "$GIT_BRANCH" ]; then
   GIT_BRANCH=`git symbolic-ref --short HEAD`
fi
echo "branch=$GIT_BRANCH"

if [[ "${GIT_BRANCH}" == "master" ]]; then
  export TAG="latest"
elif [[ "${GIT_BRANCH}" == "develop" ]]; then
  export TAG="next"
else
  export TAG=${GIT_BRANCH}
fi

echo "Used target tag=$TAG"

export LATEST_VERSION=`npm v $PACKAGE_NAME dist-tags.$TAG`
echo "latest version=$LATEST_VERSION"

if [[ "$LATEST_VERSION" == "undefined" ]]; then
  LATEST_VERSION="$DEFAULT_BASE_VERSION-$GIT_BRANCH"
fi

if [[ "$LATEST_VERSION" == "" ]]; then
  LATEST_VERSION="$DEFAULT_BASE_VERSION-$GIT_BRANCH"
fi

export DEVELOP_VERSION_BASE="$LATEST_VERSION"

echo "base version=$DEVELOP_VERSION_BASE"

export NPM_USER=`npm whoami --registry https://npm.mulesoft.com 2> /dev/null`

if [ -z ${NPM_USER} ]; then
    echo 'NPM_USER NOT VALID FOR @mulesoft REGISTRY. CHECK THE ENV-VAR NPM_TOKEN'
    exit 1;
else
    echo "publishing branch ${GIT_BRANCH} with version ${DEVELOP_VERSION_BASE} AS @${NPM_USER}"
    npm version ${DEVELOP_VERSION_BASE} --force --no-git-tag-version
    npm version prerelease --force --no-git-tag-version

    set -e # Break the script if it fails

    if [[ "${TAG}" == "latest" ]]; then
      npm publish
    else
      npm publish --tag=${TAG}
    fi
fi
