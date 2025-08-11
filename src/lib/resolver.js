import { Interpreter } from './interpreter.js';
import { Token } from './token.js';
import { System } from './system.js';
/** @import { Assign, Binary, Call, Grouping, Literal, Logical, Unary, Variable, ExpressionType } from './expression.js' */
/** @import { Block, Class, Expression, Func, If, Print, Return, Var, While, StatementType } from './statement.js' */
/** @import { FunctionType } from './functionTypes.js' */

export class Resolver {
	#interpreter;
	/** @type { Map<string, boolean>[] } */
	#scopes = [];
	/** @type { FunctionType } */
	#currentFunction = 'NONE';

	/** @param { Interpreter } interpreter */
	constructor(interpreter) {
		this.#interpreter = interpreter;
	}

	/** @param { Assign } node */
	Assign(node) {
		this.#resolve(node.value);
		this.#resolveLocal(node, node.name);

		return null;
	}

	/** @param { Binary } node */
	Binary(node) {
		this.#resolve(node.left);
		this.#resolve(node.right);

		return null;
	}

	/** @param { Block } node */
	Block(node) {
		this.#beginScope();
		this.resolveBlock(node.statements);
		this.#endScope();

		return null;
	}

	/** @param { Call } node */
	Call(node) {
		this.#resolve(node.callee);

		for (const arg of node.args) {
			this.#resolve(arg);
		}

		return null;
	}

	/** @param { Class } node */
	Class(node) {
		this.#declare(node.name);
		this.#define(node.name);

		return null;
	}

	/** @param { Expression } node */
	Expression(node) {
		this.#resolve(node.expression);

		return null;
	}

	/** @param { Func } node */
	Function(node) {
		this.#declare(node.name);
		this.#define(node.name);

		this.#resolveFunction(node, 'FUNCTION');

		return null;
	}

	/** @param { Grouping } node */
	Grouping(node) {
		this.#resolve(node.expression);

		return null;
	}

	/** @param { If } node */
	If(node) {
		this.#resolve(node.condition);
		this.#resolve(node.thenBranch);
		if (node.elseBranch) this.#resolve(node.elseBranch);

		return null;
	}

	/** @param { Literal } _node */
	Literal(_node) {
		return null;
	}

	/** @param { Logical } node */
	Logical(node) {
		this.#resolve(node.left);
		this.#resolve(node.right);

		return null;
	}

	/** @param { Print } node */
	Print(node) {
		this.#resolve(node.expression);

		return null;
	}

	/** @param { Return } node */
	Return(node) {
		if (this.#currentFunction === 'NONE') {
			System.error(node.keyword, 'Can\'t return from top-level code.');
		}

		if (node.value) this.#resolve(node.value);

		return null;
	}

	/** @param { Unary } node */
	Unary(node) {
		this.#resolve(node.right);

		return null;
	}

	/** @param { Var } node */
	Var(node) {
		this.#declare(node.name);

		if (node.initializer) {
			this.#resolve(node.initializer);
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
		this.#resolve(node.condition);
		this.#resolve(node.body);

		return null;
	}

	/** 
	 * @param { Func } node 
	 * @param { FunctionType } type
	 */
	#resolveFunction(node, type) {
		const enclosingFunction = this.#currentFunction;
		this.#currentFunction = type;

		this.#beginScope();

		for (const param of node.params) {
			this.#declare(param);
			this.#define(param);
		}

		this.resolveBlock(node.body);
		this.#endScope();

		this.#currentFunction = enclosingFunction;
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

		if (scope.has(name.lexeme)) {
			System.error(name, 'Already a variable with this name in this scope.');
		}

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
	 * @param { any } [visitor]
	 */
	#resolve(element, visitor = this) {
		if (!element || !visitor[element.type]) throw new Error(`No visitor for element type: ${element.type}`);

		return visitor[element.type](element);
	}

	/** 
	 * @param { StatementType[] } statements 
	 */
	resolveBlock(statements) {
		for (const statement of statements) {
			this.#resolve(statement);
		}
	}
}