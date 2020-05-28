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

import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

import "array.prototype.flatmap/auto";
import { FullVersion } from "package-json";
import replace from "replace-in-file";

type Writable<T> = {
    -readonly [K in keyof T]: Writable<T[K]>
};
export type IPackageJson = Writable<FullVersion>;

export enum Bundler {
  WEBPACK = "webpack",
  ROLLUP = "rollup",
  PARCEL = "parcel",
  NONE = "none",
}

export function filterFiles(selectedTag: string, ...excludedTags: string[]) {
  return (f: string): Array<[string, string]> => {
    const basename = path.parse(f).name;
    // exclude.
    for (const excludedTag of excludedTags) {
      if (basename.includes(excludedTag)) {
        return [];
      }
    }
    // rename.
    if (basename.endsWith(`.${selectedTag}`)) {
      return [[f, f.replace(`.${selectedTag}`, "")]];
    }
    // include.
    return [[f, f]];
  };
}

export function filterPackages(packageJson: IPackageJson, selectedTag: string, ...excludedTags: string[]) {
  // exclude deps.
  if (packageJson.devDependencies !== undefined) {
    for (const dd of Object.keys(packageJson.devDependencies)) {
      for (const excludedTag of excludedTags) {
        if (dd.includes(excludedTag)) {
          delete packageJson.devDependencies[dd];
        }
      }
    }
  }
  if (packageJson.scripts !== undefined) {
    for (const s of Object.keys(packageJson.scripts)) {
      // exclude scripts.
      for (const excludedTag of excludedTags) {
        if (s.endsWith(`-${excludedTag}`)) {
          delete packageJson.scripts[s];
        }
      }
      // rename scripts.
      if (s.endsWith(`-${selectedTag}`)) {
        const script = packageJson.scripts[s].replace(`.${selectedTag}`, "");
        packageJson.scripts[s.replace(`-${selectedTag}`, "")] = script;
        delete packageJson.scripts[s];
      }
    }
  }
  return packageJson;
}

export async function createLocal(selectedTag: string, srcDir: string, destDir: string) {
  const excludedTags = Object.values(Bundler).filter((t) => t !== selectedTag);
  // create app directory.
  await new Promise((resolve, reject) => {
    fs.mkdir(destDir, (errMkdir) => {
      if (errMkdir !== null) {
        console.error("error creating destination directory:", destDir, errMkdir);
        reject(errMkdir);
      } else {
        resolve();
      }
    });
  });
  // get source files.
  const files = await new Promise<string[]>((resolve, reject) => {
    fs.readdir(srcDir, (errReaddir, entries) => {
      if (errReaddir !== null) {
        console.error("error reading source directory:", srcDir, errReaddir);
        reject(errReaddir);
      } else {
        resolve(Promise.all(entries.map((entry) => new Promise<string[]>((res, rej) => {
            fs.stat(path.join(srcDir, entry), (errStat, stats) =>  {
              if (errStat !== null) {
                console.error("error getting source file stats:", entry, errStat);
                rej(errStat);
              } else {
                if (stats.isFile()) {
                  res([entry]);
                } else {
                  res([]);
                }
              }
            });
        }))).then((result) => result.flatMap((x) => x)));
      }
    });
  });
  // filter files to copy.
  const filePairs = files.flatMap(filterFiles(selectedTag, ...excludedTags));
  // copy files
  await Promise.all(filePairs.map(([srcFile, destFile]) => new Promise((resolve, reject) => {
    fs.readFile(path.join(srcDir, srcFile), (errReadFile, data) => {
      if (errReadFile !== null) {
        console.error("error reading source file:", srcFile, errReadFile);
        reject(errReadFile);
      } else {
        fs.writeFile(path.join(destDir, destFile), data, (errWriteFile) => {
          if (errWriteFile !== null) {
            console.error("error writing destination file:", destFile, errWriteFile);
            reject(errWriteFile);
          } else {
            resolve();
          }
        });
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
  // run npm install.
  await new Promise((resolve, reject) => {
    const npmInstall = spawn("npm", ["install", "--prefix", destDir], {stdio: "inherit"});
    let errSpawn: Error;
    npmInstall.on("error", (err) => {
      errSpawn = err;
    });
    npmInstall.on("exit", (code, signal) => {
      if (errSpawn || code !== 0 || signal !== null) {
        console.error("npm install failed:", errSpawn, code, signal);
        reject(errSpawn || new Error("npm install failed"));
      } else {
        resolve();
      }
    });
  });
}
