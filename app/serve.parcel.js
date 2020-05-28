/**
 * Copyright 2020, Google, Inc.
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

const os = require('os');
const path = require('path');

require('array.prototype.flat/auto');
const Bundler = require('parcel');
const WorkerFarm = require('@parcel/workers');
// Workaround: https://github.com/parcel-bundler/parcel/issues/2838
WorkerFarm.getShared = async function(options, farmOptions) {
  return new WorkerFarm(options, farmOptions);
};

const app = require('express')();

const arg = (process.argv[2] || ':8080').split(':')
const port = arg.pop();
const addr = arg.pop() || firstPublicAddress() || '0.0.0.0';
function firstPublicAddress() {
  return Object.values(os.networkInterfaces())
        .flat()
        .filter((iface) => iface.family === 'IPv4' && iface.internal === false)
        .map((iface) => iface.address)
        .shift();
}

const config = {sourceMaps: false, bundleNodeModules: false, outFile: 'bundle.js', hmr: false};

const bundler_web = new Bundler(
    ['index.ts'],
    { target: 'browser', outDir: 'dist/web', ...config }
)
bundler_web.on('bundled', (bundle) => {
  console.log(`[local-home-app] Chrome ondevice testing URL: http://${addr}:${port}/web/index.html`);
});

const bundler_node = new Bundler(
    ['index.ts'],
    { target: 'node', outDir: 'dist/node', ...config }
)
bundler_node.on('bundled', (bundle) => {
  console.log(`[local-home-app] Node ondevice testing URL:   http://${addr}:${port}/node/bundle.js`);
});

app.get('/web/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use('/web', bundler_web.middleware())
   .use('/node', bundler_node.middleware())
   .listen(port);
