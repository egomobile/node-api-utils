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
import type { Nilable } from "../../types/internal";
import { isNil } from "../../utils/internal";

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
 * @returns {Promise<ControllersSwaggerBaseDocument>} The promise with the loaded base document.
 */
export async function loadSwaggerDocumentation(options: ILoadSwaggerDocumentationOptions): Promise<ControllersSwaggerBaseDocument> {
    const dir = toFullPath(options.dir);
    const ext = toExt(options.ext);

    const {
        baseDocumentScript,
        componentsDir
    } = getDirsAndFiles(dir, ext);

    const baseDocument: ControllersSwaggerBaseDocument = loadModule(baseDocumentScript);
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
            continue;
        }

        if (!(baseDocument.components as any)[key]) {
            (baseDocument.components as any)[key] = {};
        }

        for (const script of await findScripts(componentDir, ext)) {
            const componentName = path.basename(script, path.basename(script));
            const component = loadModule(script);

            (baseDocument.components as any)[key][componentName] = component;
        }
    }

    return baseDocument;
}

/**
 * Loads Swagger documentation from a directory, where components
 * are organized in sub folders.
 *
 * @param {ILoadSwaggerDocumentationOptions} options The options.
 *
 * @returns {ControllersSwaggerBaseDocument} The loaded base document.
 */
export function loadSwaggerDocumentationSync(options: ILoadSwaggerDocumentationOptions): ControllersSwaggerBaseDocument {
    const dir = toFullPath(options.dir);
    const ext = toExt(options.ext);

    const {
        baseDocumentScript,
        componentsDir
    } = getDirsAndFiles(dir, ext);

    const baseDocument: ControllersSwaggerBaseDocument = loadModule(baseDocumentScript);
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
            continue;
        }

        if (!(baseDocument.components as any)[key]) {
            (baseDocument.components as any)[key] = {};
        }

        for (const script of findScriptsSync(componentDir, ext)) {
            const componentName = path.basename(script, path.basename(script));
            const component = loadModule(script);

            (baseDocument.components as any)[key][componentName] = component;
        }
    }

    return baseDocument;
}

async function findScripts(dir: string, ext: string): Promise<string[]> {
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
    }

    return files;
}

function findScriptsSync(dir: string, ext: string): string[] {
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
    }

    return files;
}

function getDirsAndFiles(dir: string, ext: string) {
    const baseDocumentScript = path.join(dir, `index.${ext}`);

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
