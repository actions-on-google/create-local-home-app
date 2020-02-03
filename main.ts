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

import * as fs from "fs";
import * as path from "path";

import replace from "replace-in-file";
import * as yargs from "yargs";

import { Bundler, filterFiles, filterPackages, IPackageJson } from "./index";

const supportedBundlers = Object.values(Bundler);
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

async function main() {
  const selectedTag = argv.bundler as string;
  const srcDir = argv.template as string;
  const destDir = argv.destdir as string;
  const excludedTags = supportedBundlers.filter((t) => t !== selectedTag);
  // create app directory.
  await new Promise((resolve, reject) => {
    fs.mkdir(destDir, { recursive: true }, (errMkdir) => {
      if (errMkdir !== null) {
        console.error("error creating destination directory:", destDir, errMkdir);
        reject(errMkdir);
      } else {
        resolve();
      }
    });
  });

  // filter files to copy.
  const filePairs = await new Promise<Array<[string, string]>>((resolve, reject) => {
    fs.readdir(srcDir, { withFileTypes: true }, (errReaddir, entries) => {
      if (errReaddir !== null) {
        console.error("error reading source directory:", srcDir, errReaddir);
        reject(errReaddir);
      } else {
        resolve(entries
                .filter((f) => f.isFile())
                .map((f) => f.name)
                .flatMap(filterFiles(selectedTag, ...excludedTags)));
      }
    });
  });

  // copy files
  await Promise.all(filePairs.map(([srcFile, destFile]) => new Promise((resolve, reject) => {
    fs.copyFile(path.join(srcDir, srcFile),
                path.join(destDir, destFile), (errCopyFile) => {
                  if (errCopyFile !== null) {
                    console.error("error copying file:", srcFile, errCopyFile);
                    reject(errCopyFile);
                  } else {
                    resolve();
                  }
                });
  })));

  // search and replace renamed files
  await Promise.all(filePairs
                    .filter(([srcFile, destFile]) => (srcFile !== destFile))
                    .map(([srcFile, destFile]) => replace({
                      files: path.join(destDir, "*"),
                      from: new RegExp(srcFile, "g"),
                      to: destFile,
                    })));

  // rewrite package.json deps and rules in-place.
  // note: use dest dir, since some content might be updated from the earlier step.
  await new Promise((resolve, reject) => {
    fs.readFile(path.join(destDir, "package.json"), (errReadFile, buf) => {
      if (errReadFile !== null) {
        console.error("error reading package file:", errReadFile);
        reject(errReadFile);
      } else {
        const packageJson: IPackageJson = JSON.parse(buf.toString());
        filterPackages(packageJson, selectedTag, ...excludedTags);
        fs.writeFile(path.join(destDir, "package.json"),
                     JSON.stringify(packageJson, null, 4), (errWriteFile) => {
                       if (errWriteFile !== null) {
                         console.error("error writing package file:", errWriteFile);
                         reject(errWriteFile);
                       } else {
                         resolve();
                       }
                     });
      }
    });
  });
}

main();
