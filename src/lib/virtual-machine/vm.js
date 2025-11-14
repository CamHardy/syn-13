import { Chunk, OpCode } from './chunk.js';
import { disassembleInstruction } from './debug.js';
import { DEBUG_TRACE_EXECUTION } from './common.js';
import { compile } from './compiler.js';
import { freeObjects } from './memory.js';
import { Table } from './table.js';
import { 
	AS_STRING, 
	IS_STRING, 
	takeString,
	OBJ_TYPE, 
	AS_CLOSURE,
	AS_FUNCTION,
	AS_NATIVE,
	copyString,
	newNative,
	newClosure,
	newUpvalue
} from './object.js';
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
	printValue, 
	IS_OBJ,
} from './value.js';
/** @import { Value } from './value.js' */
/** @import { NativeFn, Obj, ObjString, ObjClosure, ObjFunction, ObjUpvalue } from './object.js' */

/** 
 * @typedef { Object } CallFrame
 * @property { ObjClosure } closure
 * @property { number } ip
 * @property { number } slots
 */

const FRAMES_MAX = 64;

/** @type { number } */
const STACK_MAX = 256;
const RUNTIME_ERROR = new Error();

export const InterpretResult = Object.freeze({
	INTERPRET_OK: 0,
	INTERPRET_COMPILE_ERROR: 1,
	INTERPRET_RUNTIME_ERROR: 2
});

/** @type { NativeFn } */
function clockNative(argCount, args) {
	return NUMBER_VAL(process.uptime());
}

export class VM {
	/** @type { CallFrame[] } */
	static frames;
	/** @type { number } */
	static frameCount;
	/** @type { Value[] } */
	static stack;
	/** @type { number } */
	static stackTop;
	/** @type { Table<ObjString, Value> } */
	static globals;
	/** @type { Table<string, ObjString> } */
	static strings;
	/** @type { Obj | null} */
	static objects;


	constructor() {
		VM.resetStack();
		VM.frames = [];
		VM.frameCount = 0;
		VM.stack = new Array(STACK_MAX);
		VM.objects = null;
		VM.globals = new Table();
		VM.strings = new Table();

		VM.defineNative('clock', clockNative);
	}

	static freeVM() {
		VM.globals.free();
		VM.strings.free();
		freeObjects();
	}

	/** @param { string } source */
	static interpret(source) {
		let fn = compile(source);
		if (fn === null) return InterpretResult.INTERPRET_COMPILE_ERROR;

		VM.push(OBJ_VAL(fn));
		let closure = newClosure(fn);
		VM.pop();
		VM.push(OBJ_VAL(closure));
		this.call(closure, 0);

		return VM.run();
	}

	static run() {
		let frame = VM.frames[VM.frameCount - 1];

		const READ_BYTE = () => frame.closure.function.chunk.code[frame.ip++];
		const READ_CONSTANT = () => frame.closure.function.chunk.constants.values[READ_BYTE()];
		const READ_SHORT = () => {
			frame.ip += 2;
			return (frame.closure.function.chunk.code[frame.ip - 2] << 8) | frame.closure.function.chunk.code[frame.ip - 1];
		};
		const READ_STRING = () => AS_STRING(READ_CONSTANT());
		/** 
		 * @param { (value: any) => Value } valueType
		 * @param { (a: number, b: number) => any } op 
		 */
		const BINARY_OP = (valueType, op) => {
			if (!IS_NUMBER(this.peek(0)) || !IS_NUMBER(this.peek(1))) {
				this.runtimeError('Operands must be numbers.');
				throw RUNTIME_ERROR;
			}
			/** @type { number } */
			const b = AS_NUMBER(this.pop());
			/** @type { number } */
			const a = AS_NUMBER(this.pop());
			this.push(valueType(op(a, b)));
		};

		try {
			for (;;) {
				if (DEBUG_TRACE_EXECUTION) {
					let print = '          ';
					for (let slot = 0; slot < this.stackTop; slot++) {
						print += '[ ' + this.stack[slot] + ' ]';
					}
					console.log(print);
					disassembleInstruction(frame.closure.function.chunk, frame.ip);
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
					case OpCode.OP_GET_LOCAL: {
						let slot = READ_BYTE();
						VM.push(VM.stack[frame.slots + slot]); 
						break;
					}
					case OpCode.OP_SET_LOCAL: {
						let slot = READ_BYTE();
						VM.stack[frame.slots + slot] = this.peek(0); 
						break;
					}
					case OpCode.OP_GET_GLOBAL: {
						let name = READ_STRING();
						let value = VM.globals.get(name);

						if (value === undefined) {
							VM.runtimeError(`Undefined variable '${name.chars}'.`);
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}

						VM.push(value); 
						break;
					}
					case OpCode.OP_DEFINE_GLOBAL: {
						let name = READ_STRING();
						VM.globals.set(name, this.peek(0));
						this.pop(); 
						break;
					}
					case OpCode.OP_SET_GLOBAL: {
						let name = READ_STRING();

						if (VM.globals.set(name, this.peek(0))) {
							VM.globals.delete(name);
							VM.runtimeError(`Undefined variable '${name.chars}'.`);

							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						break;
					}
					case OpCode.OP_GET_UPVALUE: {
						let slot = READ_BYTE();
						let upvalue = frame.closure.upvalues[slot];
						if (upvalue) this.push(upvalue.location);
						break;
					}
					case OpCode.OP_SET_UPVALUE: {
						let slot = READ_BYTE();
						let upvalue = frame.closure.upvalues[slot];
						if (upvalue) upvalue.location = this.peek(0);
						break;
					}
					case OpCode.OP_EQUAL: {
						let b = this.pop();
						let a = this.pop();
						this.push(BOOL_VAL(valuesEqual(a, b))); break;
					}
					case OpCode.OP_GREATER: BINARY_OP(BOOL_VAL, (a, b) => a > b); break;
					case OpCode.OP_LESS: BINARY_OP(BOOL_VAL, (a, b) => a < b); break;
					case OpCode.OP_ADD: {
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
					}
					case OpCode.OP_SUBTRACT: BINARY_OP(NUMBER_VAL, (a, b) => a - b); break;
					case OpCode.OP_MULTIPLY: BINARY_OP(NUMBER_VAL, (a, b) => a * b); break;
					case OpCode.OP_DIVIDE: BINARY_OP(NUMBER_VAL, (a, b) => a / b); break;
					case OpCode.OP_NOT:
						this.push(BOOL_VAL(this.isFalsey(this.pop()))); break;
					case OpCode.OP_NEGATE: {
						if (!IS_NUMBER(this.peek(0))) {
							VM.runtimeError('Operand must be a number.');
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						this.push(NUMBER_VAL(-AS_NUMBER(this.pop()))); 
						break;
					}
					case OpCode.OP_PRINT:
						printValue(this.pop()); break;
					case OpCode.OP_JUMP: {
						let offset = READ_SHORT();
						frame.ip += offset;
						break;
					}
					case OpCode.OP_JUMP_IF_FALSE: {
						let offset = READ_SHORT();
						if (this.isFalsey(this.peek(0))) frame.ip += offset;
						break;
					}
					case OpCode.OP_LOOP: {
						let offset = READ_SHORT();
						frame.ip -= offset;
						break;
					}
					case OpCode.OP_CALL: {
						let argCount = READ_BYTE();

						if (!this.callValue(this.peek(argCount), argCount)) {
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						frame = this.frames[this.frameCount - 1]
						break;
					}
					case OpCode.OP_CLOSURE: {
						let func = AS_FUNCTION(READ_CONSTANT());
						let closure = newClosure(func);
						this.push(OBJ_VAL(closure));

						for (let i = 0; i < closure.upvalueCount; i++) {
							let isLocal = READ_BYTE();
							let index = READ_BYTE();

							if (isLocal) {
								closure.upvalues[i] = VM.captureUpvalue(VM.stack[frame.slots + index]);
							} else {
								closure.upvalues[i] = frame.closure.upvalues[index];
							}
						}

						break;
					}
					case OpCode.OP_RETURN: {
						let result = this.pop();
						VM.frameCount--;

						if (VM.frameCount === 0) {
							this.pop();

							return InterpretResult.INTERPRET_OK;
						}

						VM.stackTop = frame.slots;
						this.push(result);
						frame = VM.frames[VM.frameCount - 1];

						break;
					}
				}
			}
		} catch (e) {
			if (e === RUNTIME_ERROR) return InterpretResult.INTERPRET_RUNTIME_ERROR;
		}
	}

	static resetStack() {
		this.stackTop = 0;
		this.frameCount = 0;
	}

	/**
	 * @param { string } format
	 * @param { ...unknown } args
	 */
	static runtimeError(format, ...args) {
		console.error(format, ...args);

		for (let i = VM.frameCount - 1; i >= 0; i--) {
			let frame = VM.frames[i];
			let func = frame.closure.function;
			let instruction = frame.ip -1;

			if (func.name === null) {
					console.error(`[line ${func.chunk.lines[instruction]}] in script`);
				} else {
						console.error(`[line ${func.chunk.lines[instruction]}] in ${func.name.chars}()`);
				}
		}

		this.resetStack();

		throw RUNTIME_ERROR;
  }

	/**
	 * @param { string } name 
	 * @param { NativeFn } func 
	 */
	static defineNative(name, func) {
		this.push(OBJ_VAL(copyString(name)));
		this.push(OBJ_VAL(newNative(func)));
		VM.globals.set(AS_STRING(VM.stack[0]), VM.stack[1]);
		this.pop();
		this.pop();
	}

	/** @param { Value } value */
	static push(value) {
		VM.stack[VM.stackTop++] = value;
	}

	/** @returns { Value } */
	static pop() {
		return VM.stack[--VM.stackTop];
	}

	/** @param { number } distance */
	static peek(distance) {
		return this.stack[this.stackTop - 1 - distance];
	}

	/**
	 * @param { ObjClosure } closure 
	 * @param { number } argCount 
	 * @returns { boolean }
	 */
	static call(closure, argCount) {
		if (argCount != closure.function.arity) {
			this.runtimeError(`Expected ${closure.function.arity} arguments but got ${argCount}`);
			return false;
		}

		if (VM.frameCount === FRAMES_MAX) {
			this.runtimeError('Stack overflow.');
			return false;
		}

		VM.frames[VM.frameCount++] = {
			closure: closure,
			ip: 0,
			slots: VM.stackTop - argCount - 1
		};

		return true;
	}

	/**
	 * @param { Value } callee 
	 * @param { number } argCount 
	 * @returns { boolean }
	 */
	static callValue(callee, argCount) {
		if (IS_OBJ(callee)) {
			switch (OBJ_TYPE(callee)) {
				case 'OBJ_CLOSURE' :
					return this.call(AS_CLOSURE(callee), argCount);
				case 'OBJ_FUNCTION':
					return this.call(AS_CLOSURE(callee), argCount);
				case 'OBJ_NATIVE':
					let native = AS_NATIVE(callee);
					let result = native(argCount, VM.stack.slice(VM.stackTop - argCount, VM.stackTop));
					VM.stackTop -= argCount + 1;
					this.push(result);

					return true;
				default:
					break;
			}
		}
		this.runtimeError("Can only call functions and classes.");

		return false;
	}

	/**
	 * @param { Value } local 
	 * @returns { ObjUpvalue }
	 */
	static captureUpvalue(local) {
		let createdUpvalue = newUpvalue(local);
		return createdUpvalue;
	}

	/** @param { Value } value */
	static isFalsey(value) {
		return IS_NIL(value) || (IS_BOOL(value) && !AS_BOOL(value));
	}

	static concatenate() {
		let b = AS_STRING(this.pop());
		let a = AS_STRING(this.pop());
		
		let result = takeString(a.chars + b.chars);

		this.push(OBJ_VAL(result));
	}
} 