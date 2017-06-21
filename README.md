# Travel Bot

A [nodejs](https://nodejs.org/en/) Lambda application that serves as a proxy for travel bot functionality


### Instructions

**install** - install all required packages under *./node_modules* folder

```shell
yarn install
```

**build** - creates the build artifacts under the *./build* folder

```shell
yarn build
```

**deploy** - creates the build artifacts and deploy it to AWS Lambda

```shell
yarn deploy
```

**test** - run the codes through all unit tests under the *./test* folder, already included inside *build* and *compile* commands

```shell
yarn run test
```

**test:watch** - watch for changes inside unit tests

```shell
yarn run test:watch
```

**clean** - cleans the build artifacts directories

```shell
yarn run clean
```
