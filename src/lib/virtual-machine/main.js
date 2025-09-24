import { Chunk, OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';
import { VM, InterpretResult } from './vm.js';
import fs from 'fs';

/** @type { VM | null } */
let vm = new VM();

function repl() {
	let line = new Array(1024);
	for (;;) {
		process.stdout.write('> ');

		/** @type { string | null } */
		let line = process.stdin.read();
		if (line === null) {
			break;
		} else {
			vm?.interpret(line);
		}
	}
}

/** @param { string } path */
function runFile(path) {
	let source = fs.readFileSync(path, 'utf-8');
	let result = /** @type { import('./vm.js').InterpretResult } */ (vm?.interpret(source));

	if (result === InterpretResult.INTERPRET_COMPILE_ERROR) process.exit(65);
	if (result === InterpretResult.INTERPRET_RUNTIME_ERROR) process.exit(70);
}

if (process.argv.length === 2) {
	repl();
} else if (process.argv.length === 3) {
	runFile(process.argv[0]);
} else {
	console.log('Usage: node main.js [path]');
	process.exit(64);
}

vm = null;