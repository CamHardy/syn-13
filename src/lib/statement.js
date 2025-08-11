/** @import { ExpressionType } from './expression.js' */
/** @import { Token } from './token.js' */

/** @typedef { Block | Class |Expression | Func | If | Print | Return | Var | While } StatementType */

/**
 * @typedef { Object } Block
 * @property { 'Block' } type
 * @property { StatementType[] } statements
 */

/**
 * @typedef { Object } Class
 * @property { 'Class' } type
 * @property { Token } name
 * @property { Func[] } methods
 */

/**
 * @typedef { Object } Expression
 * @property { 'Expression' } type
 * @property { ExpressionType } expression
 */

/**
 * @typedef { Object } Func
 * @property { 'Function' } type
 * @property { Token } name
 * @property { Token[] } params
 * @property { StatementType[] } body
 */

/**
 * @typedef { Object } If
 * @property { 'If' } type
 * @property { ExpressionType } condition
 * @property { StatementType } thenBranch
 * @property { StatementType | null } elseBranch
 */

/**
 * @typedef { Object } Print
 * @property { 'Print' } type
 * @property { ExpressionType } expression
 */

/**
 * @typedef { Object } Return
 * @property { 'Return' } type
 * @property { Token } keyword
 * @property { ExpressionType | null } value
 */

/**
 * @typedef { Object } Var
 * @property { 'Var' } type
 * @property { Token } name
 * @property { ExpressionType } initializer
 */

/**
 * @typedef { Object } While
 * @property { 'While' } type
 * @property { ExpressionType } condition
 * @property { StatementType } body
 */

export class Statement {
	/**
	 * @param { StatementType[] } statements 
	 * @returns { Block }
	 */
	static Block(statements) {
		return {
			type: 'Block',
			statements
		}
	}

	/** 
	 * @param { Token } name 
	 * @param { Func[] } methods 
	 * @returns { Class }
	 */
	static Class(name, methods) {
		return {
			type: 'Class',
			name,
			methods
		}
	}

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
	 * @param { Token } name 
	 * @param { Token[] } params 
	 * @param { StatementType[] } body 
	 * @returns { Func }
	*/
	static Func(name, params, body) {
		return {
			type: 'Function',
			name,
			params,
			body
		}
	}

	/**
	 * @param { ExpressionType } condition 
	 * @param { StatementType } thenBranch 
	 * @param { StatementType  | null } elseBranch 
	 * @returns { If }
	*/
	static If(condition, thenBranch, elseBranch) {
		return {
			type: 'If',
			condition,
			thenBranch,
			elseBranch
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
	 * @param { Token } keyword
	 * @param { ExpressionType | null } value 
	 * @returns { Return }
	 */
	static Return(keyword, value) {
		return {
			type: 'Return',
			keyword,
			value
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

	/** 
	 * @param { ExpressionType } condition 
	 * @param { StatementType } body 
	 * @returns { While }
	*/
	static While(condition, body) {
		return {
			type: 'While',
			condition,
			body
		}
	}
}