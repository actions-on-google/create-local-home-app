#!/usr/bin/env node

/**
 * Copyright 2019, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as path from "path";

import * as yargs from "yargs";

import { Bundler, createLocal, supportedBundlers } from "./index";

const bundlerDescriptions = new Map<string, string>([
  [Bundler.WEBPACK, "Bundle dependencies with Webpack"],
  [Bundler.ROLLUP, "Bundle dependencies with Rollup"],
  [Bundler.PARCEL, "Bundle dependencies with Parcel"],
  [Bundler.NONE, "Compile TypeScript without bundling dependencies"],
]);

const argv = yargs
      .scriptName("create-local-home-app")
      .usage("$0 <project-directory>",
             "Initialize a new Local Home SDK application",
             (y: yargs.Argv) => {
               return y.positional("project-directory", {
                 describe: "New project destination directory",
               });
             })
      .option("template", {
        default: path.join(__dirname, "app"),
        hidden: true,
      })
      .option("bundler", {
        choices: supportedBundlers,
        describe: supportedBundlers.reduce((acc, current) => {
          return acc + `${current}:\t${bundlerDescriptions.get(current)}\n`;
        }, ""),
      })
      .demandOption("bundler", "You must choose a bundler option.")
      .argv;

createLocal(argv.bundler as string,
            argv.template as string,
            argv.projectDirectory as string);
