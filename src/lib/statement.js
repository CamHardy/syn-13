/** @import { ExpressionType } from './expression.js' */
/** @import { Token } from './token.js' */

/** @typedef { Expression | Print | Var } StatementType */

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

/**
 * @typedef { Object } Var
 * @property { 'Var' } type
 * @property { Token } name
 * @property { ExpressionType } initializer
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

	/** 
	 * @param { Token } name 
	 * @param { ExpressionType } initializer 
	 * @returns { Var }
	*/
	static Var(name, initializer) {
		return {
			type: 'Var',
			name,
			initializer
		}
	}
}