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
	 * @param { number } distance 
	 * @param { string } name 
	 * @returns { any }
	 */
	getAt(distance, name) {
		return this.ancestor(distance).#values.get(name);
	}

	/**
	 * @param { number } distance 
	 * @returns { Environment }
	 */
	ancestor(distance) {
		/** @type { Environment } */
		let environment = /** @type { Environment } */ (this);
		for (let i = 0; i < distance; i++) {
			environment = /** @type { Environment } */ (environment.enclosing);
		}

		return environment;
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

	/**
	 * @param { number } distance 
	 * @param { Token } name 
	 * @param { any } value 
	 */
	assignAt(distance, name, value) {
		this.ancestor(distance).#values.set(name.lexeme, value);
	}	
}