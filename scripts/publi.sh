#!/usr/bin/env bash
echo "pwd=$(pwd)"

export DEFAULT_BASE_VERSION
DEFAULT_BASE_VERSION="$(npm view . version)"
if [ -z "$DEFAULT_BASE_VERSION" ]; then
   DEFAULT_BASE_VERSION='1.0.0'
fi

export GIT_BRANCH
${GIT_BRANCH:=$BRANCH_NAME} # Jenkins
${GIT_BRANCH:=$TRAVIS_BRANCH} # Travis

if [ -z "${GIT_BRANCH}" ]; then
  GIT_BRANCH=$(git symbolic-ref --short HEAD)
fi
echo "branch=${GIT_BRANCH}"

export TAG="latest"
if [ "${GIT_BRANCH}" = "master" ]; then
  TAG="latest"
elif [ "${GIT_BRANCH}" = "develop" ]; then
  TAG="next"
else
  TAG=${GIT_BRANCH}
fi
echo "tag=$TAG"

export LATEST_VERSION
LATEST_VERSION=$(npm v . "dist-tags.$TAG")
if [ "$LATEST_VERSION" = "undefined" ]; then
  LATEST_VERSION="$DEFAULT_BASE_VERSION-$GIT_BRANCH"
elif [ "$LATEST_VERSION" = "" ]; then
  LATEST_VERSION="$DEFAULT_BASE_VERSION-$GIT_BRANCH"
fi
echo "base version=$LATEST_VERSION"

export NEW_VERSION
npm version "${LATEST_VERSION}" --force --no-git-tag-version 2> /dev/null 1> /dev/null
NEW_VERSION=$(npm version prerelease --force --no-git-tag-version 2> /dev/null)
echo "publishing branch ${GIT_BRANCH} with version ${NEW_VERSION}"

set -e # Break the script if it fails
if [ "${TAG}" = "latest" ]; then
  npm publish
else
  npm publish "--tag=$TAG"
fi
