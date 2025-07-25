import { Scanner } from './scanner.js';

let hadError = false;

/** @param { string } source */
function run(source) {
	const scanner = new Scanner(source);
	const tokens = scanner.scanTokens();

	// for now just print the tokens
	console.log(tokens);
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
run('hello world');

if (hadError) {
	//TODO: exit process gracefully
	console.error('I had an error :(');
}