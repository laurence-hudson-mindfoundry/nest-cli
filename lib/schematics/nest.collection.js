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
const abstract_collection_1 = require("./abstract.collection");
class NestCollection extends abstract_collection_1.AbstractCollection {
    constructor(runner) {
        super('@nestjs/schematics', runner);
    }
    execute(name, options) {
        const _super = Object.create(null, {
            execute: { get: () => super.execute }
        });
        return __awaiter(this, void 0, void 0, function* () {
            const schematic = this.validate(name);
            yield _super.execute.call(this, schematic, options);
        });
    }
    static getSchematics() {
        return NestCollection.schematics.filter(item => item.name !== 'angular-app');
    }
    validate(name) {
        const schematic = NestCollection.schematics.find(s => s.name === name || s.alias === name);
        if (schematic === undefined || schematic === null) {
            throw new Error(`Invalid schematic "${name}". Please, ensure that "${name}" exists in this collection.`);
        }
        return schematic.name;
    }
}
exports.NestCollection = NestCollection;
NestCollection.schematics = [
    { name: 'application', alias: 'application' },
    { name: 'angular-app', alias: 'ng-app' },
    { name: 'class', alias: 'cl' },
    { name: 'configuration', alias: 'config' },
    { name: 'controller', alias: 'co' },
    { name: 'decorator', alias: 'd' },
    { name: 'filter', alias: 'f' },
    { name: 'gateway', alias: 'ga' },
    { name: 'guard', alias: 'gu' },
    { name: 'interceptor', alias: 'in' },
    { name: 'interface', alias: 'interface' },
    { name: 'middleware', alias: 'mi' },
    { name: 'module', alias: 'mo' },
    { name: 'pipe', alias: 'pi' },
    { name: 'provider', alias: 'pr' },
    { name: 'resolver', alias: 'r' },
    { name: 'service', alias: 's' },
    { name: 'library', alias: 'lib' },
    { name: 'sub-app', alias: 'app' },
];
