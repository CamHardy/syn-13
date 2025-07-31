import { System } from './system.js';
import { Environment } from './environment.js';

/** @import { Token } from './token.js' */
/** @import { Literal, Grouping, Unary, Binary, Variable, Assign, ExpressionType } from './expression.js' */
/** @import { Expression, Print, Var, StatementType } from './statement.js' */

export class Interpreter {
	#environment = new Environment();

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
	/** @param { Literal } node */
	Literal(node) {
		return node.value;
	}

	/** @param { Grouping } node */
	Grouping(node) {
		return this.#visit(node.expression, this);
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


	/** @param { Expression } node */
	Expression(node) {
		this.#visit(node.expression, this);

		return null;
	}

	/** @param { Print } node */
	Print(node) {
		const value = this.#visit(node.expression, this);
		console.log(this.#stringify(value));

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
		return this.#environment.get(node.name);
	}

	/** @param { Assign } node */
	Assign(node) {
		const value = this.#visit(node.value, this);
		this.#environment.assign(node.name, value);

		return value;
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
	 * @param {*} visitor
	 */
	#visit(element, visitor) {
		if (!element || !visitor[element.type]) throw new Error(`No visitor for element type: ${element.type}`);

		return visitor[element.type](element);
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