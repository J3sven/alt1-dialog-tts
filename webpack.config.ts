import alt1chain from "@alt1/webpack";
import * as path from "path";
const CopyWebpackPlugin = require('copy-webpack-plugin');

var srcdir = path.resolve(__dirname, "./src/");
var outdir = path.resolve(__dirname, "./dist/");

var config = new alt1chain(srcdir, { ugly: false });

config.entry("index", "./index.ts");

config.output(outdir);

// extend the chain
config.chain.plugin('copy-webpack-plugin')
    .use(CopyWebpackPlugin, [{
      patterns: [
        { from: path.resolve(__dirname, './src/voices'), to: 'tts/voices' }, // Move voices to ./dist/tts/voices
        { from: path.resolve(__dirname, './src'), to: 'tts', globOptions: { ignore: ['**/landing/**'] } }, // Copy contents of ./src excluding ./src/landing to ./dist/tts
        { from: path.resolve(__dirname, './src/landing'), to: './' }, // Copy contents of ./src/landing to ./dist
      ],
    }]);

export default config.toConfig();
