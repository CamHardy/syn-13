import { Chunk, OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';

/** @type { Chunk | null } */
let chunk = new Chunk();
chunk.write(OpCode.OP_RETURN);
chunk.write(OpCode.OP_RETURN);
chunk.write(OpCode.OP_CONSTANT);

disassembleChunk(chunk, 'test chunk');
chunk = null;