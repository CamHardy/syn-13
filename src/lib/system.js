import { Scanner } from './scanner.js';
import { Parser } from './parser.js';
import { AstPrinter } from './astPrinter.js';
import { Expression } from './expression.js';
import { Token } from './token.js';

/** @import { ExpressionType } from './expression.js' } */

export class System {
	static hadError = false;

	/** @param { string } source */
	static run(source) {
		const scanner = new Scanner(source);
		const tokens = scanner.scanTokens();
		const parser = new Parser(tokens);
		const expression = parser.parse();
		if (expression === null) {
			this.hadError = true;
		}

		if (this.hadError) {
			return;
		}

		// for now just print the tokens
		console.log(tokens);
		console.log(AstPrinter.print(/** @type { ExpressionType } */ (expression)));
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

//TODO: run actual code
//TODO: handle errors
System.run('-123 * (45.67)');

if (System.hadError) {
	//TODO: exit process gracefully
	console.error('I had an error :(');
}