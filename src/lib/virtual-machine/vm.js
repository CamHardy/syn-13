import { Chunk } from './chunk.js';
import { OpCode } from './chunk.js';
import { disassembleInstruction } from './debug.js';
import { DEBUG_TRACE_EXECUTION } from './common.js';
/** @import { Value } from './value.js' */

/** @type { number } */
const STACK_MAX = 256;

const InterpretResult = Object.freeze({
	INTERPRET_OK: 0,
	INTERPRET_COMPILE_ERROR: 1,
	INTERPRET_RUNTIME_ERROR: 2
});

export class VM {
	/** @type { Chunk } */
	chunk = new Chunk();
	/** @type { number } */
	ip = 0;
	/** @type { Value[] } */
	stack = new Array(STACK_MAX);
	/** @type { number } */
	stackTop = 0;


	constructor() {
		this.resetStack();
	}

	/** @param { Chunk } chunk */
	interpret(chunk) {
		this.chunk = chunk;
		this.ip = 0;

		return this.run();
	}

	run() {
		const READ_BYTE = () => this.chunk.code[this.ip++];
		const READ_CONSTANT = () => this.chunk.constants.values[READ_BYTE()];

		/** @param { (a: Value, b: Value) => Value } op */
		const BINARY_OP = (op) => {
			const b = this.pop();
			const a = this.pop();
			this.push(op(a, b));
		};

		for (;;) {
			if (DEBUG_TRACE_EXECUTION) {
				let print = '          ';
				for (let slot = 0; slot < this.stackTop; slot++) {
					print += '[ ' + this.stack[slot] + ' ]';
				}
				console.log(print);
				disassembleInstruction(this.chunk, this.ip);
			}
			let instruction;
			switch (instruction = READ_BYTE()) {
				case OpCode.OP_CONSTANT:
					const constant = READ_CONSTANT();
					this.push(constant);
					break;
				case OpCode.OP_ADD:
					BINARY_OP((a, b) => a + b);
					break;
				case OpCode.OP_SUBTRACT:
					BINARY_OP((a, b) => a - b);
					break;
				case OpCode.OP_MULTIPLY:
					BINARY_OP((a, b) => a * b);
					break;
				case OpCode.OP_DIVIDE:
					BINARY_OP((a, b) => a / b);
					break;
				case OpCode.OP_NEGATE:
					this.push(-this.pop());
					break;
				case OpCode.OP_RETURN:
					console.log(this.pop());
					return InterpretResult.INTERPRET_OK;
			}
		}
	}

	resetStack() {
		this.stackTop = 0;
	}

	/** @param { Value } value */
	push(value) {
		this.stack[this.stackTop++] = value;
	}

	pop() {
		return this.stack[--this.stackTop];
	}
} 