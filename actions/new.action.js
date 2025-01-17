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
const strings_1 = require("@angular-devkit/core/src/utils/strings");
const chalk = require("chalk");
const child_process_1 = require("child_process");
const fs = require("fs");
const inquirer = require("inquirer");
const path_1 = require("path");
const util_1 = require("util");
const defaults_1 = require("../lib/configuration/defaults");
const package_managers_1 = require("../lib/package-managers");
const questions_1 = require("../lib/questions/questions");
const git_runner_1 = require("../lib/runners/git.runner");
const schematics_1 = require("../lib/schematics");
const ui_1 = require("../lib/ui");
const abstract_action_1 = require("./abstract.action");
class NewAction extends abstract_action_1.AbstractAction {
    handle(inputs, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const directoryOption = options.find(option => option.name === 'directory');
            const dryRunOption = options.find(option => option.name === 'dry-run');
            const isDryRunEnabled = dryRunOption && dryRunOption.value;
            yield askForMissingInformation(inputs);
            yield generateApplicationFiles(inputs, options).catch(exports.exit);
            const shouldSkipInstall = options.some(option => option.name === 'skip-install' && option.value === true);
            const shouldSkipGit = options.some(option => option.name === 'skip-git' && option.value === true);
            const projectDirectory = getProjectDirectory(getApplicationNameInput(inputs), directoryOption);
            if (!shouldSkipInstall) {
                yield installPackages(options, isDryRunEnabled, projectDirectory);
            }
            if (!isDryRunEnabled) {
                if (!shouldSkipGit) {
                    yield initializeGitRepository(projectDirectory);
                    yield createGitIgnoreFile(projectDirectory);
                }
                printCollective();
            }
            process.exit(0);
        });
    }
}
exports.NewAction = NewAction;
const getApplicationNameInput = (inputs) => inputs.find(input => input.name === 'name');
const getProjectDirectory = (applicationName, directoryOption) => {
    return ((directoryOption && directoryOption.value) ||
        strings_1.dasherize(applicationName.value));
};
const askForMissingInformation = (inputs) => __awaiter(void 0, void 0, void 0, function* () {
    console.info(ui_1.MESSAGES.PROJECT_INFORMATION_START);
    console.info();
    const prompt = inquirer.createPromptModule();
    const nameInput = getApplicationNameInput(inputs);
    if (!nameInput.value) {
        const message = 'What name would you like to use for the new project?';
        const questions = [questions_1.generateInput('name', message)('nest-app')];
        const answers = yield prompt(questions);
        replaceInputMissingInformation(inputs, answers);
    }
});
const replaceInputMissingInformation = (inputs, answers) => {
    return inputs.map(input => (input.value =
        input.value !== undefined ? input.value : answers[input.name]));
};
const generateApplicationFiles = (args, options) => __awaiter(void 0, void 0, void 0, function* () {
    const collectionName = options.find(option => option.name === 'collection' && option.value != null).value;
    const collection = schematics_1.CollectionFactory.create(collectionName || schematics_1.Collection.NESTJS);
    const schematicOptions = mapSchematicOptions(args.concat(options));
    yield collection.execute('application', schematicOptions);
    console.info();
});
const mapSchematicOptions = (options) => {
    return options.reduce((schematicOptions, option) => {
        if (option.name !== 'skip-install' &&
            option.value !== 'package-manager') {
            schematicOptions.push(new schematics_1.SchematicOption(option.name, option.value));
        }
        return schematicOptions;
    }, []);
};
const installPackages = (options, dryRunMode, installDirectory) => __awaiter(void 0, void 0, void 0, function* () {
    const inputPackageManager = options.find(option => option.name === 'package-manager').value;
    let packageManager;
    if (dryRunMode) {
        console.info();
        console.info(chalk.green(ui_1.MESSAGES.DRY_RUN_MODE));
        console.info();
        return;
    }
    if (inputPackageManager !== undefined) {
        try {
            packageManager = package_managers_1.PackageManagerFactory.create(inputPackageManager);
            yield packageManager.install(installDirectory, inputPackageManager);
        }
        catch (error) {
            if (error && error.message) {
                console.error(chalk.red(error.message));
            }
        }
    }
    else {
        packageManager = yield selectPackageManager();
        yield packageManager.install(installDirectory, packageManager.name.toLowerCase());
    }
});
const selectPackageManager = () => __awaiter(void 0, void 0, void 0, function* () {
    const answers = yield askForPackageManager();
    return package_managers_1.PackageManagerFactory.create(answers['package-manager']);
});
const askForPackageManager = () => __awaiter(void 0, void 0, void 0, function* () {
    const questions = [
        questions_1.generateSelect('package-manager')(ui_1.MESSAGES.PACKAGE_MANAGER_QUESTION)([
            package_managers_1.PackageManager.NPM,
            package_managers_1.PackageManager.YARN,
        ]),
    ];
    const prompt = inquirer.createPromptModule();
    return yield prompt(questions);
});
const initializeGitRepository = (dir) => __awaiter(void 0, void 0, void 0, function* () {
    const runner = new git_runner_1.GitRunner();
    yield runner.run('init', true, path_1.join(process.cwd(), dir)).catch(() => {
        console.error(chalk.red(ui_1.MESSAGES.GIT_INITIALIZATION_ERROR));
    });
});
/**
 * Write a file `.gitignore` in the root of the newly created project.
 * `.gitignore` available in `@nestjs/schematics` cannot be published to
 * NPM (needs to be investigated).
 *
 * @param dir Relative path to the project.
 * @param content (optional) Content written in the `.gitignore`.
 *
 * @return Resolves when succeeds, or rejects with any error from `fn.writeFile`.
 */
const createGitIgnoreFile = (dir, content) => {
    const fileContent = content || defaults_1.defaultGitIgnore;
    const filePath = path_1.join(process.cwd(), dir, '.gitignore');
    return util_1.promisify(fs.writeFile)(filePath, fileContent);
};
const printCollective = () => {
    const dim = print('dim');
    const yellow = print('yellow');
    const emptyLine = print();
    emptyLine();
    yellow(`Thanks for installing Nest ${ui_1.EMOJIS.PRAY}`);
    dim('Please consider donating to our open collective');
    dim('to help us maintain this package.');
    emptyLine();
    emptyLine();
    print()(`${chalk.bold(`${ui_1.EMOJIS.WINE}  Donate:`)} ${chalk.underline('https://opencollective.com/nest')}`);
    emptyLine();
};
const print = (color = null) => (str = '') => {
    const terminalCols = exports.retrieveCols();
    const strLength = str.replace(/\u001b\[[0-9]{2}m/g, '').length;
    const leftPaddingLength = Math.floor((terminalCols - strLength) / 2);
    const leftPadding = ' '.repeat(Math.max(leftPaddingLength, 0));
    if (color) {
        str = chalk[color](str);
    }
    console.log(leftPadding, str);
};
exports.retrieveCols = () => {
    const defaultCols = 80;
    try {
        const terminalCols = child_process_1.execSync('tput cols', {
            stdio: ['pipe', 'pipe', 'ignore'],
        });
        return parseInt(terminalCols.toString(), 10) || defaultCols;
    }
    catch (_a) {
        return defaultCols;
    }
};
exports.exit = () => process.exit(1);
