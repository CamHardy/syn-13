import { growArray, growCapacity } from "./memory.js";
import { ValueArray } from "./value.js";
import { VM } from "./vm.js";
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
	OP_GET_UPVALUE: 0x0b,
	OP_SET_UPVALUE: 0x0c,
	OP_GET_PROPERTY: 0x0d,
	OP_SET_PROPERTY: 0x0e,
	OP_EQUAL: 0x0f,
	OP_GREATER: 0x10,
	OP_LESS: 0x11,
	OP_ADD: 0x12,
	OP_SUBTRACT: 0x13,
	OP_MULTIPLY: 0x14,
	OP_DIVIDE: 0x15,
	OP_NOT: 0x16,
	OP_NEGATE: 0x17,
	OP_PRINT: 0x18,
	OP_JUMP: 0x19,
	OP_JUMP_IF_FALSE: 0x1a,
	OP_LOOP: 0x1b,
	OP_CALL: 0x1c,
	OP_INVOKE: 0x1d,
	OP_CLOSURE: 0x1e,
	OP_CLOSE_UPVALUE: 0x1f,
	OP_RETURN: 0x20,
	OP_CLASS: 0x21,
	OP_METHOD: 0x22
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
		VM.push(value);
		this.constants.write(value);
		VM.pop();
		return this.constants.count - 1;
	}
}
