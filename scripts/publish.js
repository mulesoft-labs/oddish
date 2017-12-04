const exec = require('child_process').exec;

const execute = (command) => {
  let onSuccess;
  let onError;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      onError(stderr);
    } else {
      onSuccess(stdout);
    }
  });
  return new Promise((success, error) => {
    onSuccess = success;
    onError = error;
  });
};

console.log(`Current directory: ${process.cwd()}`);

const run = async () => {
  const version = await execute('npm view . version');
  const baseVersion = version || '1.0.0';
  let branch = process.env.BRANCH_NAME || process.env.TRAVIS_BRANCH || '';
  let tag;
  let latestVersion;
  let newVersion;

  if (!branch) {
    branch = await execute('git symbolic-ref --short HEAD');
  }

  console.log(`Using branch ${branch}`);

  if (branch === 'master') {
    tag = 'latest';
  } else if (branch === 'develop') {
    tag = 'next';
  } else if (branch.startsWith('dev-')) {
    tag = branch;
  }

  if (tag) {
    console.log(`Using tag ${tag}`);
    latestVersion = await execute(`npm v . dist-tags.${tag}`);
  } else {
    console.log(`No tag for version ${baseVersion} with branch ${branch}`);
  }

  if (!latestVersion || latestVersion === '' || latestVersion < baseVersion) {
    latestVersion = baseVersion;
  }

  console.log(`Using version ${latestVersion}`);

  try {
    await execute(`npm version ${latestVersion} --force --no-git-tag-version 2> /dev/null 1> /dev/null`);
  } catch (e) {
    console.warn('WARNING: Failed to set latestVersion, package.json not changed');
  }

  try {
    newVersion = await execute(`npm version prerelease --force --no-git-tag-version 2> /dev/null`);
  } catch (e) {
    console.error('Failed to bump prerelease\n\n', e);
    process.exit(1);
  }

  console.log(`Publishing branch ${branch} with version ${newVersion}`);

  try {
    if (tag === 'latest' || !tag) {
      await execute('npm publish');
    } else {
      await execute(`npm publish --tag=${tag}`);
    }
  } catch (e) {
    console.error('Failed to publish\n\n', e);
    process.exit(1);
  }
}

run();