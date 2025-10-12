import { Chunk, OpCode } from './chunk.js';
import { disassembleInstruction } from './debug.js';
import { DEBUG_TRACE_EXECUTION } from './common.js';
import { compile } from './compiler.js';
import { freeObjects } from './memory.js';
import { Table } from './table.js';
import { AS_STRING, IS_STRING, takeString } from './object.js';
import { 
	BOOL_VAL, 
	NIL_VAL, 
	NUMBER_VAL, 
	OBJ_VAL, 
	AS_BOOL,
	AS_NUMBER, 
	IS_BOOL,
	IS_NIL,
	IS_NUMBER,
	valuesEqual,
	printValue } from './value.js';
/** @import { Value } from './value.js' */
/** @import { Obj } from './object.js' */

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
	static chunk;
	/** @type { number } */
	static ip;
	/** @type { Value[] } */
	static stack;
	/** @type { number } */
	static stackTop = 0;
	/** @type { Table } */
	static globals;
	/** @type { Table } */
	static strings;
	/** @type { Obj | null} */
	static objects;


	constructor() {
		VM.resetStack();
		VM.chunk = new Chunk();
		VM.ip = 0;
		VM.stack = new Array(STACK_MAX);
		VM.objects = null;
		VM.globals = new Table();
		VM.strings = new Table();
	}

	static freeVM() {
		VM.globals.free();
		VM.strings.free();
		freeObjects();
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
		const READ_STRING = () => AS_STRING(READ_CONSTANT());
		/** @param { (a: number, b: number) => any } op */
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
						VM.push(constant); break;
					case OpCode.OP_NIL:
						VM.push(NIL_VAL()); break;
					case OpCode.OP_TRUE:
						VM.push(BOOL_VAL(true)); break;
					case OpCode.OP_FALSE:
						VM.push(BOOL_VAL(false)); break;
					case OpCode.OP_POP:
						this.pop(); break;
					case OpCode.OP_DEFINE_GLOBAL: {
						let name = READ_STRING();
						VM.globals.set(name, AS_STRING(this.peek(0)));
						this.pop(); 
						break;
					}
					case OpCode.OP_EQUAL:
						let b = this.pop();
						let a = this.pop();
						this.push(BOOL_VAL(valuesEqual(a, b))); break;
					case OpCode.OP_GREATER:
						BINARY_OP((a, b) => a > b); break;
					case OpCode.OP_LESS:
						BINARY_OP((a, b) => a < b); break;
					case OpCode.OP_ADD:
						if (IS_STRING(this.peek(0)) && IS_STRING(this.peek(1))) {
							this.concatenate();
						} else if (IS_NUMBER(this.peek(0)) && IS_NUMBER(this.peek(1))) {
							let b = AS_NUMBER(this.pop());
							let a = AS_NUMBER(this.pop());
							this.push(NUMBER_VAL(a + b));
						} else {
							VM.runtimeError('Operands must be two numbers or two strings.');
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						} 
						break;
					case OpCode.OP_SUBTRACT:
						BINARY_OP((a, b) => a - b); break;
					case OpCode.OP_MULTIPLY:
						BINARY_OP((a, b) => a * b); break;
					case OpCode.OP_DIVIDE:
						BINARY_OP((a, b) => a / b); break;
					case OpCode.OP_NOT:
						this.push(BOOL_VAL(this.isFalsey(this.pop()))); break;
					case OpCode.OP_NEGATE:
						if (!IS_NUMBER(this.peek(0))) {
							VM.runtimeError('Operand must be a number.');
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						this.push(NUMBER_VAL(-AS_NUMBER(this.pop()))); 
						break;
					case OpCode.OP_PRINT:
						printValue(this.pop());
						break;
					case OpCode.OP_RETURN:
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

	/** @param { Value } value */
	static isFalsey(value) {
		return IS_NIL(value) || (IS_BOOL(value) && !AS_BOOL(value));
	}

	static concatenate() {
		let b = AS_STRING(this.pop());
		let a = AS_STRING(this.pop());
		
		let result = takeString(a + b);

		this.push(OBJ_VAL(result));
	}
} 