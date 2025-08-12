/** 
 * @import * as Expression from './expression.js' 
 * @import { ExpressionType } from './expression.js'
 */


export class AstPrinter {
	/** @param { Expression.Binary } node */
	static Binary(node) {
		return `(${node.operator.lexeme} ${this.#visit(node.left, AstPrinter)} ${this.#visit(node.right, AstPrinter)})`;
	}

	/** @param { Expression.Grouping } node */
	static Grouping(node) {
		return `(group ${this.#visit(node.expression, AstPrinter)})`;
	}

	/** @param { Expression.Literal } node */
	static Literal(node) {
		return node.value === null ? 'nil' : String(node.value);
	}

	/** @param { Expression.Unary } node */
	static Unary(node) {
		return `(${node.operator.lexeme} ${this.#visit(node.right, AstPrinter)})`;
	}

	/**
	 * @param { ExpressionType } node 
	 * @param { any } visitor
	 */
	static #visit(node, visitor) {
		if (!node || !visitor[node.type]) throw new Error(`No visitor for node type: ${node.type}`);

		return visitor[node.type](node);
	}

	/** @param { ExpressionType } expression */
	static print(expression) {
		return this.#visit(expression, AstPrinter);
	}
}