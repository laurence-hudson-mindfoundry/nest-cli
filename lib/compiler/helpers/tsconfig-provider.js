"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const ui_1 = require("../../ui");
class TsConfigProvider {
    constructor(typescriptLoader) {
        this.typescriptLoader = typescriptLoader;
    }
    getByConfigFilename(configFilename) {
        const configPath = path_1.join(process.cwd(), configFilename);
        if (!fs_1.existsSync(configPath)) {
            throw new Error(ui_1.CLI_ERRORS.MISSING_TYPESCRIPT(configFilename));
        }
        const tsBinary = this.typescriptLoader.load();
        const parsedCmd = tsBinary.getParsedCommandLineOfConfigFile(configPath, undefined, tsBinary.sys);
        const { options, fileNames, projectReferences } = parsedCmd;
        return { options, fileNames, projectReferences };
    }
}
exports.TsConfigProvider = TsConfigProvider;
