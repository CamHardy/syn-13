import { growArray, growCapacity } from "./memory.js";
import { ValueArray } from "./value.js";
/** @import { Value } from "./value.js" */

/** @enum { number } */
export const OpCode = Object.freeze({
	OP_CONSTANT: 0x01,
	OP_NIL: 0x02,
	OP_TRUE: 0x03,
	OP_FALSE: 0x04,
	OP_POP: 0x05,
	OP_GET_LOCAL: 0x06,
	OP_SET_LOCAL: 0x07,
	OP_GET_GLOBAL: 0x08,
	OP_DEFINE_GLOBAL: 0x09,
	OP_SET_GLOBAL: 0x0a,
	OP_EQUAL: 0x0b,
	OP_GREATER: 0x0c,
	OP_LESS: 0x0d,
	OP_ADD: 0x0e,
	OP_SUBTRACT: 0x0f,
	OP_MULTIPLY: 0x10,
	OP_DIVIDE: 0x11,
	OP_NOT: 0x12,
	OP_NEGATE: 0x13,
	OP_PRINT: 0x14,
	OP_JUMP: 0x15,
	OP_JUMP_IF_FALSE: 0x16,
	OP_RETURN: 0x17
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
