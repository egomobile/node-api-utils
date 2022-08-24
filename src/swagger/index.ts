// This file is part of the @egomobile/api-utils distribution.
// Copyright (c) Next.e.GO Mobile SE, Aachen, Germany (https://e-go-mobile.com/)
//
// @egomobile/api-utils is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as
// published by the Free Software Foundation, version 3.
//
// @egomobile/api-utils is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// Lesser General Public License for more details.
//
// You should have received a copy of the GNU Lesser General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import type { ControllersSwaggerBaseDocument, OpenAPIV3 } from "@egomobile/http-server";
import fs from "fs";
import path from "path";
import type { DebugAction } from "../types";
import type { DebugActionWithoutSource, Nilable } from "../types/internal";
import { isNil, toDebugActionSafe } from "../utils/internal";

const { readdir, stat } = fs.promises;

/**
 * Context for a `LoadSwaggerDocumentationFileFilter` function.
 */
export interface ILoadSwaggerDocumentationFileFilterContext {
    /**
     * The full path of the file.
     */
    fullPath: string;
    /**
     * The name of the file without the path.
     */
    name: string;
}

/**
 * Options for `loadSwaggerDocumentation()` and `loadSwaggerDocumentationSync()` functions.
 */
export interface ILoadSwaggerDocumentationOptions {
    /**
     * The optional debug action / handler.
     */
    debug?: Nilable<DebugAction>;
    /**
     * The root directory of the documentation.
     *
     * Relative paths will be mapped with the current working directory.
     */
    dir: string;
    /**
     * The custom file extension.
     */
    ext?: Nilable<string>;
}

/**
 * A result of a `loadSwaggerDocumentation()` or `loadSwaggerDocumentationSync()` call.
 */
export interface ILoadSwaggerDocumentationResult {
    /**
     * The base document.
     */
    baseDocument: ControllersSwaggerBaseDocument;
}

/**
 * A filter function for files.
 *
 * @param {ILoadSwaggerDocumentationFileFilterContext} context The context.
 *
 * @returns {boolean} File is valid or not.
 */
export type LoadSwaggerDocumentationFileFilter =
    (context: ILoadSwaggerDocumentationFileFilterContext) => boolean;

/**
 * A possible value for an `ILoadSwaggerDocumentationOptions.filter` property.
 */
export type LoadSwaggerDocumentationFileFilterValue = string | LoadSwaggerDocumentationFileFilter;

const componentKeys: (keyof OpenAPIV3.ComponentsObject)[] = [
    "callbacks",
    "examples",
    "headers",
    "links",
    "parameters",
    "requestBodies",
    "responses",
    "schemas",
    "securitySchemes"
];

/**
 * Loads Swagger documentation from a directory, where components
 * are organized in sub folders.
 *
 * @param {ILoadSwaggerDocumentationOptions} options The options.
 *
 * @returns {Promise<ILoadSwaggerDocumentationResult>} The promise with the result.
 */
export async function loadSwaggerDocumentation(options: ILoadSwaggerDocumentationOptions): Promise<ILoadSwaggerDocumentationResult> {
    const dir = toFullPath(options.dir);
    const ext = toExt(options.ext);
    const debug = toDebugActionSafe("loadSwaggerDocumentation", options.debug);

    const {
        baseDocumentScript,
        componentsDir
    } = getDirsAndFiles(dir, ext);

    const temp: {
        baseDocument: ControllersSwaggerBaseDocument;
    } = {} as any;

    await rethrowOnError(async () => {
        debug(`Loading base document from ${baseDocumentScript} ...`, "🐞");
        setupObjectProperty(temp, "baseDocument", loadModule(baseDocumentScript));
    }, () => {
        debug(`Loaded base document from ${baseDocumentScript}`, "✅");
    }, (error) => {
        debug(`Could not load base document from ${baseDocumentScript}: ${error}`, "❌");
    });

    const { baseDocument } = temp;
    if (!baseDocument.components) {
        baseDocument.components = {};
    }

    for (const key of componentKeys) {
        const componentDir = path.join(componentsDir, key);
        if (!fs.existsSync(componentDir)) {
            continue;
        }

        const fStat = await stat(componentDir);
        if (!fStat.isDirectory()) {
            debug(`${componentDir} is no directory`, "⚠️");
            continue;
        }

        if (!baseDocument.components[key]) {
            baseDocument.components[key] = {};
        }

        debug(`Try to load components of type ${key} from ${componentDir} ...`, "🐞");
        for (const script of await findScripts(componentDir, ext, debug)) {
            await rethrowOnError(async () => {
                debug(`Loading component of type ${key} from ${script} ...`, "🐞");

                const componentName = path.basename(script, path.extname(script));
                const component = loadModule(script);

                setupObjectProperty<any>(baseDocument.components[key], componentName, component);
            }, () => {
                debug(`Loaded component of type ${key} from ${script}`, "✅");
            }, (error) => {
                debug(`Could not load component of type ${key} from ${script}: ${error}`, "❌");
            });
        }
    }

    return {
        baseDocument
    };
}

/**
 * Loads Swagger documentation from a directory, where components
 * are organized in sub folders.
 *
 * @param {ILoadSwaggerDocumentationOptions} options The options.
 *
 * @returns {ILoadSwaggerDocumentationResult} The result.
 */
export function loadSwaggerDocumentationSync(options: ILoadSwaggerDocumentationOptions): ILoadSwaggerDocumentationResult {
    const dir = toFullPath(options.dir);
    const ext = toExt(options.ext);
    const debug = toDebugActionSafe("loadSwaggerDocumentationSync", options.debug);

    const {
        baseDocumentScript,
        componentsDir
    } = getDirsAndFiles(dir, ext);

    const temp: {
        baseDocument: ControllersSwaggerBaseDocument;
    } = {} as any;

    rethrowOnErrorSync(() => {
        debug(`Loading base document from ${baseDocumentScript} ...`, "🐞");
        setupObjectProperty(temp, "baseDocument", loadModule(baseDocumentScript));
    }, () => {
        debug(`Loaded base document from ${baseDocumentScript}`, "✅");
    }, (error) => {
        debug(`Could not load base document from ${baseDocumentScript}: ${error}`, "❌");
    });

    const { baseDocument } = temp;
    if (!baseDocument.components) {
        baseDocument.components = {};
    }

    for (const key of componentKeys) {
        const componentDir = path.join(componentsDir, key);
        if (!fs.existsSync(componentDir)) {
            continue;
        }

        const fStat = fs.statSync(componentDir);
        if (!fStat.isDirectory()) {
            debug(`${componentDir} is no directory`, "⚠️");
            continue;
        }

        if (!baseDocument.components[key]) {
            baseDocument.components[key] = {};
        }

        debug(`Try to load components of type ${key} from ${componentDir} ...`, "🐞");
        for (const script of findScriptsSync(componentDir, ext, debug)) {
            rethrowOnErrorSync(() => {
                debug(`Loading component of type ${key} from ${script} ...`, "🐞");

                const componentName = path.basename(script, path.extname(script));
                const component = loadModule(script);

                setupObjectProperty<any>(baseDocument.components[key], componentName, component);
            }, () => {
                debug(`Loaded component of type ${key} from ${script}`, "✅");
            }, (error) => {
                debug(`Could not load component of type ${key} from ${script}: ${error}`, "❌");
            });
        }
    }

    return {
        baseDocument
    };
}

async function findScripts(dir: string, ext: string, debug: DebugActionWithoutSource): Promise<string[]> {
    const files: string[] = [];

    for (const item of await readdir(dir)) {
        if (!item.endsWith(ext)) {
            continue;
        }

        const fullPath = path.join(dir, item);
        const fStat = fs.statSync(fullPath);
        if (fStat.isFile()) {
            files.push(fullPath);
        }
        else {
            debug(`${fullPath} is no file`, "⚠️");
        }
    }

    return files;
}

function findScriptsSync(dir: string, ext: string, debug: DebugActionWithoutSource): string[] {
    const files: string[] = [];

    for (const item of fs.readdirSync(dir)) {
        if (!item.endsWith(ext)) {
            continue;
        }

        const fullPath = path.join(dir, item);
        const fStat = fs.statSync(fullPath);
        if (fStat.isFile()) {
            files.push(fullPath);
        }
        else {
            debug(`${fullPath} is no file`, "⚠️");
        }
    }

    return files;
}

function getDirsAndFiles(dir: string, ext: string) {
    const baseDocumentScript = path.join(dir, `index${ext}`);

    const componentsDir = path.join(dir, "components");

    return {
        baseDocumentScript,
        componentsDir
    };
}

function loadModule(modulePath: string): any {
    const resolvedPath = require.resolve(modulePath);
    delete require.cache[resolvedPath];

    const mod = require(resolvedPath);

    if (mod.default) {
        return mod.default;  // default export
    }
    else {
        return mod;  // module.exports
    }
}

async function rethrowOnError(action: () => Promise<void>, onSuccess: () => void, onError: (error: any) => void): Promise<void> {
    try {
        await action();

        onSuccess();
    }
    catch (error) {
        onError(error);

        throw error;
    }
}

function rethrowOnErrorSync(action: () => void, onSuccess: () => void, onError: (error: any) => void): void {
    try {
        action();

        onSuccess();
    }
    catch (error) {
        onError(error);

        throw error;
    }
}

function setupObjectProperty<T extends any = any>(obj: T, prop: keyof T, value: any) {
    if (typeof value === "function") {
        Object.defineProperty(obj, prop, {
            "enumerable": true,
            "configurable": true,
            "get": value
        });
    }
    else {
        obj[prop] = value;
    }
}

function toExt(value: Nilable<string>): string {
    if (isNil(value)) {
        return path.extname(__filename);
    }

    if (typeof value === "string") {
        return value;
    }

    throw new TypeError("value must be of string or function");
}

function toFullPath(value: string): string {
    if (typeof value !== "string") {
        throw new TypeError("value must be of type string");
    }

    if (path.isAbsolute(value)) {
        return value;
    }
    else {
        return path.join(process.cwd(), value);
    }
}
