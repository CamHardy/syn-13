import { Scanner } from './scanner.js';
import { OpCode } from './chunk.js';
import { disassembleChunk } from './debug.js';
import { DEBUG_PRINT_CODE } from './common.js';
import { NUMBER_VAL, OBJ_VAL } from './value.js';
import { copyString, newFunction } from './object.js';
/** @import { Chunk } from './chunk.js' */
/** @import { Token, TokenType } from './scanner.js' */
/** @import { Value } from "./value.js" */
/** @import { ObjFunction } from "./object.js" */

/**
 * @typedef { Object } Parser
 * @property { Token } current
 * @property { Token } previous
 * @property { boolean } hadError
 * @property { boolean } panicMode
 */

/** @enum { number } */
const Precedence = Object.freeze({
	PREC_NONE: 0,
	PREC_ASSIGNMENT: 1,
	PREC_OR: 2,
	PREC_AND: 3,
	PREC_EQUALITY: 4,
	PREC_COMPARISON: 5,
	PREC_TERM: 6,
	PREC_FACTOR: 7,
	PREC_UNARY: 8,
	PREC_CALL: 9,
	PREC_PRIMARY: 10
});

/** @typedef { ((canAssign: boolean) => void) | null } ParseFn } */

/**
 * @typedef { Object } ParseRule
 * @property { ParseFn } prefix
 * @property { ParseFn } infix
 * @property { Precedence } precedence
 */

/**
 * @typedef { Object } Local
 * @property { string } name
 * @property { number } depth
 * @property { boolean } isCaptured
 */

/**
 * @typedef { Object } Upvalue
 * @property { number } index
 * @property { boolean } isLocal
 */

/** @typedef { 'TYPE_FUNCTION' | 'TYPE_SCRIPT' } FunctionType */

/** 
 * @typedef { Object } Compiler
 * @property { Compiler } enclosing
 * @property { ObjFunction } function
 * @property { FunctionType } type
 * @property { Local[] } locals
 * @property { number } localCount
 * @property { Upvalue[] } upvalues
 * @property { number } scopeDepth
 */

let parser = /** @type { Parser } */ ({});
let current = /** @type { Compiler } */ ({});
let scanner = /** @type { Scanner } */ ({});
let compilingChunk = /** @type { Chunk } */ ({});

/** @returns { Chunk } */
function currentChunk() {
	return current.function.chunk;
}

/** 
 * @param { string } source 
 * @returns { ObjFunction | null }
 */
export function compile(source) {
	scanner = new Scanner(source);
	let compiler = initCompiler('TYPE_SCRIPT');

	parser.hadError = false;
	parser.panicMode = false;

	advance();
	
	while (!match('TOKEN_EOF')) {
		declaration();
	}

	let fn = endCompiler();

	return parser.hadError ? null : fn;
}

function advance() {
	parser.previous = parser.current;

	for (;;) {
		parser.current = scanner.scanToken();
		if (parser.current.type !== 'TOKEN_ERROR') break;

		errorAtCurrent(parser.current.lexeme);
	}
}

/** 
 * @param { string } type 
 * @param { string } message 
 */
function consume(type, message) {
	if (parser.current.type === type) {
		advance();
		return;
	}

	errorAtCurrent(message);
}

/** 
 * @param { TokenType } type 
 * @returns { boolean } 
 */
function check(type) {
	return parser.current.type === type;
}

/** 
 * @param { TokenType } type 
 * @returns { boolean } 
 */
function match(type) {
	if (!check(type)) return false;
	advance();
	return true;
}

/** @returns { ObjFunction } */
function endCompiler() {
	emitReturn();

	let function_ = current.function;

	if (DEBUG_PRINT_CODE) {
		if (!parser.hadError) {
			disassembleChunk(currentChunk(), function_.name !== null ? function_.name.chars : '<script>');
		}
	}

	current = current.enclosing;
	return function_;
}

function beginScope() {
	current.scopeDepth++;
}

function endScope() {
	current.scopeDepth--;

	while (current.localCount > 0 && current.locals[current.localCount - 1].depth > current.scopeDepth) {
		if (current.locals[current.localCount - 1].isCaptured) {
			emitByte(OpCode.OP_CLOSE_UPVALUE);
		} else {
		emitByte(OpCode.OP_POP);
		}
		current.localCount--;
	}
}

/** @param { boolean } canAssign */
function binary(canAssign) {
	let operatorType = parser.previous.type;
	let rule = getRule(operatorType);
	parsePrecedence(rule.precedence + 1);

	switch (operatorType) {
		case 'TOKEN_BANG_EQUAL': emitBytes(OpCode.OP_EQUAL, OpCode.OP_NOT); break;
		case 'TOKEN_EQUAL_EQUAL': emitByte(OpCode.OP_EQUAL); break;
		case 'TOKEN_GREATER': emitByte(OpCode.OP_GREATER); break;
		case 'TOKEN_GREATER_EQUAL': emitBytes(OpCode.OP_LESS, OpCode.OP_NOT); break;
		case 'TOKEN_LESS': emitByte(OpCode.OP_LESS); break;
		case 'TOKEN_LESS_EQUAL': emitBytes(OpCode.OP_GREATER, OpCode.OP_NOT); break;
		case 'TOKEN_PLUS': emitByte(OpCode.OP_ADD); break;
		case 'TOKEN_MINUS': emitByte(OpCode.OP_SUBTRACT); break;
		case 'TOKEN_STAR': emitByte(OpCode.OP_MULTIPLY); break;
		case 'TOKEN_SLASH': emitByte(OpCode.OP_DIVIDE); break;
		default: return; // Unreachable.
	}
}

/** @param { boolean } canAssign */
function call(canAssign) {
	let argCount = argumentList();
	emitBytes(OpCode.OP_CALL, argCount);
}

/** @param { boolean } canAssign */
function literal(canAssign) {
	switch (parser.previous.type) {
		case 'TOKEN_FALSE': emitByte(OpCode.OP_FALSE); break;
		case 'TOKEN_NIL': emitByte(OpCode.OP_NIL); break;
		case 'TOKEN_TRUE': emitByte(OpCode.OP_TRUE); break;
		default: return; // Unreachable.
	}
}

/** @param { boolean } canAssign */
function grouping(canAssign) {
	expression();
	consume('TOKEN_RIGHT_PAREN', "Expected ')' after expression.");
}

/** @param { boolean } canAssign */
function number(canAssign) {
	let value = parseFloat(parser.previous.lexeme);
	emitConstant(NUMBER_VAL(value));
}

/** @param { boolean } canAssign */
function or_(canAssign) {
	let elseJump = emitJump(OpCode.OP_JUMP_IF_FALSE);
	let endJump = emitJump(OpCode.OP_JUMP);
	
	patchJump(elseJump);
	emitByte(OpCode.OP_POP);

	parsePrecedence(Precedence.PREC_OR);
	patchJump(endJump);
}

/** @param { boolean } canAssign */
function string(canAssign) {
	emitConstant(OBJ_VAL(copyString(parser.previous.lexeme.slice(1, -1))));
}

/** 
 * @param { Token } name 
 * @param { boolean } canAssign
 */
function namedVariable(name, canAssign) {
	let getOp, setOp;
	let arg = resolveLocal(current, name);

	if (arg !== -1) {
		getOp = OpCode.OP_GET_LOCAL;
		setOp = OpCode.OP_SET_LOCAL;
	} else if ((arg = resolveUpvalue(current, name)) !== -1) {
		getOp = OpCode.OP_GET_UPVALUE;
		setOp = OpCode.OP_SET_UPVALUE;
	} else {
		arg = identifierConstant(name);
		getOp = OpCode.OP_GET_GLOBAL;
		setOp = OpCode.OP_SET_GLOBAL;
	}

	if (canAssign && match('TOKEN_EQUAL')) {
		expression();
		emitBytes(setOp, arg);
	} else {
		emitBytes(getOp, arg);
	}
}

/** @param { boolean } canAssign */
function variable(canAssign) {
	namedVariable(parser.previous, canAssign);
}

/** @param { boolean } canAssign */
function unary(canAssign) {
	let operatorType = parser.previous.type;

	// Compile the operand.
	parsePrecedence(Precedence.PREC_UNARY);

	// Emit the operator instruction.
	switch (operatorType) {
		case 'TOKEN_BANG': emitByte(OpCode.OP_NOT); break;
		case 'TOKEN_MINUS': emitByte(OpCode.OP_NEGATE); break;
		default: return; // Unreachable.
	}
}

/** @type { Record<TokenType, ParseRule> } */
let rules = {
	['TOKEN_LEFT_PAREN']: 		{ prefix: grouping, infix: call, 		precedence: Precedence.PREC_CALL },
	['TOKEN_RIGHT_PAREN']: 		{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_LEFT_BRACE']: 		{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_RIGHT_BRACE']: 		{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_COMMA']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_DOT']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_MINUS']: 					{ prefix: unary, 		infix: binary, 	precedence: Precedence.PREC_TERM },
	['TOKEN_PLUS']: 					{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_TERM },
	['TOKEN_SEMICOLON']: 			{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_SLASH']: 					{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_FACTOR },
	['TOKEN_STAR']: 					{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_FACTOR },
	['TOKEN_BANG']: 					{ prefix: unary, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_BANG_EQUAL']: 		{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_EQUALITY },
	['TOKEN_EQUAL']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_EQUAL_EQUAL']: 		{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_EQUALITY },
	['TOKEN_GREATER']: 				{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_COMPARISON },
	['TOKEN_GREATER_EQUAL']: 	{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_COMPARISON },
	['TOKEN_LESS']: 					{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_COMPARISON },
	['TOKEN_LESS_EQUAL']: 		{ prefix: null, 		infix: binary, 	precedence: Precedence.PREC_COMPARISON },
	['TOKEN_IDENTIFIER']: 		{ prefix: variable, infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_STRING']: 				{ prefix: string, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_NUMBER']: 				{ prefix: number, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_AND']: 						{ prefix: null, 		infix: and_, 		precedence: Precedence.PREC_AND },
	['TOKEN_CLASS']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_ELSE']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_FALSE']: 					{ prefix: literal, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_FOR']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_FUN']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_IF']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_NIL']: 						{ prefix: literal, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_OR']: 						{ prefix: null, 		infix: or_, 		precedence: Precedence.PREC_OR },
	['TOKEN_PRINT']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_RETURN']: 				{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_SUPER']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_THIS']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_TRUE']: 					{ prefix: literal, 	infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_VAR']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_WHILE']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_ERROR']: 					{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE },
	['TOKEN_EOF']: 						{ prefix: null, 		infix: null, 		precedence: Precedence.PREC_NONE }
}

/** @param { Precedence } precedence */
function parsePrecedence(precedence) {
	advance();
	let prefixRule = getRule(parser.previous.type).prefix;
	if (prefixRule === null) {
		error("Expected expression.");
		return;
	}

	let canAssign = precedence <= Precedence.PREC_ASSIGNMENT;
	prefixRule(canAssign);

	while (precedence <= getRule(parser.current.type).precedence) {
		advance();
		let infixRule = getRule(parser.previous.type).infix ?? (() => {});
		infixRule(canAssign);
	}

	if (canAssign && match('TOKEN_EQUAL')) {
		error("Invalid assignment target.");
	}
}

/**
 * @param { Token } name
 * @returns 
 */
function identifierConstant(name) {
	return makeConstant(OBJ_VAL(copyString(name.lexeme)));
}

/**
 * @param { string } a 
 * @param { string } b 
 * @returns { boolean }
 */
function identifiersEqual(a, b) {
	return a === b;
}

/**
 * @param { Compiler } compiler 
 * @param { Token } name 
 */
function resolveLocal(compiler, name) {
	for (let i = compiler.localCount - 1; i >= 0; i--) {
		let local = compiler.locals[i];
		if (identifiersEqual(name.lexeme, local.name)) {
			if (local.depth === -1) {
				error("Can't read local variable in its own initializer.");
			}
			return i;
		}
	}

	return -1;
}

/**
 * @param { Compiler } compiler 
 * @param { Token } name 
 */
function resolveUpvalue(compiler, name) {
	if (compiler.enclosing === undefined) return -1;
	
	let local = resolveLocal(compiler.enclosing, name);
	if (local !== -1) {
		compiler.enclosing.locals[local].isCaptured = true;
		return addUpvalue(compiler, local, true);
	}

	/** @type { number } */
	let upvalue = resolveUpvalue(compiler.enclosing, name);
	if (upvalue !== -1) {
		return addUpvalue(compiler, upvalue, false);
	}

	return -1;
}

/**
 * @param { Compiler } compiler 
 * @param { number } index 
 * @param { boolean } isLocal 
 * @returns { number }
 */
function addUpvalue(compiler, index, isLocal) {
	let upvalueCount = compiler.function.upvalueCount;

	for (let i = 0; i < upvalueCount; i++) {
		let upvalue = compiler.upvalues[i];
		if (upvalue.index === index && upvalue.isLocal === isLocal) return i;
	}

	if (upvalueCount === 255) {
		error('Too many closure variables in function.');
		return 0;
	}

	compiler.upvalues[upvalueCount] = { isLocal, index };

	return compiler.function.upvalueCount++;
}

/** @param { Token } name */
function addLocal(name) {
	if (current.localCount === 255) {
		error("Too many local variables in function.");
		return;
	}

	current.locals[current.localCount++] = { 
		name: name.lexeme, 
		depth: -1,
		isCaptured: false 
	};
}

function declareVariable() {
	if (current.scopeDepth === 0) return;

	let name = parser.previous;
	for (let i = current.localCount - 1; i >= 0; i--) {
		let local = current.locals[i];
		if (local.depth !== -1 && local.depth < current.scopeDepth) break;

		if (identifiersEqual(name.lexeme, local.name)) {
			error("Already variable with this name in this scope.");
		}
	}
	addLocal(name);
}

/** 
 * @param { string } errorMessage 
 * @returns { number } 
 */
function parseVariable(errorMessage) {
	consume('TOKEN_IDENTIFIER', errorMessage);

	declareVariable();
	if (current.scopeDepth > 0) return 0;

	return identifierConstant(parser.previous);
}

function markInitialized() {
	if (current.scopeDepth === 0) return;
	current.locals[current.localCount - 1].depth = current.scopeDepth;
}

/** @param { number } global */
function defineVariable(global) {
	if (current.scopeDepth > 0) {
		markInitialized();
		return;
	}

	emitBytes(OpCode.OP_DEFINE_GLOBAL, global);
}

/** @returns { number } */
function argumentList() {
	let argCount = 0;
	if (!check('TOKEN_RIGHT_PAREN')) {
		do {
			expression();

			if (argCount === 255) {
				error("Can't have more than 255 arguments.");
			}

			argCount++;
		} while (match('TOKEN_COMMA'));
	}
	consume('TOKEN_RIGHT_PAREN', "Expected ')' after arguments.");

	return argCount;
}

/** @param { boolean } canAssign */
function and_(canAssign) {
	let endJump = emitJump(OpCode.OP_JUMP_IF_FALSE);

	emitByte(OpCode.OP_POP);
	parsePrecedence(Precedence.PREC_AND);
	patchJump(endJump);
}

/** 
 * @param { TokenType } type 
 * @returns { ParseRule }
 */
function getRule(type) {
	return rules[type];
}

function expression() {
	parsePrecedence(Precedence.PREC_ASSIGNMENT);
}

function block() {
	while (!check('TOKEN_RIGHT_BRACE') && !check('TOKEN_EOF')) {
		declaration();
	}

	consume('TOKEN_RIGHT_BRACE', "Expected '}' after block.");
}

/** @param { FunctionType } type */
function func(type) {
	let compiler = initCompiler(type);
	beginScope();

	consume('TOKEN_LEFT_PAREN', "Expected '(' after function name.");
	if (!check('TOKEN_RIGHT_PAREN')) {
		do {
			current.function.arity++;
			if (current.function.arity > 255) {
				errorAtCurrent("Can't have more than 255 parameters.");
			}
			let constant = parseVariable("Expected parameter name.");
			defineVariable(constant);
		} while (match('TOKEN_COMMA'));
	}
	consume('TOKEN_RIGHT_PAREN', "Expected ')' after parameters.");
	consume('TOKEN_LEFT_BRACE', "Expected '{' before function body.");
	block();

	let func = endCompiler();
	emitBytes(OpCode.OP_CLOSURE, makeConstant(OBJ_VAL(func)));

	for (let i = 0; i < func.upvalueCount; i++) {
		emitByte(compiler.upvalues[i].isLocal ? 1 : 0);
		emitByte(compiler.upvalues[i].index);
	}
}

function funDeclaration() {
	let global = parseVariable('Expected function name.');
	markInitialized();
	func('TYPE_FUNCTION');
	defineVariable(global);
}

function varDeclaration() {
	let global = parseVariable('Expected variable name.');

	if (match('TOKEN_EQUAL')) {
		expression();
	} else {
		emitByte(OpCode.OP_NIL);
	}

	consume('TOKEN_SEMICOLON', "Expected ';' after variable declaration.");

	defineVariable(global);
}

function expressionStatement() {
	expression();
	consume('TOKEN_SEMICOLON', "Expected ';' after value.");
	emitByte(OpCode.OP_POP);
}

function forStatement() {
	beginScope();
	consume('TOKEN_LEFT_PAREN', "Expected '(' after 'for'.");
	if (match('TOKEN_SEMICOLON')) {
		// No initializer.
	} else if (match('TOKEN_VAR')) {
		varDeclaration();
	} else {
		expressionStatement();
	}

	let loopStart = currentChunk().count;
	let exitJump = -1;

	if (!match('TOKEN_SEMICOLON')) {
		expression();
		consume('TOKEN_SEMICOLON', "Expected ';' after loop condition.");

		// exit the loop if the condition is false
		exitJump = emitJump(OpCode.OP_JUMP_IF_FALSE);
		emitByte(OpCode.OP_POP);
	}

	if (!match('TOKEN_RIGHT_PAREN')) {
		let bodyJump = emitJump(OpCode.OP_JUMP);
		let incrementStart = currentChunk().count;

		expression();
		emitByte(OpCode.OP_POP);
		consume('TOKEN_RIGHT_PAREN', "Expected ')' after for clauses.");

		emitLoop(loopStart);
		loopStart = incrementStart;
		patchJump(bodyJump);
	}

	statement();
	emitLoop(loopStart);

	if (exitJump !== -1) {
		patchJump(exitJump);
		emitByte(OpCode.OP_POP);
	}

	endScope();
}

function ifStatement() {
	consume('TOKEN_LEFT_PAREN', "Expected '(' after 'if'.");
	expression();
	consume('TOKEN_RIGHT_PAREN', "Expected ')' after condition.");

	let thenJump = emitJump(OpCode.OP_JUMP_IF_FALSE);
	emitByte(OpCode.OP_POP);
	statement();

	let elseJump = emitJump(OpCode.OP_JUMP);

	patchJump(thenJump);
	emitByte(OpCode.OP_POP);

	if (match('TOKEN_ELSE')) statement();
	patchJump(elseJump);
}

function printStatement() {
	expression();
	consume('TOKEN_SEMICOLON', "Expected ';' after value.");
	emitByte(OpCode.OP_PRINT);
}

function returnStatement() {
	if (current.type === 'TYPE_SCRIPT') {
		error("Can't return from top-level code.");
	}

	if (match('TOKEN_SEMICOLON')) {
		emitReturn();
	} else {
		expression();
		consume('TOKEN_SEMICOLON', "Expected ';' after return value.");
		emitByte(OpCode.OP_RETURN);
	}
}


function whileStatement() {
	let loopStart = currentChunk().count;
	consume('TOKEN_LEFT_PAREN', "Expected '(' after 'while'.");
	expression();
	consume('TOKEN_RIGHT_PAREN', "Expected ')' after condition.");

	let exitJump = emitJump(OpCode.OP_JUMP_IF_FALSE);
	emitByte(OpCode.OP_POP);
	statement();
	emitLoop(loopStart);
	
	patchJump(exitJump);
	emitByte(OpCode.OP_POP);
}

function synchronize() {
	parser.panicMode = false;

	while (parser.current.type !== 'TOKEN_EOF') {
		if (parser.previous.type === 'TOKEN_SEMICOLON') return;

		switch (parser.current.type) {
			case 'TOKEN_CLASS':
			case 'TOKEN_FUN':
			case 'TOKEN_VAR':
			case 'TOKEN_FOR':
			case 'TOKEN_IF':
			case 'TOKEN_WHILE':
			case 'TOKEN_PRINT':
			case 'TOKEN_RETURN':
				return;
			default: ; // Do nothing.
		}

		advance();
	}
}

function declaration() {
	if (match('TOKEN_FUN')) {
		funDeclaration();
	} else if (match('TOKEN_VAR')) {
		varDeclaration();
	} else {
		statement();
	}

	if (parser.panicMode) synchronize();
}

function statement() {
	if (match('TOKEN_PRINT')) {
		printStatement();
	} else if (match('TOKEN_FOR')) {
		forStatement();
	} else if (match('TOKEN_IF')) {
		ifStatement();
	} else if (match('TOKEN_RETURN')) {
		returnStatement();
	} else if (match('TOKEN_WHILE')) {
		whileStatement();
	} else if (match('TOKEN_LEFT_BRACE')) {
		beginScope();
		block();
		endScope();
	} else {
		expressionStatement();
	}
}

/** @param { number } byte */
function emitByte(byte) {
	currentChunk().write(byte, parser.previous.line);
}

/** 
 * @param { number } byte1 
 * @param { number } byte2 
 */
function emitBytes(byte1, byte2) {
	emitByte(byte1);
	emitByte(byte2);
}

/** @param { number } loopStart */
function emitLoop(loopStart) {
	emitByte(OpCode.OP_LOOP);

	let offset = currentChunk().count - loopStart + 2;
	if (offset > 65535) error('Loop body too large.');

	emitByte((offset >> 8) & 0xff);
	emitByte(offset & 0xff);
}

/** 
 * @param { number } instruction 
 * @returns { number } 
 */
function emitJump(instruction) {
	emitByte(instruction);
	emitByte(0xff);
	emitByte(0xff);

	return currentChunk().count - 2;
}

function emitReturn() {
	emitByte(OpCode.OP_NIL);
	emitByte(OpCode.OP_RETURN);
}

/** @param { Value } value */
function makeConstant(value) {
	let constant = currentChunk().addConstant(value);
	if (constant > 255) {
		errorAtCurrent('Too many constants in one chunk.');
		return 0;
	}

	return constant;
}

/** @param { Value } value */
function emitConstant(value) {
	emitBytes(OpCode.OP_CONSTANT, makeConstant(value));
}

/** @param { number } offset */
function patchJump(offset) {
	// -2 to adjust for the bytecode for the jump offset itself.
	let jump = currentChunk().count - offset - 2;

	if (jump > 65535) {
		errorAtCurrent('Too much code to jump over.');
	}

	currentChunk().code[offset] = (jump >> 8) & 0xff;
	currentChunk().code[offset + 1] = jump & 0xff;
}

/** 
 * @param { FunctionType } type 
 * @returns { Compiler }
 */
function initCompiler(type) {
	/** @type { Compiler } */
	let compiler = {};
	compiler.type = type;
	compiler.upvalues = [];
	compiler.locals = [];
	compiler.localCount = 0;
	compiler.scopeDepth = 0;
	compiler.enclosing = current;
	compiler.function = newFunction();

	current = compiler;

	if (type !== 'TYPE_SCRIPT') {
		current.function.name = copyString(parser.previous.lexeme);
	}

	current.locals[current.localCount++] = { 
		name: "", 
		depth: 0,
		isCaptured: false
	};

	return compiler;
}

/** @param { string } message */
function errorAtCurrent(message) {
	errorAt(parser.current, message);
}

/** @param { string } message */
function error(message) {
	errorAt(parser.previous, message);
}

/** 
 * @param { Token } token 
 * @param { string } message 
 */
function errorAt(token, message) {
	if (parser.panicMode) return;
	parser.panicMode = true;
	let line = `[line ${token.line}] Error`;

	if (token.type === 'TOKEN_EOF') {
		line += ' at end';
	} else if (token.type === 'TOKEN_ERROR') {
		// Nothing
	} else {
		line += ` at '${token.lexeme}'`;
	}

	line += `: ${message}`;
	console.error(line);
	parser.hadError = true;
}