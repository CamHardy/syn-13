import { Chunk, OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';

/** @type { Chunk | null } */
let chunk = new Chunk();
let constant = chunk.addConstant(1.2);
chunk.write(OpCode.OP_CONSTANT, 123);
chunk.write(constant, 123);

chunk.write(OpCode.OP_RETURN, 123);

disassembleChunk(chunk, 'test chunk');
chunk = null;