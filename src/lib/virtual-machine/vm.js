import { Chunk, OpCode } from './chunk.js';
import { disassembleInstruction } from './debug.js';
import { DEBUG_TRACE_EXECUTION } from './common.js';
import { compile } from './compiler.js';
import { NIL_VAL, BOOL_VAL, NUMBER_VAL, AS_NUMBER, IS_NUMBER } from './value.js';
/** @import { Value } from './value.js' */

/** @type { number } */
const STACK_MAX = 256;
const RUNTIME_ERROR = new Error();

export const InterpretResult = Object.freeze({
	INTERPRET_OK: 0,
	INTERPRET_COMPILE_ERROR: 1,
	INTERPRET_RUNTIME_ERROR: 2
});

export class VM {
	/** @type { Chunk } */
	static chunk = new Chunk();
	/** @type { number } */
	static ip = 0;
	/** @type { Value[] } */
	static stack = new Array(STACK_MAX);
	/** @type { number } */
	static stackTop = 0;


	constructor() {
		VM.resetStack();
	}

	/** @param { string } source */
	static interpret(source) {
		/** @type { Chunk | null } */
		let chunk = new Chunk();

		if (!compile(source, chunk)) {
			chunk = null;

			return InterpretResult.INTERPRET_COMPILE_ERROR;
		}

		this.chunk = chunk;
		this.ip = 0;

		let result = VM.run();
		chunk = null;

		return result;
	}

	static run() {
		const READ_BYTE = () => this.chunk.code[this.ip++];
		const READ_CONSTANT = () => this.chunk.constants.values[READ_BYTE()];
		/** @param { (a: number, b: number) => number } op */
		const BINARY_OP = (op) => {
			if (!IS_NUMBER(this.peek(0)) || !IS_NUMBER(this.peek(1))) {
				this.runtimeError('Operands must be numbers.');
				throw RUNTIME_ERROR;
			}
			/** @type { number } */
			const b = AS_NUMBER(this.pop());
			/** @type { number } */
			const a = AS_NUMBER(this.pop());
			this.push(NUMBER_VAL(op(a, b)));
		};

		try {
			for (;;) {
				if (DEBUG_TRACE_EXECUTION) {
					let print = '          ';
					for (let slot = 0; slot < this.stackTop; slot++) {
						print += '[ ' + this.stack[slot] + ' ]';
					}
					console.log(print);
					disassembleInstruction(this.chunk, this.ip);
				}
				
				switch (READ_BYTE()) {
					case OpCode.OP_CONSTANT:
						const constant = READ_CONSTANT();
						VM.push(constant);
						break;
					case OpCode.OP_NIL:
						VM.push(NIL_VAL());
						break;
					case OpCode.OP_TRUE:
						VM.push(BOOL_VAL(true));
						break;
					case OpCode.OP_FALSE:
						VM.push(BOOL_VAL(false));
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
						if (!IS_NUMBER(this.peek(0))) {
							VM.runtimeError('Operand must be a number.');
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						VM.push(VM.pop());
						break;
					case OpCode.OP_RETURN:
						console.log(VM.pop());
						return InterpretResult.INTERPRET_OK;
				}
			}
		} catch (e) {
			if (e === RUNTIME_ERROR) return InterpretResult.INTERPRET_RUNTIME_ERROR;
		}
	}

	static resetStack() {
		this.stackTop = 0;
	}

	/**
   * @param { string } format
   * @param { ...unknown } args
   */
  static runtimeError(format, ...args) {
    console.error(format, ...args);

    let instruction = this.ip - 1;
    let line = this.chunk.lines[instruction];
    console.error(`[line ${line}] in script`);
    this.resetStack();

		throw RUNTIME_ERROR;
  }

	/** @param { Value } value */
	static push(value) {
		VM.stack[VM.stackTop++] = value;
	}

	/** @return { Value } */
	static pop() {
		return VM.stack[--VM.stackTop];
	}

	/** @param { number } distance */
	static peek(distance) {
		return this.stack[this.stackTop - 1 - distance];
	}
} 