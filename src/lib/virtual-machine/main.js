import { Chunk, OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';
import { VM, InterpretResult } from './vm.js';
import fs from 'fs';
import readline from 'node:readline';

/** @type { VM | null } */
let vm = new VM();

async function repl() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	for (;;) {
		/** @type { string | null } */
		let line = await new Promise((resolve) => {
			rl.once('close', () => resolve(null));
			rl.question('> ', resolve);
		});

		if (line === null) {
			process.stdout.write('\n');
			break;
		}

		vm?.interpret(line);
	}

	rl.close();
}

/** @param { string } path */
function runFile(path) {
	let source = fs.readFileSync(path, 'utf-8');
	let result = /** @type { import('./vm.js').InterpretResult } */ (vm?.interpret(source));

	if (result === InterpretResult.INTERPRET_COMPILE_ERROR) process.exit(65);
	if (result === InterpretResult.INTERPRET_RUNTIME_ERROR) process.exit(70);
}

if (process.argv.length === 2) {
	await repl();
} else if (process.argv.length === 3) {
	runFile(process.argv[2]);
} else {
	console.log('Usage: node main.js [path]');
	process.exit(64);
}

vm = null;