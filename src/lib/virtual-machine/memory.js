import { VM } from './vm.js';

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
	VM.objects = null;
}

export function collectGarbage() { }