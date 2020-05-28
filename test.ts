/*
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
import * as os from "os";
import * as path from "path";

import "array.prototype.flatmap/auto";
import test, {Macro, CbMacro} from "ava";
import { FullVersion } from "package-json";
import * as yargs from "yargs";

import { Bundler, filterFiles, filterPackages, IPackageJson, createLocal } from "./index";

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
      if (selected !== Bundler.NONE) {
        t.regex(filteredPackageJson.scripts['build-web'], new RegExp(selected));
        t.regex(filteredPackageJson.scripts['build-node'], new RegExp(selected));
      }
      for (const s of Object.keys(filteredPackageJson.scripts)) {
        t.notRegex(s, new RegExp(`-${selected}`));
      }
      for (const s of Object.values(filteredPackageJson.scripts)) {
        t.notRegex(s, new RegExp(`\\.${selected}`));
      }
    }
    t.snapshot(filteredPackageJson);
    t.end();
  });
};
testFilterPackages.title = (providedTitle = "filterPackages", bundler) => `${providedTitle} ${bundler}`;

for (const b of Object.values(Bundler)) {
  test.cb(testFilterPackages, b);
}

test("filterFiles", (t) => {
  const files = ["webpack.config.js", "serve.webpack.js", "rollup.config.js", "package.json"];
  t.deepEqual(files.flatMap(filterFiles("webpack", "rollup")),
              [["webpack.config.js","webpack.config.js"],
               ["serve.webpack.js", "serve.js"],
               ["package.json", "package.json"]]);
});

test("createLocal npm install", async (t) => {
  const projectDir = await new Promise<string>((resolve, reject) => {
    fs.mkdtemp(path.join(os.tmpdir(), "create-local-app-"), (err, tmpDir) => {
      if (err !== null) {
        reject(err);
      } else {
        resolve(path.join(tmpDir, "app"));
      }
    });
  });
  await createLocal('none', path.join(__dirname, "app"), projectDir);
  const stats = await new Promise<fs.Stats>((resolve, reject) => {
    fs.stat(path.join(projectDir, "node_modules"), (errStat, stats) => {
      if (errStat !== null) {
        reject(errStat);
      } else {
        resolve(stats);
      }
    });
  });
  t.true(stats.isDirectory());
});
