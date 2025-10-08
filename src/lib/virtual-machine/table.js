/** @import { Value } from "./value.js" */
/** @import { ObjString } from "./object.js" */

/**
 * @typedef { Object } Entry
 * @property { string } key
 * @property { Value } value
 */

export class Table {
    constructor() {
      /** @type { Map<string, ObjString> } */
      this.entries = new Map();
    }

		/**
		 * @param { string } key 
		 * @param { ObjString } value 
		 * @returns { boolean }
		 */
    set(key, value) {
      const isNew = !this.entries.has(key);
      this.entries.set(key, value);
      return isNew;
    }

		/** @param { string } key */
    get(key) {
      return this.entries.get(key);
    }

		/** @param { string } key */
    delete(key) {
      return this.entries.delete(key);
    }

		/** @param { Table } from */
    addAll(from) {
      for (const [k, v] of from.entries) this.set(k, v);
    }

    free() {
      this.entries = new Map();
    }
  }