"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const path_1 = require("path");
const tsconfig_paths_webpack_plugin_1 = require("tsconfig-paths-webpack-plugin");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const defaults_1 = require("../../configuration/defaults");
const append_extension_1 = require("../helpers/append-extension");
exports.webpackDefaultsFactory = (sourceRoot, relativeSourceRoot, entryFilename, isDebugEnabled = false, tsConfigFile = defaults_1.defaultConfiguration.compilerOptions.tsConfigPath, plugins) => ({
    entry: append_extension_1.appendTsExtension(path_1.join(sourceRoot, entryFilename)),
    devtool: isDebugEnabled ? 'inline-source-map' : false,
    target: 'node',
    output: {
        filename: path_1.join(relativeSourceRoot, `${entryFilename}.js`),
    },
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                            configFile: tsConfigFile,
                            getCustomTransformers: (program) => ({
                                before: plugins.beforeHooks.map(hook => hook(program)),
                                after: plugins.afterHooks.map(hook => hook(program)),
                            }),
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        plugins: [
            new tsconfig_paths_webpack_plugin_1.TsconfigPathsPlugin({
                configFile: tsConfigFile,
            }),
        ],
    },
    mode: 'none',
    optimization: {
        nodeEnv: false,
    },
    node: {
        __filename: false,
        __dirname: false,
    },
    plugins: [
        new webpack.IgnorePlugin({
            checkResource(resource) {
                const lazyImports = [
                    '@nestjs/microservices',
                    'cache-manager',
                    'class-validator',
                    'class-transformer',
                ];
                if (!lazyImports.includes(resource)) {
                    return false;
                }
                try {
                    require.resolve(resource, {
                        paths: [process.cwd()],
                    });
                }
                catch (err) {
                    return true;
                }
                return false;
            },
        }),
        new ForkTsCheckerWebpackPlugin({
            tsconfig: tsConfigFile,
        }),
    ],
});
