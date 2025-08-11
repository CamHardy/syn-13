import { System } from './system.js';
import { Environment } from './environment.js';
import { Callable } from './callable.js';
import { Function } from './function.js';

/** @import { Token } from './token.js' */
/** @import { Literal, Grouping, Unary, Binary, Variable, Assign, Logical, Call, ExpressionType } from './expression.js' */
/** @import { Block, Expression, Func, If, Print, Return, While, Var, StatementType } from './statement.js' */

export class Interpreter {
	globals = new Environment();
	#environment = this.globals;
	#locals = new Map();

	constructor() {
		this.globals.define('clock', new class Clock extends Callable {
			arity() {
				return 0;
			}
			/**
			 * @param { Interpreter } interpreter 
			 * @param { any[] } args 
			 */
			call(interpreter, args) {
				return Date.now() / 1000;
			}
			toString() {
				return '<native fn>';
			}
		});
	}

	/** @param { StatementType[] } statements */
	interpret(statements) {
		try {
			for (const statement of statements) {
				this.#visit(statement, this);
			}
		} catch (error) {
			if (error instanceof RuntimeError) {
				System.runtimeError(error);
			}
			throw error;
		}
	}

	/** @param { Assign } node */
	Assign(node) {
		const value = this.#visit(node.value, this);

		const distance = this.#locals.get(node.name);
		if (distance !== null) {
			this.#environment.assignAt(distance, node.name, value);
		} else {
			this.globals.assign(node.name, value);
		}

		return value;
	}

	/** @param { Binary } node */
	Binary(node) {
		const left = this.#visit(node.left, this);
		const right = this.#visit(node.right, this);

		switch (node.operator.type) {
			case 'GREATER':
				this.#checkNumberOperands(node.operator, left, right);
				return Number(left) > Number(right);
			case 'GREATER_EQUAL':
				this.#checkNumberOperands(node.operator, left, right);
				return Number(left) >= Number(right);
			case 'LESS':
				this.#checkNumberOperands(node.operator, left, right);
				return Number(left) < Number(right);
			case 'LESS_EQUAL':
				this.#checkNumberOperands(node.operator, left, right);
				return Number(left) <= Number(right);
			case 'MINUS':
				this.#checkNumberOperands(node.operator, left, right);
				return Number(left) - Number(right);
			case 'PLUS':
				if (typeof left === 'number' && typeof right === 'number') {
					return Number(left) + Number(right);
				}

				if (typeof left === 'string' && typeof right === 'string') {
					return String(left) + String(right);
				}

				throw new Error('Operands must be two numbers or two strings.');
			case 'SLASH':
				this.#checkNumberOperands(node.operator, left, right);
				return Number(left) / Number(right);
			case 'STAR':
				this.#checkNumberOperands(node.operator, left, right);
				return Number(left) * Number(right);
			case 'BANG_EQUAL':
				return this.#isEqual(left, right);
			case 'EQUAL_EQUAL':
				return this.#isEqual(left, right);
		}

		return null;
	}	

	/** @param { Block } node */
	Block(node) {
		this.visitBlock(node.statements, new Environment(this.#environment));

		return null;
	}

	/** @param { Call } node */
	Call(node) {
		const callee = this.#visit(node.callee, this);

		const args = [];
		for (const arg of node.args) {
			args.push(this.#visit(arg, this));
		}

		if (!(callee instanceof Callable)) {
			throw new Error('Can only call functions and classes.');
		}

		const fun = callee;
		if (args.length !== fun.arity()) {
			throw new Error(`Expected ${fun.arity()} arguments but got ${args.length}.`);
		}

		return fun.call(this, args);
	}

	/** @param { Expression } node */
	Expression(node) {
		this.#visit(node.expression, this);

		return null;
	}

	/** @param { Func } node */
	Function(node) {
		const func = new Function(node, this.#environment);
		this.#environment.define(node.name.lexeme, func);

		return null;
	}

	/** @param { Grouping } node */
	Grouping(node) {
		return this.#visit(node.expression, this);
	}

	/** @param { If } node */
	If(node) {
		if (this.#isTruthy(this.#visit(node.condition, this))) {
			this.#visit(node.thenBranch, this);
		} else if (node.elseBranch) {
			this.#visit(node.elseBranch, this);
		}

		return null;
	}

	/** @param { Literal } node */
	Literal(node) {
		return node.value;
	}
	/** @param { Logical } node */
	Logical(node) {
		const left = this.#visit(node.left, this);

		if (node.operator.type === 'OR') {
			if (this.#isTruthy(left)) return left;
		} else {
			if (!this.#isTruthy(left)) return left;
		}

		return this.#visit(node.right, this);
	}

	/** @param { Print } node */
	Print(node) {
		const value = this.#visit(node.expression, this);
		console.log(this.#stringify(value));

		return null;
	}

	/** @param { Return } node */
	Return(node) {
		let value = null;

		if (node.value !== null) value = this.#visit(node.value, this);

		throw new ReturnException(value);
	}

	/** @param { Unary } node */
	Unary(node) {
		const right = this.#visit(node.right, this);
		switch (node.operator.type) {
			case 'BANG':
				return !this.#isTruthy(right);
			case 'MINUS':
				this.#checkNumberOperand(node.operator, right);
				return -Number(right);
		}

		return null;
	}

	/** @param { Var } node */
	Var(node) {
		let value = null;
		if (node.initializer) {
			value = this.#visit(node.initializer, this);
		}

		this.#environment.define(node.name.lexeme, value);

		return null;
	}

	/** @param { Variable } node */
	Variable(node) {
		return this.#lookUpVariable(node.name, node);
	}

	/** @param { While } node */
	While(node) {
		while (this.#isTruthy(this.#visit(node.condition, this))) {
			this.#visit(node.body, this);
		}

		return null;
	}

	/**
	 * @param { Token } name 
	 * @param { ExpressionType } node 
	 */
	#lookUpVariable(name, node) {
		const distance = this.#locals.get(name);

		if (distance !== null) {
			return this.#environment.getAt(distance, name.lexeme);
		} else {
			return this.globals.get(name);
		}
	}

	/**
	 * @param { Token } operator 
	 * @param { any } operand 
	 */
	#checkNumberOperand(operator, operand) {
		if (typeof operand === 'number') return;

		throw new RuntimeError(operator, 'Operand must be a number.');
	}

	/**
	 * @param { Token } operator 
	 * @param { any } left 
	 * @param { any } right 
	 */
	#checkNumberOperands(operator, left, right) {
		if (typeof left === 'number' && typeof right === 'number') return;

		throw new RuntimeError(operator, 'Operands must be numbers.');
	}

	/** @param { any } value */
	#isTruthy(value) {
		if (value === null) return false;
		if (typeof value === 'boolean') return value;
		return true;
	}

	/** 
	 * @param { any } left 
	 * @param { any } right 
	 */
	#isEqual(left, right) {
		if (left === null && right === null) return true;
		if (left === null) return false;

		return left === right;
	}

	/**
	 * @param { ExpressionType | StatementType } element 
	 * @param { any } visitor
	 */
	#visit(element, visitor) {
		if (!element || !visitor[element.type]) throw new Error(`No visitor for element type: ${element.type}`);

		return visitor[element.type](element);
	}

	/**
	 * @param { StatementType[] } statements 
	 * @param { Environment } environment 
	 */
	visitBlock(statements, environment) {
		const previous = this.#environment;
		
		try {
			this.#environment = environment;

			for (const statement of statements) {
				this.#visit(statement, this);
			}
		} finally {
			this.#environment = previous;
		}
	}

	/**
	 * @param { ExpressionType } node 
	 * @param { number } depth 
	 */
	resolve(node, depth) {
		this.#locals.set(node, depth);
	}

	/** @param { any } value */
	#stringify(value) {
		if (value === null) return 'nil';

		if (typeof value === 'number') {
			let text = String(value);
			if (text.endsWith('.0')) {
				text = text.slice(0, -2);
			}

			return text;
		}
		
		return String(value);
	}
}

export class RuntimeError extends Error {
	/**
	 * @param { Token } token 
	 * @param { string } message 
	 */
	constructor(token, message) {
		super(message);
		this.token = token;
	}
}

//TODO: find source for RuntimeException? (not RuntimeError)
export class ReturnException extends Error {
	/** @type { any } */
	value;

	/** @param { any } value */
	constructor(value) {
		super();
		this.value = value
	}
}