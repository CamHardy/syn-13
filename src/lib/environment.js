import { RuntimeError } from './interpreter.js';
/** @import { Token } from './token.js' */

export class Environment {
	#values = new Map();

	/**
	 * @param { Token } name 
	 * @returns { any }
	 */
	get(name) {
		if (this.#values.has(name.lexeme)) {
			return this.#values.get(name.lexeme);
		}
		
		throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
	}

	/**
	 * @param { string } name 
	 * @param { any } value 
	 */
	define(name, value) {
		this.#values.set(name, value);
	}
}