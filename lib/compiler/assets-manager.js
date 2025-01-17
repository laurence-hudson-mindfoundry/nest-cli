"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar = require("chokidar");
const path_1 = require("path");
const shell = require("shelljs");
const copy_path_resolve_1 = require("./helpers/copy-path-resolve");
const get_value_or_default_1 = require("./helpers/get-value-or-default");
class AssetsManager {
    constructor() {
        this.watchAssetsKeyValue = {};
        this.watchers = [];
    }
    /**
     * Using on `nest build` to close file watch or the build process will not end
     */
    closeWatchers() {
        const timeoutMs = 300;
        const closeFn = () => this.watchers.forEach(watcher => watcher.close());
        setTimeout(closeFn, timeoutMs);
    }
    copyAssets(configuration, appName, outDir, watchAssetsMode) {
        const assets = get_value_or_default_1.getValueOrDefault(configuration, 'compilerOptions.assets', appName) || [];
        if (assets.length <= 0) {
            return;
        }
        try {
            let sourceRoot = get_value_or_default_1.getValueOrDefault(configuration, 'sourceRoot', appName);
            sourceRoot = path_1.join(process.cwd(), sourceRoot);
            const filesToCopy = assets.map(item => {
                if (typeof item === 'string') {
                    return {
                        glob: path_1.join(sourceRoot, item),
                        outDir,
                    };
                }
                return {
                    outDir: item.outDir || outDir,
                    glob: path_1.join(sourceRoot, item.include),
                    exclude: item.exclude ? path_1.join(sourceRoot, item.exclude) : undefined,
                    flat: item.flat,
                    watchAssets: item.watchAssets,
                };
            });
            const isWatchEnabled = get_value_or_default_1.getValueOrDefault(configuration, 'compilerOptions.watchAssets', appName) || watchAssetsMode;
            for (const item of filesToCopy) {
                const option = {
                    action: 'change',
                    item,
                    path: '',
                    sourceRoot,
                    watchAssetsMode: isWatchEnabled,
                };
                // prettier-ignore
                const watcher = chokidar
                    .watch(item.glob, { ignored: item.exclude, persistent: option.watchAssetsMode || option.item.watchAssets })
                    .on('add', (path) => this.actionOnFile(Object.assign(Object.assign({}, option), { path, action: 'change' })))
                    .on('change', (path) => this.actionOnFile(Object.assign(Object.assign({}, option), { path, action: 'change' })))
                    .on('unlink', (path) => this.actionOnFile(Object.assign(Object.assign({}, option), { path, action: 'unlink' })));
                this.watchers.push(watcher);
            }
        }
        catch (err) {
            throw new Error(`An error occurred during the assets copying process. ${err.message}`);
        }
    }
    actionOnFile(option) {
        const { action, item, path, sourceRoot, watchAssetsMode } = option;
        const isWatchEnabled = watchAssetsMode || item.watchAssets;
        // Allow to do action for the first time before check watchMode
        if (!isWatchEnabled && this.watchAssetsKeyValue[path]) {
            return;
        }
        // Set path value to true for watching the first time
        this.watchAssetsKeyValue[path] = true;
        const dest = copy_path_resolve_1.copyPathResolve(path, item.outDir, sourceRoot.split(path_1.sep).length);
        // Copy to output dir if file is changed or added
        if (action === 'change') {
            shell.mkdir('-p', path_1.dirname(dest));
            shell.cp(path, dest);
        }
        else if (action === 'unlink') {
            // Remove from output dir if file is deleted
            shell.rm(dest);
        }
    }
}
exports.AssetsManager = AssetsManager;
