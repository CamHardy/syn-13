import { Callable } from './callable.js';
import { Instance } from './instance.js';
/** @import { Interpreter } from './interpreter.js' */
/** @import { Function } from './function.js' */

export class SynClass extends Callable {
	name;
	methods;

	/** 
	 * @param { string } name 
	 * @param { Map<string, Function> } methods
	 */
	constructor(name, methods) {
		super();
		this.name = name;
		this.methods = methods;
	}

	/** @param { string } name */
	findMethod(name) {
		if (this.methods.has(name)) {
			return this.methods.get(name);
		}

		return null;
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