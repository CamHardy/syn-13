import { Scanner } from './scanner.js';
import { AstPrinter } from './astPrinter.js';
import { Expression } from './expression.js';
import { Token } from './token.js';

/** @import { ExpressionType } from './expression.js' } */

let hadError = false;

/** @param { string } source */
function run(source) {
	const scanner = new Scanner(source);
	const tokens = scanner.scanTokens();

	const expression = Expression.Binary(
		Expression.Unary(
			new Token('MINUS', '-', null, 1),
			Expression.Literal(123)),
		new Token('STAR', '*', null, 1),
		Expression.Grouping(
			Expression.Literal(45.67)
		)
	);

	// for now just print the tokens
	console.log(tokens);
	console.log(AstPrinter.print(expression));
}

/**
 * @param { number } line 
 * @param { string } message 
 */
function error(line, message) {
	report(line, '', message);
}

/**
 * @param { number } line 
 * @param { string } where 
 * @param { string } message 
 */
function report(line, where, message) {
	console.error(`[line ${line}] Error${where}: ${message}`);
	hadError = true;
}

//TODO: run actual code
//TODO: handle errors
run('-123 * (45.67)');

if (hadError) {
	//TODO: exit process gracefully
	console.error('I had an error :(');
}