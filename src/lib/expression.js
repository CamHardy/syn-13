/** @import { Token } from './token.js' */

/** @typedef { Assign |Binary | Grouping | Literal | Unary | Variable } ExpressionType */

/** 
 * @typedef { Object } Assign
 * @property { 'Assign' } type
 * @property { Token } name
 * @property { ExpressionType } value
 */

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

/** 
 * @typedef { Object } Variable
 * @property { 'Variable' } type
 * @property { Token } name
 */

export class Expression {
	/** 
	 * @param { Token } name 
	 * @param { ExpressionType } value 
	 * @returns { Assign }
	 */
	static Assign(name, value) {
		return {
			type: 'Assign',
			name,
			value
		};
	}
	
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

	/** 
	 * @param { Token } name 
	 * @returns { Variable }
	*/
	static Variable(name) {
		return {
			type: 'Variable',
			name
		}
	}
}