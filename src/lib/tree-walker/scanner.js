import { System } from './system.js';
import { Token } from './token.js';

/** @import { TokenType } from './tokenTypes.js' */

export class Scanner {
	#source;
	/** @type { Token[] } */
	#tokens = [];
	#start = 0;
	#current = 0;
	#line = 1;

	/** @type { Map<string, TokenType> } */
	static #keywords;

	static {
		this.#keywords = new Map();
		this.#keywords.set('and', 'AND');
		this.#keywords.set('class', 'CLASS');
		this.#keywords.set('else', 'ELSE');
		this.#keywords.set('false', 'FALSE');
		this.#keywords.set('for', 'FOR');
		this.#keywords.set('fun', 'FUN');
		this.#keywords.set('if', 'IF');
		this.#keywords.set('nil', 'NIL');
		this.#keywords.set('or', 'OR');
		this.#keywords.set('print', 'PRINT');
		this.#keywords.set('return', 'RETURN');
		this.#keywords.set('super', 'SUPER');
		this.#keywords.set('this', 'THIS');
		this.#keywords.set('true', 'TRUE');
		this.#keywords.set('var', 'VAR');
		this.#keywords.set('while', 'WHILE');
	}

	/** @param { string } source */
	constructor(source) {
		this.#source = source;
	}

	scanTokens() {
		while (!this.#isAtEnd()) {
			this.#start = this.#current;
			this.#scanToken();
		}

		this.#tokens.push(new Token('EOF', '', null, this.#line));

		return this.#tokens;
	}

	#scanToken() {
		const c = this.#advance();
		switch (c) {
			case '(': this.#addToken('LEFT_PAREN'); break;
			case ')': this.#addToken('RIGHT_PAREN'); break;
			case '{': this.#addToken('LEFT_BRACE'); break;
			case '}': this.#addToken('RIGHT_BRACE'); break;
			case ',': this.#addToken('COMMA'); break;
			case '.': this.#addToken('DOT'); break;
			case '-': this.#addToken('MINUS'); break;
			case '+': this.#addToken('PLUS'); break;
			case ';': this.#addToken('SEMICOLON'); break;
			case '*': this.#addToken('STAR'); break;
			case '!': 
				this.#addToken(this.#match('=') ? 'BANG_EQUAL' : 'BANG'); 
				break;
			case '=': 
				this.#addToken(this.#match('=') ? 'EQUAL_EQUAL' : 'EQUAL'); 
				break;
			case '<': 
				this.#addToken(this.#match('=') ? 'LESS_EQUAL' : 'LESS'); 
				break;
			case '>': 
				this.#addToken(this.#match('=') ? 'GREATER_EQUAL' : 'GREATER'); 
				break;
			case '/':
				if (this.#match('/')) {
					// comments go until the end of the line
					while (this.#peek() !== '\n' && !this.#isAtEnd()) this.#advance();
				} else {
					this.#addToken('SLASH');
				}
				break;
			case ' ':
			case '\r':
			case '\t':
				// ignore whitespace
				break;
			case '\n':
				this.#line++;
				break;
			case '"':
				this.#string();
				break;
			default:
				if (this.#isDigit(c)) {
					this.#number();
				} else if (this.#isAlpha(c)) {
					this.#identifier();
				} else {
					System.error(this.#line, 'Unexpected character.');
				}
				break;
		}
	}

	#identifier() {
		while (this.#isAlphaNumeric(this.#peek())) this.#advance();

		const text = this.#source.substring(this.#start, this.#current);
		const type = Scanner.#keywords.get(text) ?? 'IDENTIFIER';

		this.#addToken(type);
	}

	#number() {
		while (this.#isDigit(this.#peek())) this.#advance();

		// look for a fractional part
		if (this.#peek() === '.' && this.#isDigit(this.#peekNext())) {
			// consume the "."
			this.#advance();

			while (this.#isDigit(this.#peek())) this.#advance();
		}

		this.#addToken('NUMBER', parseFloat(this.#source.substring(this.#start, this.#current)));
	}

	#string() {
		while (this.#peek() !== '"' && !this.#isAtEnd()) {
			if (this.#peek() === '\n') this.#line++;
			this.#advance();
		}

		if (this.#isAtEnd()) {
			System.error(this.#line, 'Unterminated string.');
			return;
		}

		// the closing "
		this.#advance();

		// trim the surrounding quotes
		const value = this.#source.substring(this.#start + 1, this.#current - 1);
		this.#addToken('STRING', value);
	}

	/** @param { string } expected */
	#match(expected) {
		if (this.#isAtEnd()) return false;
		if (this.#source.charAt(this.#current) !== expected) return false;
		
		this.#current++;

		return true;
	}

	#peek() {
		if (this.#isAtEnd()) return '\0';

		return this.#source.charAt(this.#current);
	}

	#peekNext() {
		if (this.#current + 1 >= this.#source.length) return '\0';

		return this.#source.charAt(this.#current + 1);
	}

	/** @param { string } c */
	#isAlpha(c) {
		return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
	}

	/** @param { string } c */
	#isAlphaNumeric(c) {
		return this.#isAlpha(c) || this.#isDigit(c);
	}

	/** @param { string } c */
	#isDigit(c) {
		return c >= '0' && c <= '9';
	}

	#isAtEnd() {
		return this.#current >= this.#source.length;
	}

	#advance() {
		this.#current++;

		return this.#source.charAt(this.#current - 1);
	}

	/** 
	 * @param { TokenType } type 
	 * @param { number | string | null } literal
	 */
	#addToken(type, literal = null) {
		const text = this.#source.substring(this.#start, this.#current);
		this.#tokens.push(new Token(type, text, literal, this.#line));
	}
}