import { OpCode } from './chunk.js';
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
function disassembleInstruction(chunk, offset) {
	let output = String(offset).padStart(4, '0');
	let instruction = chunk.code[offset];
	switch (instruction) {
		case OpCode.OP_RETURN:
			return simpleInstruction('OP_RETURN', offset, output);
		case OpCode.OP_CONSTANT:
			return constantInstruction('OP_CONSTANT', chunk, offset, output);
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
function constantInstruction(name, chunk, offset, output) {
	let constant = chunk.code[offset + 1];
	name = name.padEnd(16);
	console.log(`${output} ${name} ${String(constant).padStart(4, '0')} ${chunk.constants.values[constant]}`);

	return offset + 2;
}