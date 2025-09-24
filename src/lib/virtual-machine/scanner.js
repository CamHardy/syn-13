/** @typedef { 'TOKEN_LEFT_PAREN' | 'TOKEN_RIGHT_PAREN' | 'TOKEN_LEFT_BRACE' | 'TOKEN_RIGHT_BRACE' | 'TOKEN_COMMA' | 'TOKEN_DOT' | 'TOKEN_MINUS' | 'TOKEN_PLUS' | 'TOKEN_SEMICOLON' | 'TOKEN_SLASH' | 'TOKEN_STAR' | 'TOKEN_BANG' | 'TOKEN_BANG_EQUAL' | 'TOKEN_EQUAL' | 'TOKEN_EQUAL_EQUAL' | 'TOKEN_GREATER' | 'TOKEN_GREATER_EQUAL' | 'TOKEN_LESS' | 'TOKEN_LESS_EQUAL' | 'TOKEN_IDENTIFIER' | 'TOKEN_STRING' | 'TOKEN_NUMBER' | 'TOKEN_AND' | 'TOKEN_CLASS' | 'TOKEN_ELSE' | 'TOKEN_FALSE' | 'TOKEN_FOR' | 'TOKEN_FUN' | 'TOKEN_IF' | 'TOKEN_NIL' | 'TOKEN_OR' | 'TOKEN_PRINT' | 'TOKEN_RETURN' | 'TOKEN_SUPER' | 'TOKEN_THIS' | 'TOKEN_TRUE' | 'TOKEN_VAR' | 'TOKEN_WHILE' | 'TOKEN_ERROR' | 'TOKEN_EOF'} TokenType */

/** 
 * @typedef { Object } Token
 * @property { TokenType } type
 * @property { number } start
 * @property { number } length
 * @property { number } line
 */

export class Scanner {
	start;
	current;
	source
	line;

	/** @param { string } source */
	constructor(source) {
		this.start = 0;
		this.current = 0;
		this.source = source;
		this.line = 1;
	}

	scanToken() {
		this.start = this.current;

		if (this.isAtEnd()) {
			return this.makeToken('TOKEN_EOF');
		}

		return this.errorToken('Unexpected character.');
	}

	isAtEnd() {
		return this.current === this.source.length;
	}

	/** @param { TokenType } type */
	makeToken(type) {
		/** @type { Token } */
		let token = {
			type,
			start: this.start,
			length: this.current - this.start,
			line: this.line
		};
	}

	/** @param { string } message */
	errorToken(message) {
		let token = {
			type: 'TOKEN_ERROR',
			start: 0,
			length: message.length,
			line: this.line
		};

		return token;
	}
}