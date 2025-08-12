import { Callable } from './callable.js';
import { Instance } from './instance.js';
/** @import { Interpreter } from './interpreter.js' */
/** @import { Function as SynFunction } from './function.js' */

export class SynClass extends Callable {
	name;
	methods;

	/** 
	 * @param { string } name 
	 * @param { Map<string, SynFunction> } methods
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
	 * @param { Interpreter } interpreter 
	 * @param { any[] } args
	 */
	call(interpreter, args) {
		const instance = new Instance(this);
		const initializer = this.findMethod('init');

		if (initializer) {
			initializer.bind(instance).call(interpreter, args);
		}

		return instance;
	}

	arity() {
		const initializer = this.findMethod('init');
		if (!initializer) return 0;

		return initializer.arity();
	}

	toString() {
		return this.name;
	}
}