import serve from 'rollup-plugin-serve'
import config from './rollup.config'

config.plugins.push(serve({
  contentBase: 'dist',
  port: 8080
}))
export default config;
