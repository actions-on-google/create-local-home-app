# Create Local Home App

Create a new [Local Home](https://developers.google.com/actions/smarthome/concepts/local)
app project targeting the [Local Home SDK](https://www.npmjs.com/package/@google/local-home-sdk)
with optional bundler support.

## Prerequisites

- [Node.js](https://nodejs.org/) LTS 10.16.0+

## Quickstart

```
npm init @google/local-home-app app/
cd app
npm install
npm run build
npm start
```

This will generate a new project scaffold with no bundler configuration enabled,
and begin serving the app from your local machine.

## Usage

To create a new Local Home app, run:

```
npm init @google/local-home-app app/
```

This will generate a new TypeScript project with the following structure:

```
app/
├── index.ts
├── test.ts
├── index.template.html
├── package.json
├── tsconfig.json
├── tslint.json
└── .gitignore
```

Open `index.ts` and begin adding your fulfillment code for the Local Home intents.

## Built-in commands

The generated project supports the following commands:

#### `npm run build`

Compile the TypeScript source (optionally [bundling the JS](#bundler-support))
and generate `index.html` for hosting the development app into `dist/`

#### `npm start`

Start a local development server with the files in `dist/`

#### `npm test`

Run ava tests from `test.ts`.

#### `npm run compile`

Check that TypeScript code compile without creating any output.

#### `npm run lint`

Check TypeScript files for common syntax and formatting issues.

## Bundler support

To create a new project with support for one of the following bundlers,
add the `--bundler` option as shown in the options below:

### `webpack`

Generate a new project with support for [webpack](https://webpack.js.org/).

```
npm init @google/local-home-app app/ --bundler webpack
```

### `rollup`

Generate a new project with support for [rollup.js](https://rollupjs.org/).

```
npm init @google/local-home-app app/ --bundler rollup
```

### `parcel`

Generate a new project with support for [Parcel](https://parceljs.org/).

```
npm init @google/local-home-app app/ --bundler parcel
```

## License

This software is available under the Apache License, Version 2.0.
See [LICENSE](LICENSE).
