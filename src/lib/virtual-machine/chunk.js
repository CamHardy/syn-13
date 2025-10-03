import { growArray, growCapacity } from "./memory.js";
import { ValueArray } from "./value.js";
/** @import { Value } from "./value.js" */

/** @enum { number } */
export const OpCode = Object.freeze({
	OP_CONSTANT: 0x01,
	OP_NIL: 0x02,
	OP_TRUE: 0x03,
	OP_FALSE: 0x04,
	OP_EQUAL: 0x05,
	OP_GREATER: 0x06,
	OP_LESS: 0x07,
	OP_ADD: 0x08,
	OP_SUBTRACT: 0x09,
	OP_MULTIPLY: 0x0a,
	OP_DIVIDE: 0x0b,
	OP_NOT: 0x0c,
	OP_NEGATE: 0x0d,
	OP_RETURN: 0x0e
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
