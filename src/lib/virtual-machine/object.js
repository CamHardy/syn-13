import { AS_OBJ, IS_OBJ } from './value.js';
/** @import { Value } from "./value.js" */

/** @typedef { 'OBJ_STRING' } ObjType */

/** 
 * @typedef { Object } Obj 
 * @property { ObjType } type
 */

/** 
 * @typedef { Obj & { length: number, chars: string} } ObjString
 */

/**
 * @param { ObjType } type
 * @returns { Obj }
 */
export function allocateObject(type) {
	let object = { type };
	return object;
}

/** 
 * @param { string } str 
 * @return { ObjString }
 */
export function allocateString(str) {
	/** @type { ObjString } */
	return {
		length: str.length,
		chars: str,
		type: 'OBJ_STRING'
	};
}

/** 
 * @param { string } str 
 * @return { ObjString }
 */
export function copyString(str) {
	return allocateString(str);
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