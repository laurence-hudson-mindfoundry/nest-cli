"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const webpack = require("webpack");
const ui_1 = require("../ui");
const webpack_defaults_1 = require("./defaults/webpack-defaults");
const get_value_or_default_1 = require("./helpers/get-value-or-default");
class WebpackCompiler {
    constructor(pluginsLoader) {
        this.pluginsLoader = pluginsLoader;
    }
    run(configuration, webpackConfigFactoryOrConfig, tsConfigPath, appName, isDebugEnabled = false, watchMode = false, assetsManager, onSuccess) {
        const cwd = process.cwd();
        const configPath = path_1.join(cwd, tsConfigPath);
        if (!fs_1.existsSync(configPath)) {
            throw new Error(`Could not find TypeScript configuration file "${tsConfigPath}".`);
        }
        const pluginsConfig = get_value_or_default_1.getValueOrDefault(configuration, 'compilerOptions.plugins', appName);
        const plugins = this.pluginsLoader.load(pluginsConfig);
        const relativeRootPath = path_1.dirname(path_1.relative(cwd, configPath));
        const sourceRoot = get_value_or_default_1.getValueOrDefault(configuration, 'sourceRoot', appName);
        const pathToSource = path_1.normalize(sourceRoot).indexOf(path_1.normalize(relativeRootPath)) >= 0
            ? path_1.join(cwd, sourceRoot)
            : path_1.join(cwd, relativeRootPath, sourceRoot);
        const entryFile = get_value_or_default_1.getValueOrDefault(configuration, 'entryFile', appName);
        const entryFileRoot = get_value_or_default_1.getValueOrDefault(configuration, 'root', appName) || '';
        const defaultOptions = webpack_defaults_1.webpackDefaultsFactory(pathToSource, entryFileRoot, entryFile, isDebugEnabled, tsConfigPath, plugins);
        const projectWebpackOptions = typeof webpackConfigFactoryOrConfig !== 'function'
            ? webpackConfigFactoryOrConfig
            : webpackConfigFactoryOrConfig(defaultOptions);
        const webpackConfiguration = Object.assign(Object.assign({}, defaultOptions), projectWebpackOptions);
        const compiler = webpack(webpackConfiguration);
        const afterCallback = (err, stats) => {
            const statsOutput = stats.toString({
                chunks: false,
                colors: true,
                modules: false,
                assets: false,
                warningsFilter: /^(?!CriticalDependenciesWarning$)/,
            });
            if (!err && !stats.hasErrors()) {
                if (!onSuccess) {
                    assetsManager.closeWatchers();
                }
                else {
                    onSuccess();
                }
            }
            else if (!watchMode && !webpackConfiguration.watch) {
                console.log(statsOutput);
                return process.exit(1);
            }
            console.log(statsOutput);
        };
        if (watchMode || webpackConfiguration.watch) {
            compiler.hooks.watchRun.tapAsync('Rebuild info', (params, callback) => {
                console.log(`\n${ui_1.INFO_PREFIX} Webpack is building your sources...\n`);
                callback();
            });
            compiler.watch(webpackConfiguration.watchOptions || {}, afterCallback);
        }
        else {
            compiler.run(afterCallback);
        }
    }
}
exports.WebpackCompiler = WebpackCompiler;
