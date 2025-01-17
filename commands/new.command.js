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
const schematics_1 = require("../lib/schematics");
const abstract_command_1 = require("./abstract.command");
class NewCommand extends abstract_command_1.AbstractCommand {
    load(program) {
        program
            .command('new [name]')
            .alias('n')
            .description('Generate Nest application.')
            .option('--directory [directory]', 'Specify the destination directory')
            .option('-d, --dry-run', 'Report actions that would be performed without writing out results.')
            .option('-g, --skip-git', 'Skip git repository initialization.')
            .option('-s, --skip-install', 'Skip package installation.')
            .option('-p, --package-manager [package-manager]', 'Specify package manager.')
            .option('-l, --language [language]', 'Programming language to be used (TypeScript or JavaScript).')
            .option('-c, --collection [collectionName]', 'Schematics collection to use.')
            .action((name, command) => __awaiter(this, void 0, void 0, function* () {
            const options = [];
            options.push({ name: 'directory', value: command.directory });
            options.push({ name: 'dry-run', value: !!command.dryRun });
            options.push({ name: 'skip-git', value: !!command.skipGit });
            options.push({ name: 'skip-install', value: !!command.skipInstall });
            options.push({
                name: 'package-manager',
                value: command.packageManager,
            });
            options.push({
                name: 'language',
                value: !!command.language ? command.language : 'ts',
            });
            options.push({
                name: 'collection',
                value: command.collection || schematics_1.Collection.NESTJS,
            });
            const inputs = [];
            inputs.push({ name: 'name', value: name });
            yield this.action.handle(inputs, options);
        }));
    }
}
exports.NewCommand = NewCommand;
