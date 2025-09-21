import { Chunk, OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';

/** @type { Chunk | null } */
let chunk = new Chunk();
let constant = chunk.addConstant(1.2);
chunk.write(OpCode.OP_CONSTANT);
chunk.write(constant);

chunk.write(OpCode.OP_RETURN);

disassembleChunk(chunk, 'test chunk');
chunk = null;