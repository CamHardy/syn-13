import { System } from './system.js';

/** @import { Interpreter } from './interpreter.js'; */
/** @import { Token } from './token.js' */
/** @import * as Expression from './expression.js' */
/** @import { ExpressionType } from './expression.js' */
/** @import * as Statement from './statement.js' */
/** @import { StatementType } from './statement.js' */
/** @import { FunctionType } from './functionTypes.js' */
/** @import { ClassType } from './classTypes.js' */

export class Resolver {
	#interpreter;
	/** @type { Map<string, boolean>[] } */
	#scopes = [];
	/** @type { FunctionType } */
	#currentFunction = 'NONE';
	/** @type { ClassType } */
	#currentClass = 'NONE';

	/** @param { Interpreter } interpreter */
	constructor(interpreter) {
		this.#interpreter = interpreter;
	}

	/** @param { Expression.Assign } node */
	Assign(node) {
		this.#resolve(node.value);
		this.#resolveLocal(node, node.name);

		return null;
	}

	/** @param { Expression.Binary } node */
	Binary(node) {
		this.#resolve(node.left);
		this.#resolve(node.right);

		return null;
	}

	/** @param { Statement.Block } node */
	Block(node) {
		this.#beginScope();
		this.resolveBlock(node.statements);
		this.#endScope();

		return null;
	}

	/** @param { Expression.Call } node */
	Call(node) {
		this.#resolve(node.callee);

		for (const arg of node.args) {
			this.#resolve(arg);
		}

		return null;
	}

	/** @param { Statement.Class } node */
	Class(node) {
		const enclosingClass = this.#currentClass;
		this.#currentClass = 'CLASS';

		this.#declare(node.name);
		this.#define(node.name);

		if (node.superclass) {
			if (node.name.lexeme === node.superclass.name.lexeme) {
				System.error(node.superclass.name, 'A class can\'t inherit from itself.');
			}

			this.#currentClass = 'SUBCLASS';
			
			this.#resolve(node.superclass);
		}

		if (node.superclass) {
			this.#beginScope();
			this.#scopes[this.#scopes.length - 1].set('super', true);
		}

		this.#beginScope();
		this.#scopes[this.#scopes.length - 1].set('this', true);

		for (const method of node.methods) {
			/** @type { FunctionType } */
			let declaration = 'METHOD';

			if (method.name.lexeme === 'init') {
				declaration = 'INITIALIZER';
			}

			this.#resolveFunction(method, declaration);
		}

		this.#endScope();

		if (node.superclass) {
			this.#endScope();
		}

		this.#currentClass = enclosingClass;

		return null;
	}

	/** @param { Statement.Expression } node */
	Expression(node) {
		this.#resolve(node.expression);

		return null;
	}

	/** @param { Statement.Func } node */
	Function(node) {
		this.#declare(node.name);
		this.#define(node.name);

		this.#resolveFunction(node, 'FUNCTION');

		return null;
	}

	/** @param { Expression.Get } node */
	Get(node) {
		this.#resolve(node.object);

		return null;
	}

	/** @param { Expression.Grouping } node */
	Grouping(node) {
		this.#resolve(node.expression);

		return null;
	}

	/** @param { Statement.If } node */
	If(node) {
		this.#resolve(node.condition);
		this.#resolve(node.thenBranch);
		if (node.elseBranch) this.#resolve(node.elseBranch);

		return null;
	}

	/** @param { Expression.Literal } _node */
	Literal(_node) {
		return null;
	}

	/** @param { Expression.Logical } node */
	Logical(node) {
		this.#resolve(node.left);
		this.#resolve(node.right);

		return null;
	}

	/** @param { Statement.Print } node */
	Print(node) {
		this.#resolve(node.expression);

		return null;
	}

	/** @param { Statement.Return } node */
	Return(node) {
		if (this.#currentFunction === 'NONE') {
			System.error(node.keyword, 'Can\'t return from top-level code.');
		}

		if (node.value) {
			if (this.#currentFunction === 'INITIALIZER') {
				System.error(node.keyword, 'Can\'t return a value from an initializer.');
			}

			this.#resolve(node.value);
		}

		return null;
	}

	/** @param { Expression.Set } node */
	Set(node) {
		this.#resolve(node.value);
		this.#resolve(node.object);

		return null;
	}

	/** @param { Expression.Super } node */
	Super(node) {
		if (this.#currentClass === 'NONE') {
			System.error(node.keyword, "Can't use 'super' outside of a class.");
		} else if (this.#currentClass !== 'SUBCLASS') {
			System.error(node.keyword, "Can't use 'super' in a class with no superclass.");
		}
		this.#resolveLocal(node, node.keyword);

		return null;
	}

	/** @param { Expression.This } node */
	This(node) {
		if (this.#currentClass === 'NONE') {
			System.error(node.keyword, "Can't use 'this' outside of a class.");
		}

		this.#resolveLocal(node, node.keyword);

		return null;
	}

	/** @param { Expression.Unary } node */
	Unary(node) {
		this.#resolve(node.right);

		return null;
	}

	/** @param { Statement.Var } node */
	Var(node) {
		this.#declare(node.name);

		if (node.initializer) {
			this.#resolve(node.initializer);
		}

		this.#define(node.name);

		return null;
	}

	/** @param { Expression.Variable } node */
	Variable(node) {
		const length = this.#scopes.length;
		
		if (length !== 0 && this.#scopes[length - 1].get(node.name.lexeme) === false) {
			throw new Error("Can't read local variable in its own initializer.");
		}

		this.#resolveLocal(node, node.name);

		return null;
	}

	/** @param { Statement.While } node */
	While(node) {
		this.#resolve(node.condition);
		this.#resolve(node.body);

		return null;
	}

	/** 
	 * @param { Statement.Func } node 
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