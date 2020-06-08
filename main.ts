#!/usr/bin/env node

/**
 * Copyright 2020, Google LLC
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

import yargs from "yargs";

import { Bundler, createLocal } from "./index";

interface ICreateLocalArgv {
  projectDirectory?: string;
  bundler: string;
  template: string;
}

const _ = yargs
    .scriptName("create-local-home-app")
    .usage("$0 [project-directory]",
           "Initialize a new Local Home SDK application",
           (y: yargs.Argv) => {
             return y
                 .positional("project-directory", {
                   describe: "New project destination directory",
                 })
                 .option("template", {
                   default: path.join(__dirname, "app"),
                   hidden: true,
                 })
                 .option("bundler", {
                   choices: Object.values(Bundler),
                   demandOption: "You must choose a bundler configuration",
                   describe: Object.entries({
                     [Bundler.WEBPACK]: "Bundle dependencies with Webpack",
                     [Bundler.ROLLUP]: "Bundle dependencies with Rollup",
                     [Bundler.PARCEL]: "Bundle dependencies with Parcel",
                     [Bundler.NONE]: "Compile TypeScript without bundling dependencies",
                   }).reduce((acc, [bundler, desc]) => acc + `${bundler}:\t${desc}\n`,
                             "Specify a bundler configuration\n"),
                 });
           }, (argv: ICreateLocalArgv) => {
             if (argv.projectDirectory === undefined) {
               yargs.showHelp();
               console.error("Missing required positional argument: project-directory");
               console.error("You must specificy a destination project directory");
               process.exit(1);
             }
             createLocal(argv.bundler,
                         argv.template,
                         argv.projectDirectory);
           })
    .help()
    .argv;
