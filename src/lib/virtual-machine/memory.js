import { VM } from './vm.js';
import { DEBUG_LOG_GC } from './common.js';
import { IS_OBJ, AS_OBJ, OBJ_VAL } from './value.js';
import { markTable } from "./table.js";
import { markCompilerRoots } from "./compiler.js";
/** @import { Value } from "./value.js" */
/** @import { Obj } from "./object.js" */

/** @param { number } capacity */
export function growCapacity(capacity) {
	return (capacity < 8) ? 8 : capacity * 2;
}

/** 
 * @param { Uint8Array } array
 * @param { number } capacity 
 */
export function growArray(array, capacity) {
	const newCode = new Uint8Array(capacity);
	newCode.set(array);
	return newCode;
}

export function freeObjects() {
	if (DEBUG_LOG_GC) {
		console.log('-- memory freed');
	}

	VM.objects = null;
}

/** @param { Obj } object */
export function markObject(object) {
	if (object === null) return;

	if (DEBUG_LOG_GC) {
		console.log(`${object} mark`);
		console.log(OBJ_VAL(object));
	}

	object.isMarked = true;
}

/** @param { Value } value */
export function markValue(value) {
	if (IS_OBJ(value)) markObject(AS_OBJ(value));

}

function markRoots() {
	for (let slot = 0; slot < VM.stackTop; slot++) {
		markValue(VM.stack[slot]);
	}

	for (let i = 0; i < VM.frameCount; i++) {
		markObject(VM.frames[i].closure);
	}

	for (let upvalue = VM.openUpvalues[0]; upvalue !== null; upvalue = upvalue.next) {
		markObject(upvalue);
	}

	markTable(VM.globals);
	markCompilerRoots();
}

export function collectGarbage() {
	if (DEBUG_LOG_GC) {
		console.log('-- gc begin');
	}

	markRoots();

	if (DEBUG_LOG_GC) {
		console.log('-- gc end');
	}
}