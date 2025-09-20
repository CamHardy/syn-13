import { Chunk, OpCode } from './chunk.js';

/** @type { Chunk | null } */
let chunk = new Chunk();
chunk.write(OpCode.OP_RETURN);
chunk.write(OpCode.OP_RETURN);
chunk = null;