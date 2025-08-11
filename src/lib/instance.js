/** @import { SynClass } from './class.js' */

export class Instance {
	#klass;

	/** @param { SynClass } klass */
	constructor(klass) {
		this.#klass = klass;
	}

	toString() {
		return `${this.#klass.name} instance`;
	}
}