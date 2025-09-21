import { growArray, growCapacity } from "./memory.js";
import { ValueArray } from "./value.js";
/** @import { Value } from "./value.js" */

export const OpCode = Object.freeze({
	OP_RETURN: 1,
	OP_CONSTANT: 2
});

export class Chunk {
	count;
	capacity;
	code;
	constants;

	constructor() {
		this.count = 0;
		this.capacity = 0;
		this.code = new Uint8Array(this.capacity);
		this.constants = new ValueArray();
	}

	/** @param { number } byte */
	write(byte) {
		if (this.capacity < this.count + 1) {
			let oldCapacity = this.capacity;
			this.capacity = growCapacity(oldCapacity);
			this.code = growArray(this.code, this.capacity);
		}
		
		this.code[this.count] = byte;
		this.count++;
	}

	/** @param { Value } value */
	addConstant(value) {
		this.constants.write(value);
		return this.constants.count - 1;
	}
}
