export class Scanner {
	start;
	current;
	line;

	/** @param { string } source */
	constructor(source) {
		this.start = source[0];
		this.current = source[0];
		this.line = 1;
	}
}