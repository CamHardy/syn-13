import { Callable } from './callable.js';
import { Interpreter } from './interpreter.js';
import { Environment } from './environment.js';
/** @import { Func } from './statement.js' */

export class Function extends Callable {
	/** @type { Func } */
	#declaration;

	/** @param { Func } declaration */
	constructor(declaration) {
		super();
		this.#declaration = declaration;
	}

	arity() {
		return this.#declaration.params.length;
	}

	/** 
	 * @param { Interpreter } interpreter 
	 * @param { any[] } args 
	 */
	call(interpreter, args) {
		const environment = new Environment(interpreter.globals);
		for (let i = 0; i < this.#declaration.params.length; i++) {
			environment.define(this.#declaration.params[i].lexeme, args[i]);
		}
		interpreter.visitBlock(this.#declaration.body, environment);

		return null;
	}

	toString() {
		return `<fn ${this.#declaration.name.lexeme}>`;
	}
}