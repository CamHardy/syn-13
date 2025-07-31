import { System } from './system.js';
import { Token } from './token.js';
import { Expression } from './expression.js';
import { Statement } from './statement.js';

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

	#declaration() {
		try {
			if (this.#match('VAR')) return this.#varDeclaration();
			return this.#statement();
		} catch (error) {
			this.#synchronize();
			return null;
		}
	}

	#statement() {
		if (this.#match('PRINT')) return this.#printStatement();

		return this.#expressionStatement();
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

	#printStatement() {
		const value = this.#expression();
		this.#consume('SEMICOLON', 'Expected ; after value.');
		return Statement.Print(value);
	}

	#expressionStatement() {
		const expression = this.#expression();
		this.#consume('SEMICOLON', 'Expected ; after expression.');
		return Statement.Expression(expression);
	}

	/** @returns { ExpressionType } */
	#assignment() {
		const expression = this.#equality();

		if (this.#match('EQUAL')) {
			const equals = this.#previous();
			const value = this.#assignment();

			if (expression instanceof Expression.Variable) {
				const name = /** @type { Variable } */ (expression).name;
				return Expression.Assign(name, value);
			}

			this.#error(equals, 'Invalid assignment target.');
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

		return this.#primary();
	}

	/** @returns { ExpressionType } */
	#primary() {
		if (this.#match('FALSE')) return Expression.Literal(false);
		if (this.#match('TRUE')) return Expression.Literal(true);
		if (this.#match('NIL')) return Expression.Literal(null);

		if (this.#match('NUMBER', 'STRING')) {
			return Expression.Literal(this.#previous().literal);
		}

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