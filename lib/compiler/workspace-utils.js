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
const rimraf = require("rimraf");
const get_value_or_default_1 = require("./helpers/get-value-or-default");
class WorkspaceUtils {
    deleteOutDirIfEnabled(configuration, appName, dirPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const isDeleteEnabled = get_value_or_default_1.getValueOrDefault(configuration, 'compilerOptions.deleteOutDir', appName);
            if (!isDeleteEnabled) {
                return;
            }
            yield new Promise((resolve, reject) => rimraf(dirPath, err => (err ? reject(err) : resolve())));
        });
    }
}
exports.WorkspaceUtils = WorkspaceUtils;
