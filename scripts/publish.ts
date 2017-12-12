#!/usr/bin/env node
import { exec } from "child_process";
import semver = require("semver");
import git = require("git-rev-sync");

console.log(`> oddish`);

/**
 * Use cases
 *
 *  If no version is published, pick the version from the package.json and publish that version
 *
 *  If a version is published and the minor and major matches the package.json, publish a patch
 *
 *  If the packaje.json version minor and major differs from the published version, pick the latest published patch for the version of the package.json and increment the patch number
 *
 */

async function execute(command): Promise<string> {
  return new Promise<string>((onSuccess, onError) => {
    console.log(`> ${command}`);
    exec(command, (error, stdout, stderr) => {
      stdout.trim().length && console.log('  ' + stdout.replace(/\n/g, '\n  '));
      stderr.trim().length && console.error('! ' + stderr.replace(/\n/g, '\n  '));

      if (error) {
        onError(stderr);
      } else {
        onSuccess(stdout);
      }
    });
  });
}

async function getBranch(): Promise<string> {
  return git.branch();
}

async function setVersion(newVersion: string): Promise<string> {
  return await execute(
    `npm version "${newVersion}" --force --no-git-tag-version --allow-same-version`
  );
}

async function publish(npmTag: string[] = []): Promise<string> {
  return await execute(`npm publish` + npmTag.map($ => ' "--tag=' + $ + '"').join(''));
}

import fs = require("fs");

async function getVersion() {
  const json = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const pkgJsonVersion = json.version;

  const version = semver.parse(pkgJsonVersion.trim());

  if (!version) {
    throw new Error("Unable to parse semver from " + pkgJsonVersion);
  }

  return `${version.major}.${version.minor}.${version.patch}`;
}

async function getSnapshotVersion() {
  const commit = git.short();
  if (!commit) {
    throw new Error("Unable to get git commit");
  }
  const time = new Date().toISOString().replace(/(\..*$)/g, '').replace(/([^\dT])/g, '').replace('T', '.');

  return (await getVersion()) + '-' + time + '.commit-' + commit;
}

console.log(`  pwd: ${process.cwd()}`);

const run = async () => {
  let branch =
    process.env.BRANCH_NAME || process.env.TRAVIS_BRANCH || (await getBranch());

  let npmTag: string = null;

  let gitTag: string = process.env.TRAVIS_TAG || null;

  let newVersion: string = null;

  console.log(`  branch: ${branch}`);

  // Travis keeps the branch name in the tags' builds
  if (gitTag) {
    if (semver.valid(gitTag)) {
      // If the tags is a valid semver, we publish using that version and without any npmTag
      npmTag = null;
      newVersion = gitTag;
    } else {
      npmTag = 'tag-' + gitTag;
      newVersion = await getSnapshotVersion();
    }
  } else {
    newVersion = await getSnapshotVersion();

    if (branch === "master") {
      npmTag = "beta-" + (await getVersion());
    } else if (branch === "develop") {
      npmTag = "alpha" + (await getVersion());
    } else {
      npmTag = branch + "-branch" + (await getVersion());
    }
  }
  console.log(`  currentVersion: ${await getVersion()}`);
  console.log(`  publishing:\n    version: ${newVersion}\n    tag: ${npmTag || "<empty tag>"}\n`);

  await setVersion(newVersion);

  if (npmTag) {
    await publish([npmTag]);
  } else {
    await publish();
  }

  await execute(`npm info . dist-tags`);
};

run().catch(e => {
  console.error("Error:");
  console.error(e);
  process.exit(1);
});
