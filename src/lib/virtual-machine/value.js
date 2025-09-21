import { growCapacity, growArray } from './memory.js';
/** @typedef { number } Value */

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
}