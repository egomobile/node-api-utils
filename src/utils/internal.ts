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

import type { DebugAction } from "../types";
import type { DebugActionWithoutSource, Nilable } from "../types/internal";

export function getEmptyArray<T extends any = any>(): T[] {
    return [];
}

export function isNil(val: any): val is (null | undefined) {
    return typeof val === "undefined" || val === null;
}

export function isIterable(val: any) {
    return typeof val?.[Symbol.iterator] === "function";
}

export function toDebugActionSafe(source: string, debug: Nilable<DebugAction>): DebugActionWithoutSource {
    if (isNil(debug)) {
        return () => { };
    }

    if (typeof debug !== "function") {
        throw new TypeError("debug must be of type function");
    }

    return (message, icon) => {
        return debug(message, icon, source);
    };
}
