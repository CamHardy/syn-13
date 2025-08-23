import { Scanner } from './scanner.js';
import { Parser } from './parser.js';
import { Interpreter } from './interpreter.js';
import { Resolver } from './resolver.js';

/** @import { Token } from './token.js' */
/** @import { StatementType } from './statement.js' */
/** @import { RuntimeError } from './interpreter.js' */

export class System {
	static #interpreter = new Interpreter();
	static hadError = false;
	static hadRuntimeError = false;

	/** @param { string } source */
	static run(source) {
    this.hadError = false;
    this.hadRuntimeError = false;
		const scanner = new Scanner(source);
		const tokens = scanner.scanTokens();
		const parser = new Parser(tokens);
		const statements = parser.parse();

		if (this.hadError) return;

		const resolver = new Resolver(this.#interpreter);
		resolver.resolveBlock(/** @type { StatementType[] } */ (statements));

		if (this.hadError) return;

		this.#interpreter.interpret(/** @type { StatementType[] } */ (statements));
	}

	/**
	 * @param { Token | number } token 
	 * @param { string } message 
	 */
	static error(token, message) {
		if (typeof token === 'number') {
			this.#report(token, '', message);
			return;
		}

		if (token.type === 'EOF') {
			this.#report(token.line, ' at end', message);
		} else {
			this.#report(token.line, ` at '${token.lexeme}'`, message);
		}
	}

	/** @param { RuntimeError } error */
	static runtimeError(error) {
		console.log(`${error.message}\n[line ${error.token.line}]`);
		this.hadRuntimeError = true;
	}

	/**
	 * @param { number } line 
	 * @param { string } where 
	 * @param { string } message 
	 */
	static #report(line, where, message) {
		console.log(`[line ${line}] Error${where}: ${message}`);
		this.hadError = true;
	}
}

//TODO: handle errors
// System.run(`
// 	fun fib(n) {
// 		if (n < 2) return n;
// 		return fib(n - 1) + fib(n - 2);
// 	}
// 	var before = clock();
// 	print fib(40);
// 	var after = clock();
// 	print after - before;
// `);

// System.run(`
// 	var a = "a";
// 	(a) = "value";
// `);

//TODO: exit process gracefully
// if (System.hadError) console.log('I had an error :(');
// if (System.hadRuntimeError) console.log('I had a runtime error :(');