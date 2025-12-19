import { DEBUG_LOG_GC } from './common.js';
import { markCompilerRoots } from "./compiler.js";
import { markTable, tableRemoveWhite } from "./table.js";
import { AS_OBJ, IS_OBJ, OBJ_VAL } from './value.js';
import { VM } from './vm.js';
/** @import { Obj, ObjBoundMethod, ObjClass, ObjClosure, ObjFunction, ObjInstance, ObjUpvalue } from "./object.js" */
/** @import { Value, ValueArray } from "./value.js" */

const GC_HEAP_GROW_FACTOR = 2;

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

/** @param { Obj | null } object */
export function markObject(object) {
	if (object === null) return;
	if (object.isMarked) return;

	if (DEBUG_LOG_GC) {
		console.log(`${object} mark`);
		console.log(OBJ_VAL(object));
	}

	object.isMarked = true;

	VM.grayStack.push(object);
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

/** @param { ValueArray } array */
function markArray(array) {
	for (let i = 0; i < array.count; i++) {
		markValue(array.values[i]);
	}
}

/** @param { Obj } object */
function blackenObject(object) {
	if (DEBUG_LOG_GC) {
		console.log(`${object} blacken`);
		console.log(OBJ_VAL(object));
	}

	switch (object.type) {
		case 'OBJ_BOUND_METHOD': {
			let bound = /** @type { ObjBoundMethod } */(object);
			markValue(bound.receiver);
			markObject(bound.method);
			break;
		}
		case 'OBJ_CLASS': {
			let klass = /** @type { ObjClass } */(object);
			markObject(klass.name);
			markTable(klass.methods);
			break;
		}
		case 'OBJ_CLOSURE': {
			let closure = /** @type { ObjClosure } */ (object);
			markObject(closure.function);

			for (let i = 0; i < closure.upvalueCount; i++) {
				markObject(closure.upvalues[i]);
			}
			break;
		}
		case 'OBJ_FUNCTION': {
			let func = /** @type { ObjFunction } */ (object);
			markObject(func.name);
			markArray(func.chunk.constants);
			break;
		}
		case 'OBJ_INSTANCE': {
			let instance = /** @type { ObjInstance } */(object);
			markObject(instance.klass);
			markTable(instance.fields);
			break;
		}
		case 'OBJ_UPVALUE':
			markValue(/** @type { ObjUpvalue } **/(object).closed);
			break;
		case 'OBJ_NATIVE':
		case 'OBJ_STRING':
			break;
	}
}

function traceReferences() {
	while (VM.grayStack.length > 0) {
		let object = /** @type { Obj } **/ (VM.grayStack.pop());
		blackenObject(object);
	}
}

function sweep() {
	let previous = null;
	let object = VM.objects;

	while (object !== null) {
		if (object.isMarked) {
			object.isMarked = false;
			previous = object;
			object = object.next;
		} else {
			/** @type { Obj | null } */
			let unreached = object;
			object = object.next;
			VM.bytesAllocated--;

			if (previous !== null) {
				previous.next = object;
			} else {
				VM.objects = object;
			}

			unreached = null;
		}
	}
}

export function collectGarbage() {
	let before = 0;
	if (DEBUG_LOG_GC) {
		console.log('-- gc begin');
		before = VM.bytesAllocated;
	}

	markRoots();
	traceReferences();
	tableRemoveWhite(VM.strings);
	sweep();

	VM.nextGC = VM.bytesAllocated * GC_HEAP_GROW_FACTOR;

	if (DEBUG_LOG_GC) {
		console.log('-- gc end');
		console.log(`   collected ${before - VM.bytesAllocated} (from ${before} to ${VM.bytesAllocated}) next at ${VM.nextGC}`);
	}
}