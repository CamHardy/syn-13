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
		this.skipWhitespace();

		this.start = this.current;

		if (this.isAtEnd()) {
			return this.makeToken('TOKEN_EOF');
		}

		const c = this.advance();
		if (this.isDigit(c)) return this.number();

		switch(c) {
			case '(': return this.makeToken('TOKEN_LEFT_PAREN');
			case ')': return this.makeToken('TOKEN_RIGHT_PAREN');
			case '{': return this.makeToken('TOKEN_LEFT_BRACE');
			case '}': return this.makeToken('TOKEN_RIGHT_BRACE');
			case ';': return this.makeToken('TOKEN_SEMICOLON');
			case ',': return this.makeToken('TOKEN_COMMA');
			case '.': return this.makeToken('TOKEN_DOT');
			case '-': return this.makeToken('TOKEN_MINUS');
			case '+': return this.makeToken('TOKEN_PLUS');
			case '/': return this.makeToken('TOKEN_SLASH');
			case '*': return this.makeToken('TOKEN_STAR');
			case '!': return this.makeToken(this.match('=') ? 'TOKEN_BANG_EQUAL' : 'TOKEN_BANG');
			case '=': return this.makeToken(this.match('=') ? 'TOKEN_EQUAL_EQUAL' : 'TOKEN_EQUAL');
			case '<': return this.makeToken(this.match('=') ? 'TOKEN_LESS_EQUAL' : 'TOKEN_LESS');
			case '>': return this.makeToken(this.match('=') ? 'TOKEN_GREATER_EQUAL' : 'TOKEN_GREATER');
			case '"': return this.string();
		}

		return this.errorToken('Unexpected character.');
	}

	isAtEnd() {
		return this.current === this.source.length;
	}

	/** @param { string } c */
	isDigit(c) {
		return c >= '0' && c <= '9';
	}

	advance() {
		this.current++;
		return this.source.charAt(this.current - 1);
	}

	peek() {
		return this.source.charAt(this.current);
	}

	peekNext() {
		if (this.isAtEnd()) return '\0';
		return this.source.charAt(this.current + 1);
	}

	/** @param { string } expected */
	match(expected) {
		if (this.isAtEnd()) return false;
		if (this.source.charAt(this.current) !== expected) return false;
		this.current++;

		return true;
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

		return token;
	}

	/** @param { string } message */
	errorToken(message) {
		/** @type { Token } */
		let token = {
			type: 'TOKEN_ERROR',
			start: 0,
			length: message.length,
			line: this.line
		};

		return token;
	}

	skipWhitespace() {
		for (;;) {
			switch(this.peek()) {
				case ' ':
				case '\r':
				case '\t':
					this.advance();
					break;
				case '\n':
					this.line++;
					this.advance();
					break;
				case '/':
					if (this.peekNext() === '/') {
						while (this.peek() !== '\n' && !this.isAtEnd()) this.advance();
					} else {
						return;
					}
					break;
				default:
					return;
			}
		}
	}

	number() {
		while (this.isDigit(this.peek())) this.advance();

		if (this.peek() === '.' && this.isDigit(this.peekNext())) {
			this.advance();

			while (this.isDigit(this.peek())) this.advance();
		}

		return this.makeToken('TOKEN_NUMBER');
	}

	string() {
		while (this.peek() !== '"' && !this.isAtEnd()) {
			if (this.peek() === '\n') this.line++;
			this.advance();
		}

		if (this.isAtEnd()) return this.errorToken('Unterminated string.');
		this.advance();

		return this.makeToken('TOKEN_STRING');
	}
}