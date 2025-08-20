/** @import { TokenType } from './tokenTypes.js'} */

export class Token {
	/** 
	 * @param { TokenType } type
	 * @param { string } lexeme
	 * @param { any } literal
	 * @param { number } line
	 */
	constructor(type, lexeme, literal, line) {
		this.type = type;
		this.lexeme = lexeme;
		this.literal = literal;
		this.line = line;
	}

	toString() {
		return `${this.type} ${this.lexeme} ${this.literal}`;
	}
}