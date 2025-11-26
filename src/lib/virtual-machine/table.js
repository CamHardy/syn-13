import { markObject, markValue } from "./memory.js";
/** @import { Obj } from "./object.js" */
/** @import { Value } from "./value.js" */

/** @template K, V */
export class Table {
  constructor() {
    /** @type { Map<K, V> } */
    this.entries = new Map();
  }

  /**
   * @param { K } key 
   * @param { V } value 
   * @returns { boolean }
   */
  set(key, value) {
    const isNew = !this.entries.has(key);
    this.entries.set(key, value);
    return isNew;
  }

  /** @param { K } key */
  get(key) {
    return this.entries.get(key);
  }

  /** @param { K } key */
  delete(key) {
    return this.entries.delete(key);
  }

  /** @param { Table<K, V> } from */
  addAll(from) {
    for (const [k, v] of from.entries) this.set(k, v);
  }

  free() {
    this.entries = new Map();
  }
}

/** @param { Table<Obj, Value> } table */
export function markTable(table) {
  for (const [key, value] of table.entries) {
    markObject(key);
    markValue(value);
  }
}

/** @param { Table<string, Obj> } table */
export function tableRemoveWhite(table) {
  for (const [key, value] of table.entries) {
    if (!value.isMarked) {
      table.delete(key);
    }
  }
}