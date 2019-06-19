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

import "array.prototype.flatmap/auto";
import * as path from "path";

import { FullVersion } from "package-json";

type Writable<T> = {
    -readonly [K in keyof T]: Writable<T[K]>
};
export type IPackageJson = Writable<FullVersion>;

export enum Bundler {
  WEBACK = "webpack",
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
      return [[f, f.replace(`${selectedTag}`, "template")]];
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
        packageJson.scripts[s.replace(`-${selectedTag}`, "")] = packageJson.scripts[s];
        delete packageJson.scripts[s];
      }
    }
  }
  return packageJson;
}
