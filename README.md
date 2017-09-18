# Oddish

## usage

* `npm i --save-dev oddish@latest`
* add a script to your package.json that run oddish
  ```json
  scripts:{
    ...scripts,
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

oddish will take your branch name and depending on it will create a tag, `develop` and `master` are being mapped to `next` and `latest` respectively. The version will be incremented by `prerelease` from latest version associated with that tag and publish this to NPM. If there is no version associated with the tag, the version of your package.json will be taken as base. 

