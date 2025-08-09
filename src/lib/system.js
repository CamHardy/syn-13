import { Scanner } from './scanner.js';
import { Parser } from './parser.js';
import { AstPrinter } from './astPrinter.js';
import { Expression } from './expression.js';
import { Interpreter, RuntimeError } from './interpreter.js';
import { Token } from './token.js';
import { Resolver } from './resolver.js';

/** @import { ExpressionType } from './expression.js' } */
/** @import { StatementType } from './statement.js' } */

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
	fun makeCounter() {
		var i = 0;
		fun count() {
			i = i + 1;
			print i;
		}
		return count;
	}
	var counter = makeCounter();
	counter(); // '1'
	counter(); // '2'
`);

	//TODO: exit process gracefully
if (System.hadError) console.error('I had an error :(');
if (System.hadRuntimeError) console.error('I had a runtime error :(');