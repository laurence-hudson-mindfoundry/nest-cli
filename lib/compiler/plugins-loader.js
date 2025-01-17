"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const util_1 = require("util");
const ui_1 = require("../ui");
class PluginsLoader {
    load(plugins = []) {
        const pluginNames = plugins.map(entry => util_1.isObject(entry) ? entry.name : entry);
        const nodeModulePaths = [
            path_1.join(process.cwd(), 'node_modules'),
            ...module.paths,
        ];
        const pluginRefs = pluginNames.map(item => {
            try {
                const binaryPath = require.resolve(item, { paths: nodeModulePaths });
                return require(binaryPath);
            }
            catch (e) {
                throw new Error(`"${item}" plugin could not be found!`);
            }
        });
        const beforeHooks = [];
        const afterHooks = [];
        pluginRefs.forEach((plugin, index) => {
            if (!plugin.before && !plugin.after) {
                throw new Error(ui_1.CLI_ERRORS.WRONG_PLUGIN(pluginNames[index]));
            }
            const options = util_1.isObject(plugins[index])
                ? plugins[index].options || {}
                : {};
            plugin.before &&
                beforeHooks.push(plugin.before.bind(plugin.before, options));
            plugin.after && afterHooks.push(plugin.after.bind(plugin.after, options));
        });
        return {
            beforeHooks,
            afterHooks,
        };
    }
}
exports.PluginsLoader = PluginsLoader;
