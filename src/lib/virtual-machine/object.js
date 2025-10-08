import { AS_OBJ, IS_OBJ } from './value.js';
import { VM } from './vm.js';
/** @import { Value } from "./value.js" */

/** @typedef { 'OBJ_STRING' } ObjType */

/** 
 * @typedef { Object } Obj 
 * @property { ObjType } type
 * @property { Obj | null } next
 */

/** 
 * @typedef { Obj & { 
 * 	length: number, 
 * 	chars: string,
 * 	hash: number
 * } } ObjString
 */

/**
 * @param { ObjType } type
 * @returns { Obj }
 */
export function allocateObject(type) {
	let object = { 
		type, 
		next: VM.objects};

	VM.objects = object;
	return object;
}

/** 
 * @param { string } str 
 * @param { number } hash
 * @return { ObjString }
 */
export function allocateString(str, hash) {
	let base = allocateObject('OBJ_STRING');
	
	return  Object.assign(base, {
		length: str.length,
		chars: str,
		hash
	});
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
 * @return { ObjString }
 */
export function takeString(str) {
	let hash = hashString(str);
	return allocateString(str, hash);
}

/** 
 * @param { string } str 
 * @return { ObjString }
 */
export function copyString(str) {
	let hash = hashString(str);
	return allocateString(str, hash);
}

/** @param { Value } value */
export function printObject(value) {
	switch (OBJ_TYPE(value)) {
		case 'OBJ_STRING':
			console.log(AS_CSTRING(value).chars);
			break;
	}
}

/** 
 * @param { Value } value 
 * @return { ObjType }
 */
export function OBJ_TYPE(value) { return AS_OBJ(value).type }

/** 
 * @param { Value } value 
 * @return { boolean }
 */
export function IS_STRING(value) { return isObjType(value, 'OBJ_STRING') }

/** @param { Value } value */
export function AS_STRING(value) { return AS_OBJ(value).obj }

/** @param { Value } value */
export function AS_CSTRING(value) { return AS_STRING(value).chars }

/** 
 * @param { Value } value 
 * @param { ObjType } type 
 * @return { boolean }
 */
export function isObjType(value, type) {
	return IS_OBJ(value) && AS_OBJ(value).type === type;
}