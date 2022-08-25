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

import type { Nilable } from "./internal";

/**
 * A debug action.
 *
 * @param {string} message The message text.
 * @param {string} icon The icon.
 * @param {Nilable<string>} [source] The name of the optional source.
 */
export type DebugAction = (message: string, icon: DebugIcon, source?: Nilable<string>) => any;

/**
 * A possible value for a known debug icon.
 *
 * 🐞: debug
 * ✅: success
 * ℹ️: info
 * ❌: error
 * ⚠️: warning
 */
export type DebugIcon = "🐞" | "✅" | "ℹ️" | "❌" | "⚠️";
