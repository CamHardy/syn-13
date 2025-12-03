import { OpCode } from './chunk.js';
import { AS_FUNCTION } from './object.js';
import { valueToString } from './value.js';
/** @import { Chunk } from './chunk.js'; */

/**
 * @param { Chunk } chunk 
 * @param { string } name 
 */
export function disassembleChunk(chunk, name) {
	console.log(`== ${name} ==`);

	for (let offset = 0; offset < chunk.count;) {
		offset = disassembleInstruction(chunk, offset);
	}
}

/**
 * @param { Chunk } chunk 
 * @param { number } offset 
 */
export function disassembleInstruction(chunk, offset) {
	let output = String(offset).padStart(4, '0');
	if (offset > 0 && chunk.lines[offset] === chunk.lines[offset - 1]) {
		output += '    |';
	} else {
		output += ` ${String(chunk.lines[offset]).padStart(4, ' ')}`;
	}
	let instruction = chunk.code[offset];
	switch (instruction) {
		case OpCode.OP_CONSTANT:
			return constantInstruction('OP_CONSTANT', chunk, offset, output);
		case OpCode.OP_NIL:
			return simpleInstruction('OP_NIL', offset, output);
		case OpCode.OP_TRUE:
			return simpleInstruction('OP_TRUE', offset, output);
		case OpCode.OP_FALSE:
			return simpleInstruction('OP_FALSE', offset, output);
		case OpCode.OP_POP:
			return simpleInstruction('OP_POP', offset, output);
		case OpCode.OP_GET_LOCAL:
			return byteInstruction('OP_GET_LOCAL', chunk, offset, output);
		case OpCode.OP_SET_LOCAL:
			return byteInstruction('OP_SET_LOCAL', chunk, offset, output);
		case OpCode.OP_GET_GLOBAL:
			return constantInstruction('OP_GET_GLOBAL', chunk, offset, output);
		case OpCode.OP_DEFINE_GLOBAL:
			return constantInstruction('OP_DEFINE_GLOBAL', chunk, offset, output);
		case OpCode.OP_SET_GLOBAL:
			return constantInstruction('OP_SET_GLOBAL', chunk, offset, output);
		case OpCode.OP_GET_UPVALUE:
			return byteInstruction('OP_GET_UPVALUE', chunk, offset, output);
		case OpCode.OP_SET_UPVALUE:
			return byteInstruction('OP_SET_UPVALUE', chunk, offset, output);
		case OpCode.OP_EQUAL:
			return simpleInstruction('OP_EQUAL', offset, output);
		case OpCode.OP_GREATER:
			return simpleInstruction('OP_GREATER', offset, output);
		case OpCode.OP_LESS:
			return simpleInstruction('OP_LESS', offset, output);
		case OpCode.OP_ADD:
			return simpleInstruction('OP_ADD', offset, output);
		case OpCode.OP_SUBTRACT:
			return simpleInstruction('OP_SUBTRACT', offset, output);
		case OpCode.OP_MULTIPLY:
			return simpleInstruction('OP_MULTIPLY', offset, output);
		case OpCode.OP_DIVIDE:
			return simpleInstruction('OP_DIVIDE', offset, output);
		case OpCode.OP_NOT:
			return simpleInstruction('OP_NOT', offset, output);
		case OpCode.OP_NEGATE:
			return simpleInstruction('OP_NEGATE', offset, output);
		case OpCode.OP_PRINT:
			return simpleInstruction('OP_PRINT', offset, output);
		case OpCode.OP_JUMP:
			return jumpInstruction('OP_JUMP', 1, chunk, offset, output);
		case OpCode.OP_JUMP_IF_FALSE:
			return jumpInstruction('OP_JUMP_IF_FALSE', 1, chunk, offset, output);
		case OpCode.OP_LOOP:
			return jumpInstruction('OP_LOOP', -1, chunk, offset, output);
		case OpCode.OP_CALL:
			return byteInstruction('OP_CALL', chunk, offset, output);
		case OpCode.OP_CLOSURE:
			offset++;
			let constant = chunk.code[offset++];
			console.log(`${output} ${'OP_CLOSURE'.padEnd(16)} ${String(constant).padStart(4, ' ')} ${valueToString(chunk.constants.values[constant])}`);

			let func = AS_FUNCTION(chunk.constants.values[constant]);
			for (let j = 0; j < func.upvalueCount; j++) {
				let isLocal = chunk.code[offset++];
				let index = chunk.code[offset++];
				console.log(`${String(offset - 2).padStart(4, '0')}      |                     ${isLocal ? 'local' : 'upvalue'} ${index}`);
			}

			return offset;
		case OpCode.OP_CLOSE_UPVALUE:
			return simpleInstruction('OP_CLOSE_UPVALUE', offset, output);
		case OpCode.OP_RETURN:
			return simpleInstruction('OP_RETURN', offset, output);
		case OpCode.OP_CLASS:
			return constantInstruction('OP_CLASS', chunk, offset, output);
		default:
			console.log(`Unknown opcode ${instruction}`);
			return offset + 1;
	}
}

/**
 * @param { string } name 
 * @param { number } offset 
 * @param { string } output
 */
function simpleInstruction(name, offset, output) {
	console.log(`${output} ${name}`);

	return offset + 1;
}

/**
 * @param { string } name 
 * @param { Chunk } chunk 
 * @param { number } offset 
 * @param { string } output 
 */
function byteInstruction(name, chunk, offset, output) {
	let slot = chunk.code[offset + 1];
	name = name.padEnd(19);
	console.log(`${output} ${name} ${slot}`);

	return offset + 2;
}

/**
 * @param { string } name 
 * @param { number } sign 
 * @param { Chunk } chunk 
 * @param { number } offset 
 * @param { string } output 
 * @returns 
 */
function jumpInstruction(name, sign, chunk, offset, output) {
	let jump = chunk.code[offset + 1] << 8;
	jump |= chunk.code[offset + 2];
	console.log(`${output} ${name} ${offset} ${offset + 3 + sign * jump}`);

	return offset + 3;
}

/**
 * @param { string } name 
 * @param { Chunk } chunk 
 * @param { number } offset 
 * @param { string } output
 */
function constantInstruction(name, chunk, offset, output) {
	let constant = chunk.code[offset + 1];
	name = name.padEnd(16);
	console.log(`${output} ${name} ${String(constant).padStart(4, ' ')} '${valueToString(chunk.constants.values[constant])}'`);

	return offset + 2;
}