"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
class TypeScriptBinaryLoader {
    load() {
        if (this.tsBinary) {
            return this.tsBinary;
        }
        const nodeModulePaths = [
            path_1.join(process.cwd(), 'node_modules'),
            ...this.getModulePaths(),
        ];
        let tsBinary;
        for (const path of nodeModulePaths) {
            const binaryPath = path_1.resolve(path, 'typescript');
            if (fs_1.existsSync(binaryPath)) {
                tsBinary = require(binaryPath);
                break;
            }
        }
        if (!tsBinary) {
            throw new Error('TypeScript could not be found! Please, install "typescript" package.');
        }
        this.tsBinary = tsBinary;
        return tsBinary;
    }
    getModulePaths() {
        const modulePaths = module.paths.slice(2, module.paths.length);
        const packageDeps = modulePaths.slice(0, 3);
        return [
            ...packageDeps.reverse(),
            ...modulePaths.slice(3, modulePaths.length).reverse(),
        ];
    }
}
exports.TypeScriptBinaryLoader = TypeScriptBinaryLoader;
