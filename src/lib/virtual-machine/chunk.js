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
	/** @type { number[] } */
	lines;
	constants;

	constructor() {
		this.count = 0;
		this.capacity = 0;
		this.code = new Uint8Array(this.capacity);
		this.lines = [];
		this.constants = new ValueArray();
	}

	/** 
	 * @param { number } byte 
	 * @param { number } line
	 */
	write(byte, line) {
		if (this.capacity < this.count + 1) {
			let oldCapacity = this.capacity;
			this.capacity = growCapacity(oldCapacity);
			this.code = growArray(this.code, this.capacity);
			this.lines.length = this.capacity;
		}
		
		this.code[this.count] = byte;
		this.lines[this.count] = line;
		this.count++;
	}

	/** @param { Value } value */
	addConstant(value) {
		this.constants.write(value);
		return this.constants.count - 1;
	}
}
