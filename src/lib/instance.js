/** @import { SynClass } from './class.js' */
/** @import { Token } from './token.js' */

export class Instance {
	#klass;
	#fields = new Map();

	/** @param { SynClass } klass */
	constructor(klass) {
		this.#klass = klass;
	}

	/** @param { Token } name */
	get(name) {
		if (this.#fields.has(name.lexeme)) {
			return this.#fields.get(name.lexeme);
		}

		const method = this.#klass.findMethod(name.lexeme);
		if (method) return method.bind(this);

		throw new Error(`Undefined property '${name.lexeme}'.`);
	}

	/** 
	 * @param { Token } name 
	 * @param { any } value 
	 */
	set(name, value) {
		this.#fields.set(name.lexeme, value);
	}

	toString() {
		return `${this.#klass.name} instance`;
	}
}