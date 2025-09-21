import { OpCode } from './chunk.js';
/** @import { Chunk } from './chunk.js'; */

/**
 * @param { Chunk } chunk 
 * @param { string } name 
 */
export function disassembleChunk(chunk, name) {
	console.log(`== ${name} ==`);

	for (let offset = 0; offset < chunk.count; offset++) {
		disassembleInstruction(chunk, offset);
	}
}

/**
 * @param { Chunk } chunk 
 * @param { number } offset 
 */
function disassembleInstruction(chunk, offset) {
	const o = String(offset).padStart(4, '0');

	let instruction = chunk.code[offset];
	switch (instruction) {
		case OpCode.OP_RETURN:
			return console.log(o, 'OP_RETURN');
		case OpCode.OP_CONSTANT:
			return console.log(o, 'OP_CONSTANT');
		default:
			return console.log(o, `Unknown opcode ${instruction}`);
	}
}
