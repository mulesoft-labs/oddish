#!/usr/bin/env bash
export DEFAULT_BASE_VERSION

DEFAULT_BASE_VERSION="$(npm view . version)"

if [ -z "$DEFAULT_BASE_VERSION" ]; then
   DEFAULT_BASE_VERSION='1.0.0'
fi

echo "pwd=$(pwd)"

export GIT_BRANCH
${GIT_BRANCH:=$BRANCH_NAME} # Jenkins
${GIT_BRANCH:=$TRAVIS_BRANCH} # Travis
if [ -z "${GIT_BRANCH}" ]; then
  GIT_BRANCH=$(git symbolic-ref --short HEAD)
fi

echo "branch=${GIT_BRANCH}"

export TAG="latest"
if [[ "${GIT_BRANCH}" == "master" ]]; then
  TAG="latest"
elif [[ "${GIT_BRANCH}" == "develop" ]]; then
  TAG="next"
else
  TAG=${GIT_BRANCH}
fi

echo "Used target tag=$TAG"

export LATEST_VERSION
LATEST_VERSION=$(npm v . "dist-tags.$TAG")
echo "latest version=$LATEST_VERSION"

if [[ "$LATEST_VERSION" == "undefined" ]]; then
  LATEST_VERSION="$DEFAULT_BASE_VERSION-$GIT_BRANCH"
fi

if [[ "$LATEST_VERSION" == "" ]]; then
  LATEST_VERSION="$DEFAULT_BASE_VERSION-$GIT_BRANCH"
fi

export DEVELOP_VERSION_BASE="$LATEST_VERSION"

echo "base version=$DEVELOP_VERSION_BASE"

export NPM_USER
NPM_USER=$(npm whoami --registry https://npm.mulesoft.com 2> /dev/null)

if [ -z "${NPM_USER}" ]; then
    echo 'NPM_USER NOT VALID FOR @mulesoft REGISTRY. CHECK THE ENV-VAR NPM_TOKEN'
    exit 1;
else
    npm version "${DEVELOP_VERSION_BASE}" --force --no-git-tag-version 2> /dev/null 1> /dev/null
    DEVELOP_VERSION_BASE=$(npm version prerelease --force --no-git-tag-version 2> /dev/null)
    echo "publishing branch ${GIT_BRANCH} with version ${DEVELOP_VERSION_BASE} AS @${NPM_USER}"

    set -e # Break the script if it fails

    if [[ "${TAG}" == "latest" ]]; then
      npm publish
    else
      npm publish "--tag=$TAG"
    fi
fi
