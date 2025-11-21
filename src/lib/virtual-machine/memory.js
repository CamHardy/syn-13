import { VM } from './vm.js';
import { DEBUG_LOG_GC } from './common.js';
import { IS_OBJ, AS_OBJ } from './value.js';
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
function markObject(object) {
	if (object === null) return;
}

/** @param { Value } value */
function markValue(value) {
	if (IS_OBJ(value)) markObject(AS_OBJ(value));

}

function markRoots() {
	for (let slot = 0; slot < VM.stackTop; slot++) {
		markValue(VM.stack[slot]);
	}
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