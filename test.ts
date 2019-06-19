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
import test, {CbMacro} from "ava";
import * as fs from "fs";
import * as path from "path";
import { Bundler, filterFiles, filterPackages, IPackageJson } from "./index";
import { FullVersion } from "package-json";

const testFilterPackages: CbMacro<[string]> = (t, selected: string) => {
  const excluded = Object.values(Bundler).filter((b) => b !== selected);
  fs.readFile(path.join("app", "package.json"), (err, buf) => {
    if (err !== null) {
      t.fail(err.toString());
      return;
    }
    const packageJson: IPackageJson = JSON.parse(buf.toString());
    const filteredPackageJson  = filterPackages(packageJson, selected, ...excluded);
    t.assert(filteredPackageJson.devDependencies !== undefined);
    if (filteredPackageJson.devDependencies !== undefined) {
      if (selected !== Bundler.NONE) {
        t.true(selected in filteredPackageJson.devDependencies);
      }
      for (const e of excluded) {
        t.false(e in filteredPackageJson.devDependencies);
      }
    }
    t.assert(filteredPackageJson.scripts !== undefined);
    if (filteredPackageJson.scripts !== undefined) {
      t.true('build' in filteredPackageJson.scripts);
      t.true('start' in filteredPackageJson.scripts);
      if (selected !== Bundler.NONE) {
        t.true(filteredPackageJson.scripts['build'].includes(selected));
        t.true(filteredPackageJson.scripts['start'].includes(selected));
      }
      for (const s of Object.keys(filteredPackageJson.scripts)) {
        t.false(s.includes('-'));
      }
    }
    t.snapshot(filteredPackageJson);
    t.end();
  });
};
testFilterPackages.title = (providedTitle = 'filterPackages', bundler) => `${providedTitle} ${bundler}`;

for (const b of Object.values(Bundler)) {
  test.cb(testFilterPackages, b);
}

test("filterFiles", (t) => {
  const files = ["webpack.config.js", "index.webpack.html", "rollup.config.js", "package.json"];
  t.deepEqual(files.flatMap(filterFiles("webpack", "rollup")),
              [["webpack.config.js","webpack.config.js"],
               ["index.webpack.html", "index.template.html"],
               ["package.json", "package.json"]]);
});
