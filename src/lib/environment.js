import { RuntimeError } from './interpreter.js';
/** @import { Token } from './token.js' */

export class Environment {
	enclosing;
	#values = new Map();

	/** @param { Environment | null } enclosing */
	constructor(enclosing = null) {
		this.enclosing = enclosing;
	}

	/**
	 * @param { Token } name 
	 * @returns { any }
	 */
	get(name) {
		if (this.#values.has(name.lexeme)) {
			return this.#values.get(name.lexeme);
		}

		if (this.enclosing) return this.enclosing.get(name);

		throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
	}

	/**
	 * @param { string } name 
	 * @param { any } value 
	 */
	define(name, value) {
		this.#values.set(name, value);
	}

	/**
	 * @param { Token } name
	 * @param { any } value
	 */
	assign(name, value) {
		if (this.#values.has(name.lexeme)) {
			this.#values.set(name.lexeme, value);
			return;
		}

		if (this.enclosing) {
			this.enclosing.assign(name, value);
			return;
		}
		
		throw new RuntimeError(name, `Undefined variable '${name.lexeme}'.`);
	}
}