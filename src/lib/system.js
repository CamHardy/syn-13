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
		console.error(`${error.message}\n[line ${error.token.line}]`);
		this.hadRuntimeError = true;
	}

	/**
	 * @param { number } line 
	 * @param { string } where 
	 * @param { string } message 
	 */
	static #report(line, where, message) {
		console.error(`[line ${line}] Error${where}: ${message}`);
		this.hadError = true;
	}
}

//TODO: handle errors
System.run(`
	class Donut {
		cook() {
			print("Fry the donut until golden brown...");
		}
	}

	class BostonCream < Donut {
		cook() {
			super.cook();
			print("Pipe the donut full of custard and frost with chocolate icing...");
		}
		eat() {
			print("You are now eating a Boston Cream donut.");
		}
	}

	BostonCream().cook();
	BostonCream().eat();
`);

	//TODO: exit process gracefully
if (System.hadError) console.error('I had an error :(');
if (System.hadRuntimeError) console.error('I had a runtime error :(');