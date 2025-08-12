/** @import { Token } from './token.js' */

/** @typedef { Assign | Binary | Call | Get | Grouping | Literal | Logical | Set | This | Unary | Variable } ExpressionType */

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
 * @typedef { Object } Call
 * @property { 'Call' } type
 * @property { ExpressionType } callee
 * @property { Token } paren
 * @property { ExpressionType[] } args
 */

/** 
 * @typedef { Object } Get
 * @property { 'Get' } type
 * @property { ExpressionType } object
 * @property { Token } name
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
 * @typedef { Object } Logical
 * @property { 'Logical' } type
 * @property { ExpressionType } left
 * @property { Token } operator
 * @property { ExpressionType } right
 */

/** 
 * @typedef { Object } Set
 * @property { 'Set' } type
 * @property { ExpressionType } object
 * @property { Token } name
 * @property { ExpressionType } value
 */

/** 
 * @typedef { Object } This
 * @property { 'This' } type
 * @property { Token } keyword
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
	 * @param { ExpressionType } callee 
	 * @param { Token } paren 
	 * @param { ExpressionType[] } args 
	 * @returns { Call }
	 */
	static Call(callee, paren, args) {
		return {
			type: 'Call',
			callee,
			paren,
			args
		};
	}

	/**
	 * @param { ExpressionType } object 
	 * @param { Token } name 
	 * @returns { Get }
	 */
	static Get(object, name) {
		return {
			type: 'Get',
			object,
			name
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
	 * @param { ExpressionType } left 
	 * @param { Token } operator 
	 * @param { ExpressionType } right 
	 * @returns { Logical }
	 */
	static Logical(left, operator, right) {
		return {
			type: 'Logical',
			left,
			operator,
			right
		};
	}

	/**
	 * @param { ExpressionType } object 
	 * @param { Token } name 
	 * @param { ExpressionType } value 
	 * @returns { Set }
	 */
	static Set(object, name, value) {
		return {
			type: 'Set',
			object,
			name,
			value
		};
	}

	/** 
	 * @param { Token } keyword 
	 * @returns { This }
	 */
	static This(keyword) {
		return {
			type: 'This',
			keyword
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