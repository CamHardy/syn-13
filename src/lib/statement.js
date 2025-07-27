/** @import { ExpressionType } from './expression.js' */

/** @typedef { Expression | Print } StatementType */

/**
 * @typedef { Object } Expression
 * @property { 'Expression' } type
 * @property { ExpressionType } expression
 */

/**
 * @typedef { Object } Print
 * @property { 'Print' } type
 * @property { ExpressionType } expression
 */

export class Statement {
	/** 
	 * @param { ExpressionType } expression 
	 * @returns { Expression }
	 */
	static Expression(expression) {
		return {
			type: 'Expression',
			expression
		}
	}

	/** 
	 * @param { ExpressionType } expression 
	 * @returns { Print }
	*/
	static Print(expression) {
		return {
			type: 'Print',
			expression
		}
	}
}