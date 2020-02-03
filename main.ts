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

import { createLocal, supportedBundlers } from "./index";

const argv = yargs
      .scriptName("create-local-home-sdk")
      .usage("$0 <destdir>",
             "initialize Local Home SDK application",
             (y: yargs.Argv) => {
               return y.positional("destdir", {
                 describe: "destination directory",
               });
             })
      .option("template", {
        default: path.join(__dirname, "app"),
      })
      .option("bundler", {
        choices: supportedBundlers,
        default: "none",
        describe: "choose a bundler ",
      })
      .demandOption(["destdir"])
      .argv;

createLocal(argv.bundler as string,
            argv.template as string,
            argv.destdir as string);
