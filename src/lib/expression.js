/** @import { Token } from './token.js' */

/** @typedef { Binary | Grouping | Literal | Unary } ExpressionType */

/** 
 * @typedef { Object } Binary
 * @property { 'Binary' } type
 * @property { ExpressionType } left
 * @property { Token } operator
 * @property { ExpressionType } right
 */

/** 
 * @typedef { Object } Grouping
 * @property { 'Grouping' } type
 * @property { ExpressionType } expression
 */

/** 
 * @typedef { Object } Literal
 * @property { 'Literal' } type
 * @property { any } value
 */

/** 
 * @typedef { Object } Unary
 * @property { 'Unary' } type
 * @property { Token } operator
 * @property { ExpressionType } right
 */

export class Expression {
	/**
	 * @param { ExpressionType } left 
	 * @param { Token } operator 
	 * @param { ExpressionType } right 
	 * @returns { Binary }
	 */
	static Binary(left, operator, right) {
		return {
			type: 'Binary',
			left,
			operator,
			right
		};
	}

	/**
	 * @param { ExpressionType } expression 
	 * @returns { Grouping }
	 */
	static Grouping(expression) {
		return {
			type: 'Grouping',
			expression
		};
	}

	/**
	 * @param { any } value 
	 * @returns { Literal }
	 */
	static Literal(value) {
		return {
			type: 'Literal',
			value
		};
	}

	/**
	 * @param { Token } operator 
	 * @param { ExpressionType } right 
	 * @returns { Unary }
	 */
	static Unary(operator, right) {
		return {
			type: 'Unary',
			operator,
			right
		};
	}
}