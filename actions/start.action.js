"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const child_process_1 = require("child_process");
const fs = require("fs");
const path_1 = require("path");
const killProcess = require("tree-kill");
const get_value_or_default_1 = require("../lib/compiler/helpers/get-value-or-default");
const defaults_1 = require("../lib/configuration/defaults");
const ui_1 = require("../lib/ui");
const build_action_1 = require("./build.action");
class StartAction extends build_action_1.BuildAction {
    handle(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const configFileName = options.find(option => option.name === 'config')
                    .value;
                const configuration = yield this.loader.load(configFileName);
                const appName = inputs.find(input => input.name === 'app')
                    .value;
                const pathToTsconfig = get_value_or_default_1.getValueOrDefault(configuration, 'compilerOptions.tsConfigPath', appName, 'path', options);
                const binaryToRunOption = options.find(option => option.name === 'exec');
                const debugModeOption = options.find(option => option.name === 'debug');
                const watchModeOption = options.find(option => option.name === 'watch');
                const isWatchEnabled = !!(watchModeOption && watchModeOption.value);
                const watchAssetsModeOption = options.find(option => option.name === 'watchAssets');
                const isWatchAssetsEnabled = !!(watchAssetsModeOption && watchAssetsModeOption.value);
                const debugFlag = debugModeOption && debugModeOption.value;
                const binaryToRun = binaryToRunOption && binaryToRunOption.value;
                const { options: tsOptions } = this.tsConfigProvider.getByConfigFilename(pathToTsconfig);
                const outDir = tsOptions.outDir || defaults_1.defaultOutDir;
                const onSuccess = this.createOnSuccessHook(configuration, appName, debugFlag, outDir, binaryToRun);
                yield this.runBuild(inputs, options, isWatchEnabled, isWatchAssetsEnabled, !!debugFlag, onSuccess);
            }
            catch (err) {
                if (err instanceof Error) {
                    console.log(`\n${ui_1.ERROR_PREFIX} ${err.message}\n`);
                }
                else {
                    console.error(`\n${chalk.red(err)}\n`);
                }
            }
        });
    }
    createOnSuccessHook(configuration, appName, debugFlag, outDirName, binaryToRun = 'node') {
        const sourceRoot = get_value_or_default_1.getValueOrDefault(configuration, 'sourceRoot', appName);
        const entryFile = get_value_or_default_1.getValueOrDefault(configuration, 'entryFile', appName);
        let childProcessRef;
        process.on('exit', () => childProcessRef && killProcess(childProcessRef.pid));
        return () => {
            if (childProcessRef) {
                childProcessRef.removeAllListeners('exit');
                childProcessRef.on('exit', () => {
                    childProcessRef = this.spawnChildProcess(entryFile, sourceRoot, debugFlag, outDirName, binaryToRun);
                    childProcessRef.on('exit', () => (childProcessRef = undefined));
                });
                childProcessRef.stdin && childProcessRef.stdin.pause();
                killProcess(childProcessRef.pid);
            }
            else {
                childProcessRef = this.spawnChildProcess(entryFile, sourceRoot, debugFlag, outDirName, binaryToRun);
                childProcessRef.on('exit', () => (childProcessRef = undefined));
            }
        };
    }
    spawnChildProcess(entryFile, sourceRoot, debug, outDirName, binaryToRun) {
        let outputFilePath = path_1.join(outDirName, sourceRoot, entryFile);
        if (!fs.existsSync(outputFilePath + '.js')) {
            outputFilePath = path_1.join(outDirName, entryFile);
        }
        let childProcessArgs = [];
        const argsStartIndex = process.argv.indexOf('--');
        if (argsStartIndex >= 0) {
            childProcessArgs = process.argv.slice(argsStartIndex + 1);
        }
        outputFilePath =
            outputFilePath.indexOf(' ') >= 0 ? `"${outputFilePath}"` : outputFilePath;
        const processArgs = [outputFilePath, ...childProcessArgs];
        if (debug) {
            const inspectFlag = typeof debug === 'string' ? `--inspect=${debug}` : '--inspect';
            processArgs.unshift(inspectFlag);
        }
        return child_process_1.spawn(binaryToRun, processArgs, {
            stdio: 'inherit',
            shell: true,
        });
    }
}
exports.StartAction = StartAction;
