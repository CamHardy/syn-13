import { growCapacity, growArray } from './memory.js';

/** @typedef { 'VAL_BOOL' | 'VAL_NIL' | 'VAL_NUMBER' } ValueType */

/** 
 * @typedef { Object } Value 
 * @property { ValueType } type
 * @property { { boolean: boolean } | { number: number } } as
*/

/** @param { Value } value */
export function IS_BOOL(value) { return value.type === 'VAL_BOOL' };

/** @param { Value } value */
export function IS_NIL(value) { return value.type === 'VAL_NIL' };

/** @param { Value } value */
export function IS_NUMBER(value) { return value.type === 'VAL_NUMBER' };

/** @param { Value } value */
// @ts-ignore
export function AS_BOOL(value) { return value.as.boolean };

/** @param { Value } value */
// @ts-ignore
export function AS_NUMBER(value) { return value.as.number };

/** 
 * @param { boolean } value 
 * @return { Value }
 */
export function BOOL_VAL(value) {
	return {
		type: 'VAL_BOOL',
		as: {
			boolean: value
		}
	};
}

/** 
 * @return { Value }
 */
export function NIL_VAL() {
	return {
		type: 'VAL_NIL',
		as: {
			number: 0
		}
	};
}

/** 
 * @param { number } value 
 * @return { Value }
 */
export function NUMBER_VAL(value) {
	return {
		type: 'VAL_NUMBER',
		as: {
			number: value
		}
	};
}

export class ValueArray {
	count;
	capacity;
	/** @type { Value[] } */
	values;

	constructor() {
		this.count = 0;
		this.capacity = 0;
		this.values = [];
	}

	/** @param { Value } value */
	write(value) {
		if (this.capacity < this.count + 1) {
			let oldCapacity = this.capacity;
			this.capacity = growCapacity(oldCapacity);
			this.values.length = this.capacity;
		}
		
		this.values[this.count] = value;
		this.count++;
	}

	/** @param { Value } value */
	print(value) {
		switch (value.type) {
			case 'VAL_BOOL':
				console.log(AS_BOOL(value) ? 'true' : 'false');
				break;
			case 'VAL_NIL':
				console.log('nil');
				break;
			case 'VAL_NUMBER':
				console.log(AS_NUMBER(value));
				break;
		}
	}
}

/** 
 * @param { Value } a @param { Value } b 
 * @return { boolean }
 */
export function valuesEqual(a, b) {
	if (a.type !== b.type) return false;
	switch (a.type) {
		case 'VAL_BOOL': return AS_BOOL(a) === AS_BOOL(b);
		case 'VAL_NIL': return true;
		case 'VAL_NUMBER': return AS_NUMBER(a) === AS_NUMBER(b);
		default: return false; // Unreachable.
	}
}