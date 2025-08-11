import { Callable } from './callable.js';
import { Instance } from './instance.js';
/** @import { Interpreter } from './interpreter.js' */

export class SynClass extends Callable {
	name;

	/** @param { string } name */
	constructor(name) {
		super();
		this.name = name;
	}

	/** 
	 * @param { Interpreter } _interpreter 
	 * @param { any[] } _arguments
	 */
	call(_interpreter, _arguments) {
		return new Instance(this);
	}

	arity() {
		return 0;
	}

	toString() {
		return this.name;
	}
}