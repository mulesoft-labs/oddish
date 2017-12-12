# Oddish [![Build Status](https://travis-ci.org/mulesoft-labs/oddish.svg)](https://travis-ci.org/mulesoft-labs/oddish)

## usage

* `npm i --save-dev oddish@latest`
* add a script to your package.json that run oddish
  ```json
  scripts: {
    // ...scripts,
    "release": "oddish"
  }
  ```
* ????
* PROFIT!


## .travis.yml

For a better integration we recommend to add it to your travis build as follows:

```yml
language: node_js
node_js:
- 8

before_install:
- echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" >> .npmrc

script:
- npm run build
- npm run test

after_success:
- npm run release
```

## Local usage

* `npm i -g oddish@latest`
* `oddish` from project root 

## How it works

oddish will:

- Publish in `latest` on git tags, also in `latest-x.x.x`
- Publish in `latest-x.x.x` if and only if you did not publish any greather version in that tag

That makes things simpler, you will end up installing `npm i my-pkg@latest-2.1.0`, that package will contain the latest 2.1.0 version. And if exist, the stable version.

Once a stable version is published to a tag, oddish will not touch that tag again.

