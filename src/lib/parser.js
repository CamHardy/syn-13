import { System } from './system.js';
import { Expression } from './expression.js';
import { Statement } from './statement.js';

/** @import { Token } from './token.js' */
/** @import { TokenType } from './tokenTypes.js' */
/** @import { Variable, ExpressionType } from './expression.js' */
/** @import { StatementType } from './statement.js' */

export class Parser {
	#tokens;
	#current = 0;

	/** @param { Token[] } tokens */
	constructor(tokens) {
		this.#tokens = tokens;
	}

	/** @returns { (StatementType | null)[] } */
	parse() {
		/** @type { (StatementType | null)[] } */
		const statments = [];

		while (!this.#isAtEnd()) {
			statments.push(this.#declaration());
		}

		return statments;
	}

	/** @returns { ExpressionType } */
	#expression() {
		return this.#assignment();
	}

	/** @returns { StatementType } */
	#declaration() {
		try {
			if (this.#match('CLASS')) return this.#classDeclaration();
			if (this.#match('FUN')) return this.#functionDeclaration('function');
			if (this.#match('VAR')) return this.#varDeclaration();
			return this.#statement();
		} catch (error) {
			this.#synchronize();
			throw error;
		}
	}

	/** @returns { StatementType } */
	#statement() {
		if (this.#match('FOR')) return this.#forStatement();
		if (this.#match('IF')) return this.#ifStatement();
		if (this.#match('PRINT')) return this.#printStatement();
		if (this.#match('RETURN')) return this.#returnStatement();
		if (this.#match('WHILE')) return this.#whileStatement();
		if (this.#match('LEFT_BRACE')) return Statement.Block(this.#block());

		return this.#expressionStatement();
	}

	#classDeclaration() {
		const name = this.#consume('IDENTIFIER', 'Expected class name.');

		let superclass = null;
		if (this.#match('LESS')) {
			this.#consume('IDENTIFIER', 'Expected superclass name.');
			superclass = Expression.Variable(this.#previous());
		}

		this.#consume('LEFT_BRACE', 'Expected \'{\'.');
		const methods = [];
		while (!this.#check('RIGHT_BRACE') && !this.#isAtEnd()) {
			methods.push(this.#functionDeclaration('method'));
		}
		this.#consume('RIGHT_BRACE', 'Expected \'}\'.');
		
		return Statement.Class(name, /** @type { Variable } */ (superclass), methods);
	}

	/** @param { string } kind */
	#functionDeclaration(kind) {
		const name = this.#consume('IDENTIFIER', `Expected ${kind} name.`);
		this.#consume('LEFT_PAREN', `Expected '(' after ${kind} name.`);
		const params = [];
		if (!this.#check('RIGHT_PAREN')) {
			do {
				if (params.length >= 255) {
					this.#error(this.#peek(), 'Cannot have more than 255 parameters.');
				}
				params.push(this.#consume('IDENTIFIER', 'Expected parameter name.'));
			} while (this.#match('COMMA'));
		}
		this.#consume('RIGHT_PAREN', `Expected ')' after ${kind} parameters.`);
		this.#consume('LEFT_BRACE', `Expected '{' before ${kind} body.`);
		const body = this.#block();

		return Statement.Func(name, params, body);
	}

	#varDeclaration() {
		const name = this.#consume('IDENTIFIER', 'Expected variable name.');
	
		let initializer = null;
		if (this.#match('EQUAL')) {
			initializer = this.#expression();
		}
	
		this.#consume('SEMICOLON', 'Expected ; after variable declaration.');
		return Statement.Var(name, /** @type { ExpressionType } */ (initializer));
	}

	#forStatement() {
		this.#consume('LEFT_PAREN', 'Expected ( after for.');

		let initializer;
		if (this.#match('SEMICOLON')) {
			initializer = null;
		} else if (this.#match('VAR')) {
			initializer = this.#varDeclaration();
		} else {
			initializer = this.#expressionStatement();
		}

		let condition = null;
		if (!this.#check('SEMICOLON')) {
			condition = this.#expression();
		}
		this.#consume('SEMICOLON', 'Expected ; after loop condition.');

		let increment = null;
		if (!this.#check('RIGHT_PAREN')) {
			increment = this.#expression();
		}
		this.#consume('RIGHT_PAREN', 'Expected ) after for clauses.');

		let body = this.#statement();

		if (increment !== null) {
			body = Statement.Block([
				body,
				Statement.Expression(increment)
			]);
		}

		if (condition === null) condition = Expression.Literal(true);
		body = Statement.While(condition, body);

		if (initializer !== null) {
			body = Statement.Block([
				initializer,
				body
			]);
		}

		return body;
	}

	#ifStatement() {
		this.#consume('LEFT_PAREN', 'Expected ( after if.');
		const condition = this.#expression();
		this.#consume('RIGHT_PAREN', 'Expected ) after if condition.');

		const thenBranch = this.#statement();
		let elseBranch = null;
		if (this.#match('ELSE')) elseBranch = this.#statement();

		return Statement.If(condition, thenBranch, elseBranch);
	}

	#printStatement() {
		const value = this.#expression();
		this.#consume('SEMICOLON', 'Expected ; after value.');
		return Statement.Print(value);
	}

	#returnStatement() {
		const keyword = this.#previous();
		let value = null;

		if (!this.#check('SEMICOLON')) {
			value = this.#expression();
		}

		this.#consume('SEMICOLON', 'Expected ; after return value.');

		return Statement.Return(keyword, value);
	}

	#whileStatement() {
		this.#consume('LEFT_PAREN', 'Expected ( after while.');
		const condition = this.#expression();
		this.#consume('RIGHT_PAREN', 'Expected ) after while condition.');
		const body = this.#statement();

		return Statement.While(condition, body);
	}

	#expressionStatement() {
		const expression = this.#expression();
		this.#consume('SEMICOLON', 'Expected ; after expression.');
		return Statement.Expression(expression);
	}

	/** @returns { StatementType[] } */
	#block() {
		const statements = [];

		while (!this.#check('RIGHT_BRACE') && !this.#isAtEnd()) {
			statements.push(this.#declaration());
		}

		this.#consume('RIGHT_BRACE', 'Expected } after block.');

		return statements;
	}

	/** @returns { ExpressionType } */
	#assignment() {
		const expression = this.#or();

		if (this.#match('EQUAL')) {
			const equals = this.#previous();
			const value = this.#assignment();
			
			if (expression.type === 'Variable') {
				return Expression.Assign(expression.name, value);
			} else if (expression.type === 'Get') {
				return Expression.Set(expression.object, expression.name, value);
			}

			this.#error(equals, 'Invalid assignment target.');
		}

		return expression;
	}

	#or() {
		let expression = this.#and();

		while (this.#match('OR')) {
			const operator = this.#previous();
			const right = this.#and();
			expression = Expression.Logical(expression, operator, right);
		}

		return expression;
	}

	#and() {
		let expression = this.#equality();

		while (this.#match('AND')) {
			const operator = this.#previous();
			const right = this.#equality();
			expression = Expression.Logical(expression, operator, right);
		}

		return expression;
	}

	/** @returns { ExpressionType } */
	#equality() {
		let expression = this.#comparison();

		while (this.#match('BANG_EQUAL', 'EQUAL_EQUAL')) {
			const operator = this.#previous();
			const right = this.#comparison();
			expression = Expression.Binary(expression, operator, right);
		}

		return expression;
	}

	/** @returns { ExpressionType } */
	#comparison() {
		let expression = this.#term();

		while (this.#match('GREATER', 'GREATER_EQUAL', 'LESS', 'LESS_EQUAL')) {
			const operator = this.#previous();
			const right = this.#term();
			expression = Expression.Binary(expression, operator, right);
		}

		return expression;
	}

	/** @returns { ExpressionType } */
	#term() {
		let expression = this.#factor();

		while (this.#match('MINUS', 'PLUS')) {
			const operator = this.#previous();
			const right = this.#factor();
			expression = Expression.Binary(expression, operator, right);
		}

		return expression;
	}

	/** @returns { ExpressionType } */
	#factor() {
		let expression = this.#unary();

		while (this.#match('SLASH', 'STAR')) {
			const operator = this.#previous();
			const right = this.#unary();
			expression = Expression.Binary(expression, operator, right);
		}

		return expression;
	}

	/** @returns { ExpressionType } */
	#unary() {
		if (this.#match('BANG', 'MINUS')) {
			const operator = this.#previous();
			const right = this.#unary();
			return Expression.Unary(operator, right);
		}

		return this.#call();
	}

	#call() {
		let expression = this.#primary();

		while (true) {
			if (this.#match('LEFT_PAREN')) {
				expression = this.#finishCall(expression);
			} else if (this.#match('DOT')) {
				const name = this.#consume('IDENTIFIER', 'Expected property name after .');
				expression = Expression.Get(expression, name);
			} else {
				break;
			}
		}

		return expression;
	}

	/** @param { ExpressionType } callee */
	#finishCall(callee) {
		const args = [];

		if (!this.#check('RIGHT_PAREN')) {
			do {
				if (args.length >= 255) {
					this.#error(this.#peek(), "Can't have more than 255 arguments.");
				}
				args.push(this.#expression());
			} while (this.#match('COMMA'));
		}

		const paren = this.#consume('RIGHT_PAREN', 'Expected ) after arguments.');

		return Expression.Call(callee, paren, args);
	}

	/** @returns { ExpressionType } */
	#primary() {
		if (this.#match('FALSE')) return Expression.Literal(false);
		if (this.#match('TRUE')) return Expression.Literal(true);
		if (this.#match('NIL')) return Expression.Literal(null);

		if (this.#match('NUMBER', 'STRING')) {
			return Expression.Literal(this.#previous().literal);
		}

		if (this.#match('SUPER')) {
			const keyword = this.#previous();
			this.#consume('DOT', "Expected '.' after 'super'.");
			const method = this.#consume('IDENTIFIER', "Expected superclass method name.");
			
			return Expression.Super(keyword, method);
		}

		if (this.#match('THIS')) return Expression.This(this.#previous());

		if (this.#match('IDENTIFIER')) {
			return Expression.Variable(this.#previous());
		}

		if (this.#match('LEFT_PAREN')) {
			const expression = this.#expression();
			this.#consume('RIGHT_PAREN', "Expected ')' after expression.");
			return Expression.Grouping(expression);
		}

		throw this.#error(this.#peek(), 'Expected expression.');
	}

	/** @param { TokenType[] } types */
	#match(...types) {
		for (const type of types) {
			if (this.#check(type)) {
				this.#advance();
				return true;
			}
		}

		return false;
	}

	/** 
	 * @param { TokenType } type 
	 * @param { string } message 
	 */
	#consume(type, message) {
		if (!this.#check(type)) {
			throw this.#error(this.#peek(), message);
		}

		return this.#advance();
	}

	/** @param { TokenType } type */
	#check(type) {
		if (this.#isAtEnd()) return false;
		return this.#peek().type === type;
	}

	#advance() {
		if (!this.#isAtEnd()) this.#current++;
		return this.#previous();
	}

	#isAtEnd() {
		return this.#peek().type === 'EOF';
	}

	#peek() {
		return this.#tokens[this.#current];
	}

	#previous() {
		return this.#tokens[this.#current - 1];
	}

	/** 
	 * @param { Token } token 
	 * @param { string } message 
	 */
	#error(token, message) {
		System.error(token, message);
		return new Error();
	}

	#synchronize() {
		this.#advance();

		while (!this.#isAtEnd()) {
			if (this.#previous().type === 'SEMICOLON') return;

			switch (this.#peek().type) {
				case 'CLASS':
				case 'FUN':
				case 'VAR':
				case 'FOR':
				case 'IF':
				case 'WHILE':
				case 'PRINT':
				case 'RETURN':
					return;
			}

			this.#advance();
		}
	}
}