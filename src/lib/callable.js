import { Interpreter } from './interpreter.js';

/** @interface */
export class Callable {
	/** @returns { number } */
	arity() {
		throw new Error('not implemented');
	}
  /**
   * @param {Interpreter} interpreter
   * @param {any[]} args
   */
  call(interpreter, args) {}
}