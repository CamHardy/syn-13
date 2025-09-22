import { Chunk, OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';
import { VM } from './vm.js';

/** @type { VM | null } */
let vm = new VM();

/** @type { Chunk | null } */
let chunk = new Chunk();
let constant = chunk.addConstant(1.2);
chunk.write(OpCode.OP_CONSTANT, 123);
chunk.write(constant, 123);
chunk.write(OpCode.OP_NEGATE, 123);

chunk.write(OpCode.OP_RETURN, 123);

disassembleChunk(chunk, 'test chunk');
vm.interpret(chunk);
vm = null;
chunk = null;