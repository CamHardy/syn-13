import { Callable } from './callable.js';
import { Interpreter } from './interpreter.js';
import { Environment } from './environment.js';
/** @import { Func } from './statement.js' */
/** @import { ReturnException } from './interpreter.js'} */

export class Function extends Callable {
	/** @type { Func } */
	#declaration;
	/** @type { Environment } */
	#closure;

	/** 
	 * @param { Func } declaration 
	 * @param { Environment } closure
	 */
	constructor(declaration, closure) {
		super();
		this.#declaration = declaration;
		this.#closure = closure;
	}

	arity() {
		return this.#declaration.params.length;
	}

	/** 
	 * @param { Interpreter } interpreter 
	 * @param { any[] } args 
	 */
	call(interpreter, args) {
		const environment = new Environment(this.#closure);
		for (let i = 0; i < this.#declaration.params.length; i++) {
			environment.define(this.#declaration.params[i].lexeme, args[i]);
		}

		try {
			interpreter.visitBlock(this.#declaration.body, environment);
		} catch (returnValue) {
			return /** @type { ReturnException } */ (returnValue).value;
		}


		return null;
	}

	toString() {
		return `<fn ${this.#declaration.name.lexeme}>`;
	}
}