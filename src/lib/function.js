import { Callable } from './callable.js';
import { Environment } from './environment.js';

/** @import { Interpreter } from './interpreter.js' */
/** @import { Instance } from './instance.js' */
/** @import { Func } from './statement.js' */
/** @import { ReturnException } from './interpreter.js'} */

export class Function extends Callable {
	#isInitializer;
	#declaration;
	#closure;

	/** 
	 * @param { Func } declaration 
	 * @param { Environment } closure
	 * @param { boolean } isInitializer
	 */
	constructor(declaration, closure, isInitializer) {
		super();
		this.#isInitializer = isInitializer;
		this.#declaration = declaration;
		this.#closure = closure;
	}

	arity() {
		return this.#declaration.params.length;
	}

	/** @param { Instance } instance */
	bind(instance) {
		const environment = new Environment(this.#closure);
		environment.define('this', instance);

		return new Function(this.#declaration, environment, this.#isInitializer);
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
			if (this.#isInitializer) return this.#closure.getAt(0, 'this');
			
			return /** @type { ReturnException } */ (returnValue).value;
		}

		if (this.#isInitializer) return this.#closure.getAt(0, 'this');
		return null;
	}

	toString() {
		return `<fn ${this.#declaration.name.lexeme}>`;
	}
}