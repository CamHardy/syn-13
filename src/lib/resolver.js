import { Interpreter } from './interpreter.js';
import { Token } from './token.js';
/** @import { Assign, Binary, Call, Grouping, Literal, Logical, Unary, Variable, ExpressionType } from './expression.js' */
/** @import { Block, Expression, Func, If, Print, Return, Var, While, StatementType } from './statement.js' */

export class Resolver {
	#interpreter;
	/** @type { Map<string, boolean>[] } */
	#scopes = [];

	/** @param { Interpreter } interpreter */
	constructor(interpreter) {
		this.#interpreter = interpreter;
	}

	/** @param { Assign } node */
	Assign(node) {
		this.#resolve(node.value, this);
		this.#resolveLocal(node, node.name);

		return null;
	}

	/** @param { Binary } node */
	Binary(node) {
		this.#resolve(node.left, this);
		this.#resolve(node.right, this);

		return null;
	}

	/** @param { Block } node */
	Block(node) {
		this.#beginScope();
		this.resolveBlock(node.statements, this);
		this.#endScope();

		return null;
	}

	/** @param { Call } node */
	Call(node) {
		this.#resolve(node.callee, this);

		for (const arg of node.args) {
			this.#resolve(arg, this);
		}

		return null;
	}

	/** @param { Expression } node */
	Expression(node) {
		this.#resolve(node.expression, this);

		return null;
	}

	/** @param { Func } node */
	Function(node) {
		this.#declare(node.name);
		this.#define(node.name);

		this.#resolveFunction(node);

		return null;
	}

	/** @param { Grouping } node */
	Grouping(node) {
		this.#resolve(node.expression, this);

		return null;
	}

	/** @param { If } node */
	If(node) {
		this.#resolve(node.condition, this);
		this.#resolve(node.thenBranch, this);
		if (node.elseBranch) this.#resolve(node.elseBranch, this);

		return null;
	}

	/** @param { Literal } _node */
	Literal(_node) {
		return null;
	}

	/** @param { Logical } node */
	Logical(node) {
		this.#resolve(node.left, this);
		this.#resolve(node.right, this);

		return null;
	}

	/** @param { Print } node */
	Print(node) {
		this.#resolve(node.expression, this);

		return null;
	}

	/** @param { Return } node */
	Return(node) {
		if (node.value) this.#resolve(node.value, this);

		return null;
	}

	/** @param { Unary } node */
	Unary(node) {
		this.#resolve(node.right, this);

		return null;
	}

	/** @param { Var } node */
	Var(node) {
		this.#declare(node.name);

		if (node.initializer) {
			this.#resolve(node.initializer, this);
		}

		this.#define(node.name);

		return null;
	}

	/** @param { Variable } node */
	Variable(node) {
		const length = this.#scopes.length;
		
		if (length !== 0 && this.#scopes[length - 1].get(node.name.lexeme) === false) {
			throw new Error('Can\'t read local variable in its own initializer.');
		}

		this.#resolveLocal(node, node.name);

		return null;
	}

	/** @param { While } node */
	While(node) {
		this.#resolve(node.condition, this);
		this.#resolve(node.body, this);

		return null;
	}

	/** @param { Func } node */
	#resolveFunction(node) {
		this.#beginScope();

		for (const param of node.params) {
			this.#declare(param);
			this.#define(param);
		}

		this.resolveBlock(node.body, this);
		this.#endScope();
	}
		
	/** 
	 * @param { ExpressionType } node 
	 * @param { Token } name
	 */
	#resolveLocal(node, name) {
		for (let i = this.#scopes.length - 1; i >= 0; i--) {
			if (this.#scopes[i].has(name.lexeme)) {
				this.#interpreter.resolve(node, this.#scopes.length - 1 - i);
				return;
			}
		}
	}

	#beginScope() {
		this.#scopes.push(new Map());
	}

	#endScope() {
		this.#scopes.pop();
	}

	/** @param { Token } name */
	#declare(name) {
		if (this.#scopes.length === 0) return;

		const scope = this.#scopes[this.#scopes.length - 1];
		scope.set(name.lexeme, false);
	}

	/** @param { Token } name */
	#define(name) {
		if (this.#scopes.length === 0) return;

		const scope = this.#scopes[this.#scopes.length - 1];
		scope.set(name.lexeme, true);
	}

	/**
	 * @param { ExpressionType | StatementType } element 
	 * @param { any } visitor
	 */
	#resolve(element) {
		if (!element || !this[element.type]) throw new Error(`No visitor for element type: ${element.type}`);

		return this[element.type](element);
	}

	/** 
	 * @param { StatementType[] } statements 
	 * @param { any } visitor 
	 */
	resolveBlock(statements) {
		for (const statement of statements) {
			this.#resolve(statement);
		}
	}
}