import { OpCode } from './chunk.js';
import { DEBUG_TRACE_EXECUTION } from './common.js';
import { compile } from './compiler.js';
import { disassembleInstruction } from './debug.js';
import { freeObjects } from './memory.js';
import {
	AS_BOUND_METHOD,
	AS_CLASS,
	AS_CLOSURE,
	AS_FUNCTION,
	AS_INSTANCE,
	AS_NATIVE,
	AS_STRING,
	IS_INSTANCE,
	IS_STRING,
	OBJ_TYPE,
	copyString,
	newBoundMethod,
	newClass,
	newClosure,
	newInstance,
	newNative,
	newUpvalue,
	takeString
} from './object.js';
import { Table } from './table.js';
import {
	AS_BOOL,
	AS_NUMBER,
	IS_BOOL,
	IS_OBJ,
	IS_NIL,
	IS_NUMBER,
	BOOL_VAL,
	NIL_VAL,
	NUMBER_VAL,
	OBJ_VAL,
	printValue,
	valuesEqual
} from './value.js';
/** @import { NativeFn, Obj, ObjClass, ObjClosure, ObjString, ObjUpvalue } from './object.js' */
/** @import { Value } from './value.js' */

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
	/** @type { ObjString | null } */
	static initString;
	/** @type { (ObjUpvalue | null)[] } */
	static openUpvalues;
	/** @type { Obj | null } */
	static objects;
	/** @type { Obj[] } */
	static grayStack;
	/** @type { number } */
	static bytesAllocated;
	/** @type { number } */
	static nextGC;

	constructor() {
		VM.resetStack();
		VM.frames = [];
		VM.stack = new Array(STACK_MAX);
		VM.objects = null;
		VM.grayStack = [];
		VM.globals = new Table();
		VM.strings = new Table();
		VM.bytesAllocated = 0;
		VM.nextGC = 256;
		VM.initString = copyString('init');

		VM.defineNative('clock', clockNative);
	}

	static freeVM() {
		VM.globals.free();
		VM.strings.free();
		VM.initString = null;
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
		VM.call(closure, 0);

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
			if (!IS_NUMBER(VM.peek(0)) || !IS_NUMBER(VM.peek(1))) {
				VM.runtimeError('Operands must be numbers.');
				throw RUNTIME_ERROR;
			}
			/** @type { number } */
			const b = AS_NUMBER(VM.pop());
			/** @type { number } */
			const a = AS_NUMBER(VM.pop());
			VM.push(valueType(op(a, b)));
		};

		try {
			for (; ;) {
				if (DEBUG_TRACE_EXECUTION) {
					let print = '          ';
					for (let slot = 0; slot < VM.stackTop; slot++) {
						print += '[ ' + VM.stack[slot] + ' ]';
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
						VM.pop(); break;
					case OpCode.OP_GET_LOCAL: {
						let slot = READ_BYTE();
						VM.push(VM.stack[frame.slots + slot]);
						break;
					}
					case OpCode.OP_SET_LOCAL: {
						let slot = READ_BYTE();
						VM.stack[frame.slots + slot] = VM.peek(0);
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
						VM.globals.set(name, VM.peek(0));
						VM.pop();
						break;
					}
					case OpCode.OP_SET_GLOBAL: {
						let name = READ_STRING();

						if (VM.globals.set(name, VM.peek(0))) {
							VM.globals.delete(name);
							VM.runtimeError(`Undefined variable '${name.chars}'.`);

							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						break;
					}
					case OpCode.OP_GET_UPVALUE: {
						let slot = READ_BYTE();
						let upvalue = frame.closure.upvalues[slot];
						if (upvalue) VM.push(upvalue.location === null ? upvalue.closed : VM.stack[upvalue.location]);
						break;
					}
					case OpCode.OP_SET_UPVALUE: {
						let slot = READ_BYTE();
						let upvalue = frame.closure.upvalues[slot];
						if (upvalue) {
							if (upvalue.location === null) upvalue.closed = VM.peek(0);
							else VM.stack[upvalue.location] = VM.peek(0);
						}
						break;
					}
					case OpCode.OP_GET_PROPERTY: {
						if (!IS_INSTANCE(VM.peek(0))) {
							VM.runtimeError('Only instances have properties.');
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}

						let instance = AS_INSTANCE(VM.peek(0));
						let name = READ_STRING();

						let value = instance.fields.get(name);
						if (value !== undefined) {
							VM.pop();
							VM.push(value);
							break;
						}

						if (!VM.bindMethod(instance.klass, name)) {
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						break;
					}
					case OpCode.OP_SET_PROPERTY: {
						if (!IS_INSTANCE(VM.peek(1))) {
							VM.runtimeError('Only instances have properties.');
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}

						let instance = AS_INSTANCE(VM.peek(1));
						instance.fields.set(READ_STRING(), VM.peek(0));
						let value = VM.pop();
						VM.pop();
						VM.push(value);
						break;
					}
					case OpCode.OP_EQUAL: {
						let b = VM.pop();
						let a = VM.pop();
						VM.push(BOOL_VAL(valuesEqual(a, b))); break;
					}
					case OpCode.OP_GREATER: BINARY_OP(BOOL_VAL, (a, b) => a > b); break;
					case OpCode.OP_LESS: BINARY_OP(BOOL_VAL, (a, b) => a < b); break;
					case OpCode.OP_ADD: {
						if (IS_STRING(VM.peek(0)) && IS_STRING(VM.peek(1))) {
							VM.concatenate();
						} else if (IS_NUMBER(VM.peek(0)) && IS_NUMBER(VM.peek(1))) {
							let b = AS_NUMBER(VM.pop());
							let a = AS_NUMBER(VM.pop());
							VM.push(NUMBER_VAL(a + b));
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
						VM.push(BOOL_VAL(VM.isFalsey(VM.pop()))); break;
					case OpCode.OP_NEGATE: {
						if (!IS_NUMBER(VM.peek(0))) {
							VM.runtimeError('Operand must be a number.');
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						VM.push(NUMBER_VAL(-AS_NUMBER(VM.pop())));
						break;
					}
					case OpCode.OP_PRINT:
						printValue(VM.pop()); break;
					case OpCode.OP_JUMP: {
						let offset = READ_SHORT();
						frame.ip += offset;
						break;
					}
					case OpCode.OP_JUMP_IF_FALSE: {
						let offset = READ_SHORT();
						if (VM.isFalsey(VM.peek(0))) frame.ip += offset;
						break;
					}
					case OpCode.OP_LOOP: {
						let offset = READ_SHORT();
						frame.ip -= offset;
						break;
					}
					case OpCode.OP_CALL: {
						let argCount = READ_BYTE();

						if (!VM.callValue(VM.peek(argCount), argCount)) {
							return InterpretResult.INTERPRET_RUNTIME_ERROR;
						}
						frame = VM.frames[VM.frameCount - 1]
						break;
					}
					case OpCode.OP_CLOSURE: {
						let func = AS_FUNCTION(READ_CONSTANT());
						let closure = newClosure(func);
						VM.push(OBJ_VAL(closure));

						for (let i = 0; i < closure.upvalueCount; i++) {
							let isLocal = READ_BYTE();
							let index = READ_BYTE();

							if (isLocal) {
								closure.upvalues[i] = VM.captureUpvalue(frame.slots + index);
							} else {
								closure.upvalues[i] = frame.closure.upvalues[index];
							}
						}

						break;
					}
					case OpCode.OP_CLOSE_UPVALUE:
						VM.closeUpvalues(VM.stackTop - 1);
						VM.pop();
						break;
					case OpCode.OP_RETURN: {
						let result = VM.pop();
						VM.closeUpvalues(frame.slots);
						VM.frameCount--;

						if (VM.frameCount === 0) {
							VM.pop();

							return InterpretResult.INTERPRET_OK;
						}

						VM.stackTop = frame.slots;
						VM.push(result);
						frame = VM.frames[VM.frameCount - 1];

						break;
					}
					case OpCode.OP_CLASS:
						VM.push(OBJ_VAL(newClass(READ_STRING())));
						break;
					case OpCode.OP_METHOD:
						VM.defineMethod(READ_STRING());
						break;
				}
			}
		} catch (e) {
			if (e === RUNTIME_ERROR) return InterpretResult.INTERPRET_RUNTIME_ERROR;
			throw e;
		}
	}

	static resetStack() {
		VM.stackTop = 0;
		VM.frameCount = 0;
		VM.openUpvalues = [null];
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
			let instruction = frame.ip - 1;

			if (func.name === null) {
				console.error(`[line ${func.chunk.lines[instruction]}] in script`);
			} else {
				console.error(`[line ${func.chunk.lines[instruction]}] in ${func.name.chars}()`);
			}
		}

		VM.resetStack();

		throw RUNTIME_ERROR;
	}

	/**
	 * @param { string } name 
	 * @param { NativeFn } func 
	 */
	static defineNative(name, func) {
		VM.push(OBJ_VAL(copyString(name)));
		VM.push(OBJ_VAL(newNative(func)));
		VM.globals.set(AS_STRING(VM.stack[0]), VM.stack[1]);
		VM.pop();
		VM.pop();
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
		return VM.stack[VM.stackTop - 1 - distance];
	}

	/**
	 * @param { ObjClosure } closure 
	 * @param { number } argCount 
	 * @returns { boolean }
	 */
	static call(closure, argCount) {
		if (argCount != closure.function.arity) {
			VM.runtimeError(`Expected ${closure.function.arity} arguments but got ${argCount}`);
			return false;
		}

		if (VM.frameCount === FRAMES_MAX) {
			VM.runtimeError('Stack overflow.');
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
				case 'OBJ_BOUND_METHOD': {
					let bound = AS_BOUND_METHOD(callee);
					VM.stack[VM.stackTop - argCount - 1] = bound.receiver;

					return VM.call(bound.method, argCount);
				}
				case 'OBJ_CLASS': {
					let klass = AS_CLASS(callee);
					VM.stack[VM.stackTop - argCount - 1] = OBJ_VAL(newInstance(klass));
					let initializer = klass.methods.get(/** @type {ObjString} */(VM.initString));
					if (initializer) {
						return VM.call(AS_CLOSURE(initializer), argCount)
					} else if (argCount !== 0) {
						VM.runtimeError(`Expected 0 arguments but got ${argCount}.`);
						return false;
					}

					return true;
				}
				case 'OBJ_CLOSURE':
					return VM.call(AS_CLOSURE(callee), argCount);
				case 'OBJ_FUNCTION':
					return VM.call(AS_CLOSURE(callee), argCount);
				case 'OBJ_NATIVE':
					let native = AS_NATIVE(callee);
					let result = native(argCount, VM.stack.slice(VM.stackTop - argCount, VM.stackTop));
					VM.stackTop -= argCount + 1;
					VM.push(result);

					return true;
				default:
					break;
			}
		}
		VM.runtimeError("Can only call functions and classes.");

		return false;
	}

	/**
	 * @param { ObjClass } klass 
	 * @param { ObjString } name 
	 */
	static bindMethod(klass, name) {
		let method = klass.methods.get(name);
		if (!method) {
			VM.runtimeError(`Undefined property '${name.chars}'.`);
			return false;
		}

		let bound = newBoundMethod(VM.peek(0), AS_CLOSURE(method));

		VM.pop();
		VM.push(OBJ_VAL(bound));
		return true;
	}

	/**
	 * @param { number } local 
	 * @returns { ObjUpvalue }
	 */
	static captureUpvalue(local) {
		let prevUpvalue = null;
		let upvalue = VM.openUpvalues[0];

		while (upvalue !== null && upvalue.location !== null && upvalue.location > local) {
			prevUpvalue = upvalue;
			upvalue = /** @type ObjUpvalue */ (upvalue.next);
		}

		if (upvalue !== null && upvalue.location === local) {
			return upvalue;
		}

		let createdUpvalue = newUpvalue(local);
		createdUpvalue.next = upvalue;

		if (prevUpvalue === null) {
			VM.openUpvalues[0] = createdUpvalue;
		} else {
			prevUpvalue.next = createdUpvalue;
		}
		return createdUpvalue;
	}

	/** @param { number } last */
	static closeUpvalues(last) {
		let upvalue = VM.openUpvalues[0];
		while (upvalue !== null && upvalue.location !== null && upvalue.location >= last) {
			upvalue.closed = VM.stack[upvalue.location];
			upvalue.location = null;
			VM.openUpvalues[0] = upvalue.next;
			upvalue = VM.openUpvalues[0];
		}
	}

	/** @param { ObjString } name */
	static defineMethod(name) {
		let method = VM.peek(0);
		let klass = AS_CLASS(VM.peek(1));
		klass.methods.set(name, method);

		VM.pop();
	}

	/** @param { Value } value */
	static isFalsey(value) {
		return IS_NIL(value) || (IS_BOOL(value) && !AS_BOOL(value));
	}

	static concatenate() {
		let b = AS_STRING(VM.peek(0));
		let a = AS_STRING(VM.peek(1));

		let result = takeString(a.chars + b.chars);
		VM.pop();
		VM.pop();
		VM.push(OBJ_VAL(result));
	}
} 