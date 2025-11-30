import { AS_OBJ, IS_OBJ, NIL_VAL, OBJ_VAL } from './value.js';
import { VM } from './vm.js';
import { Chunk } from "./chunk.js";
import { DEBUG_LOG_GC, DEBUG_STRESS_GC } from "./common.js";
import { collectGarbage } from "./memory.js";
/** @import { Value } from "./value.js" */

/** @typedef { 'OBJ_CLOSURE' | 'OBJ_FUNCTION' | 'OBJ_NATIVE' | 'OBJ_STRING' | 'OBJ_UPVALUE' } ObjType */

/** 
 * @typedef { Object } Obj 
 * @property { ObjType } type
 * @property { boolean } isMarked
 * @property { Obj | null } next
 */

/** 
 * @typedef { Obj & {
 * 	arity: number,
 *  upvalueCount: number,
 * 	chunk: Chunk,
 * 	name: ObjString | null
 * } } ObjFunction
 */

/** @typedef { (argCount: number, args: Value[]) => Value } NativeFn */

/** 
 * @typedef { Obj & {
 * 	function: NativeFn;
 * } } ObjNative
 */

/** 
 * @typedef { Obj & { 
 * 	length: number, 
 * 	chars: string,
 * 	hash: number
 * } } ObjString
 */

/**
 * @typedef { Obj & {
 *  location: number | null
 *  closed: Value
 *  next: ObjUpvalue | null
 * } } ObjUpvalue
 */

/**
 * @typedef { Obj & {
 *  function: ObjFunction
 *  upvalues: (ObjUpvalue | null)[]
 *  upvalueCount: number
 * } } ObjClosure
 */

/**
 * @param { ObjType } type
 * @returns { Obj }
 */
export function allocateObject(type) {
	if (DEBUG_STRESS_GC) collectGarbage();
	VM.bytesAllocated++;

	if (VM.bytesAllocated > VM.nextGC) {
		collectGarbage();
	}

	let object = {
		type,
		isMarked: false,
		next: VM.objects
	};

	VM.objects = object;

	if (DEBUG_LOG_GC) {
		console.log(`${object} allocate for ${type}`);
	}

	return object;
}

/** 
 * @param { ObjFunction } func 
 * @returns { ObjClosure }
 */
export function newClosure(func) {
	/** @type { ObjUpvalue | null [] } */
	let upvalues = new Array(func.upvalueCount);

	for (let i = 0; i < func.upvalueCount; i++) {
		upvalues[i] = null;
	}

	let closure_ = allocateObject('OBJ_CLOSURE');

	let closure = Object.assign(closure_, {
		function: func,
		upvalues,
		upvalueCount: func.upvalueCount
	});

	return closure;
}

/** @returns { ObjFunction } */
export function newFunction() {
	let func = allocateObject('OBJ_FUNCTION');

	let fn = Object.assign(func, {
		arity: 0,
		upvalueCount: 0,
		chunk: new Chunk(),
		name: null
	});

	return fn;
}

/** @param { NativeFn } func */
export function newNative(func) {
	let native = allocateObject('OBJ_NATIVE');

	native = Object.assign(native, {
		function: func
	});

	return native;
}

/** 
 * @param { string } str 
 * @param { number } hash
 * @returns { ObjString }
 */
export function allocateString(str, hash) {
	let base = allocateObject('OBJ_STRING');

	let string = Object.assign(base, {
		length: str.length,
		chars: str,
		hash
	});

	VM.push(OBJ_VAL(string));
	VM.strings.set(str, string);
	VM.pop();
	return string;
}

/** @param { string } key */
function hashString(key) {
	let hash = 2166136261;
	for (let i = 0; i < key.length; i++) {
		hash ^= key.charCodeAt(i);
		hash *= 16777619;
	}

	return hash;
}

/** 
 * @param { string } str  
 * @returns { ObjString }
 */
export function takeString(str) {
	let interned = VM.strings.get(str);
	if (interned) return interned;

	return allocateString(str, hashString(str));
}

/** 
 * @param { string } str 
 * @returns { ObjString }
 */
export function copyString(str) {
	let interned = VM.strings.get(str);
	if (interned) return interned;

	return allocateString(str, hashString(str));
}

/**
 * @param { number } slot 
 * @returns { ObjUpvalue }
 */
export function newUpvalue(slot) {
	let upvalue_ = allocateObject('OBJ_UPVALUE');

	let upvalue = Object.assign(upvalue_, {
		closed: NIL_VAL(),
		location: slot,
		next: null
	});

	return upvalue;
}

/** @param { ObjFunction } fn */
function printFunction(fn) {
	if (fn.name === null) {
		console.log('<script>');
		return;
	}
	console.log(`<fn ${fn.name.chars}>`);
}

/** @param { Value } value */
export function objectToString(value) {
	switch (OBJ_TYPE(value)) {
		case 'OBJ_CLOSURE':
			return functionToString(AS_CLOSURE(value).function);
		case 'OBJ_FUNCTION':
			return functionToString(AS_FUNCTION(value));
		case 'OBJ_NATIVE':
			return '<native fn>';
		case 'OBJ_STRING':
			return AS_CSTRING(value);
		case 'OBJ_UPVALUE':
			return 'upvalue';
	}
}

/**
 * @param { ObjFunction } fn 
 * @returns { string }
 */
function functionToString(fn) {
	if (fn.name === null) return '<script';
	return `<fn ${fn.name.chars}>`;
}

/** @param { Value } value */
export function printObject(value) {
	console.log(objectToString(value));
}

/** 
 * @param { Value } value 
 * @returns { ObjType }
 */
export function OBJ_TYPE(value) { return AS_OBJ(value).type }

/** @param { Value } value */
export function IS_CLOSURE(value) { return isObjType(value, 'OBJ_CLOSURE'); }

/** @param { Value } value */
export function IS_FUNCTION(value) { return isObjType(value, 'OBJ_FUNCTION'); }

/** @param { Value } value */
export function IS_NATIVE(value) { return isObjType(value, 'OBJ_NATIVE'); }

/** @param { Value } value */
export function IS_STRING(value) { return isObjType(value, 'OBJ_STRING'); }

/**
 * @param { Value } value 
 * @returns { ObjClosure }
 */
export function AS_CLOSURE(value) { return AS_OBJ(value); }

/**
 * @param { Value } value 
 * @returns { ObjFunction } 
 */
export function AS_FUNCTION(value) { return AS_OBJ(value); }

/**
 * @param { Value } value 
 * @returns { NativeFn }
 */
export function AS_NATIVE(value) { return AS_OBJ(value).function; }

/** 
 * @param { Value } value 
 * @returns { ObjString }
 */
export function AS_STRING(value) { return AS_OBJ(value); }

/** @param { Value } value */
export function AS_CSTRING(value) { return AS_STRING(value).chars; }

/** 
 * @param { Value } value 
 * @param { ObjType } type 
 * @returns { boolean }
 */
export function isObjType(value, type) { return IS_OBJ(value) && AS_OBJ(value).type === type; }