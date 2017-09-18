# Oddish [![Build Status](https://travis-ci.org/mulesoft-labs/oddish.svg)](https://travis-ci.org/mulesoft-labs/oddish)

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
