import { Interpreter } from './interpreter.js';

/** @interface */
export class Callable {
	/** @returns { number } */
	arity() {
		throw new Error('not implemented');
	}
  
  /**
   * @param {Interpreter} _interpreter
   * @param {any[]} _args
   */
  call(_interpreter, _args) {
    throw new Error('not implemented');
  }
}