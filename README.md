# io-link

`io-link` is a webservice that generates and handles **Dynamic Links** that either link to a screen in a configured mobile app and to a fallback URL when the mobile app is not installed.

It contains also an `endpoint` to generate QR Codes that embeds dynamic links for [IO App](https://github.com/pagopa/io-app).

## Development

### Prerequisites

In order to build `io-link` in our local machine you need

- `Node.js 20`
- `yarn 3`

The preferred way to set up the local environment is using [nodenv](https://github.com/nodenv/nodenv) to manage `Node.js` installation and `corepack` (included with `Node.js`) to manage the installation of `yarn`.

### Release management

This project uses [changesets](https://github.com/changesets/changesets) to automate updating package versions, and changelogs.

Each Pull Request that includes changes that require a version bump should include a `changeset` file that describe that changes.

To create a new `changeset` file run `yarn changeset` from the project root.

### Useful commands

```
# build the project
yarn build

# run test
yarn test

# run test with coverage
yarn coverage

# format source code (using prettier)
yarn format

# run in development mode (+ watch)
# in development mode you can set environment variables
# by putting a file named `.env` in the root folder
yarn start:dev
```

## Configuration

`io-link` relies on environment variables for configuration. If is the first time you work with environment variables you can learn more on [Learn Environment Variables](https://github.com/dwyl/learn-environment-variables)

```ini
# REQUIRED
FALLBACK_URL=the url that will be opened when the mobile app is not installed

# OPTIONAL, set to enable universal link support to iOS App
IOS_APP_ID=apple id of the mobile app (it also known as "market id")
IOS_BUNDLE_ID=bundle id of the mobile app

# OPTIONAL, set to enable universal link support to Android App
ANDROID_PACKAGE_NAME=package name of the mobile app
ANDROID_SHA_256_CERT_FINGERPRINTS=you can read these from the play console

# optional variables
PORT=defaults to 3000
NODE_ENV=defaults to production
FALLBACK_URL_ON_IOS=overrides FALLBACK_URL when the device runs iOS
FULLBACK_URL_ON_ANDROID=overrides FALLBACK_URL when the device runs Andrid
```

## Routes

The routes that are not listed here should be considered "implementation details" and are based on infrastructural requirements to support universal links on Apple and Android devices.

### Obtain a QR Code that links to app screen

```http
GET /qrcode.png?feat=FEATURE[&payload]
```

This route returns a `QRCode` in `image/png` format. That contains an uniersal link to a screen of the configured app. It is mapped with the screens of [IO App](https://github.com/pagopa/io-app).

Right now feat can be:

- `firma` that maps to the main screen of [Firma con IO](https://github.com/pagopa/io-sign). In this case it will take `srid` as additional query parameter to specifiy the `signature request id`.

### Redirect to universal link

```http
GET /open?feat=FEATURE[&payload]
```

Same parameters of `/qrcode.png`, but this generates an universal link using the given payload and then redirects to it
