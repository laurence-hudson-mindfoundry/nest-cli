"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path_1 = require("path");
const typescript_loader_1 = require("../typescript-loader");
const tsPaths = require("tsconfig-paths");
function tsconfigPathsBeforeHookFactory(compilerOptions) {
    const tsBinary = new typescript_loader_1.TypeScriptBinaryLoader().load();
    const { paths = {}, baseUrl = './' } = compilerOptions;
    const matcher = tsPaths.createMatchPath(baseUrl, paths, ['main']);
    return (ctx) => {
        return (sf) => {
            const visitNode = (node) => {
                if (tsBinary.isImportDeclaration(node) ||
                    (tsBinary.isExportDeclaration(node) && node.moduleSpecifier)) {
                    try {
                        const newNode = tsBinary.getMutableClone(node);
                        const importPathWithQuotes = node.moduleSpecifier && node.moduleSpecifier.getText();
                        if (!importPathWithQuotes) {
                            return node;
                        }
                        const text = importPathWithQuotes.substr(1, importPathWithQuotes.length - 2);
                        const result = getNotAliasedPath(sf, matcher, text);
                        if (!result) {
                            return node;
                        }
                        newNode.moduleSpecifier = tsBinary.createLiteral(result);
                        return newNode;
                    }
                    catch (_a) {
                        return node;
                    }
                }
                return tsBinary.visitEachChild(node, visitNode, ctx);
            };
            return tsBinary.visitNode(sf, visitNode);
        };
    };
}
exports.tsconfigPathsBeforeHookFactory = tsconfigPathsBeforeHookFactory;
function getNotAliasedPath(sf, matcher, text) {
    let result = matcher(text, undefined, undefined, ['.ts', '.js']);
    if (!result) {
        return;
    }
    if (os.platform() === 'win32') {
        result = result.replace(/\\/g, '/');
    }
    const resolvedPath = path_1.posix.relative(path_1.dirname(sf.fileName), result) || './';
    return resolvedPath[0] === '.' ? resolvedPath : './' + resolvedPath;
}
