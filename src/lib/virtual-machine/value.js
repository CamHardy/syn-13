import { growCapacity, growArray } from './memory.js';

/** @typedef { 'VAL_BOOL' | 'VAL_NIL' | 'VAL_NUMBER' } ValueType */

/** 
 * @typedef { Object } Value 
 * @property { ValueType } type
 * @property { { boolean: boolean, number: number } } as
*/

export class ValueArray {
	count;
	capacity;
	/** @type { number[] } */
	values;

	constructor() {
		this.count = 0;
		this.capacity = 0;
		this.values = [];
	}

	/** @param { number } value */
	write(value) {
		if (this.capacity < this.count + 1) {
			let oldCapacity = this.capacity;
			this.capacity = growCapacity(oldCapacity);
			this.values.length = this.capacity;
		}
		
		this.values[this.count] = value;
		this.count++;
	}
}