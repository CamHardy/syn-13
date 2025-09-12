import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Fields', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('call function field', () => {
		System.run(`
			class Foo {}

			fun bar(a, b) {
				print "bar";
				print a;
				print b;
			}

			var foo = Foo();
			foo.bar = bar;

			foo.bar(1, 2);
		`);
		expect(consoleMock).nthCalledWith(1, 'bar');
		expect(consoleMock).nthCalledWith(2, '1');
		expect(consoleMock).nthCalledWith(3, '2');
	});

  it('call non-function field', () => {
		expect(() => System.run(`
			class Foo {}

			var foo = Foo();
			foo.bar = "not fn";

			foo.bar();
		`)).toThrowError('Can only call functions and classes.');
	});

  it('get and set method', () => {
		System.run(`
			class Foo {
				method(a) {
					print "method";
					print a;
				}

				other(a) {
					print "other";
					print a;
				}
			}
				
			var foo = Foo();
			var method = foo.method;

			foo.method = foo.other;
			foo.method(1);

			method(2);
		`);
		expect(consoleMock).nthCalledWith(1, 'other');
		expect(consoleMock).nthCalledWith(2, '1');
		expect(consoleMock).nthCalledWith(3, 'method');
		expect(consoleMock).nthCalledWith(4, '2');
	});

  it('get on bool', () => {
		expect(() => System.run('true.foo;')).toThrowError('Only instances have properties.');
	});

  it('get on class', () => {
		expect(() => System.run(`
			class Foo {}
			Foo.bar;
		`)).toThrowError('Only instances have properties.');
	});

  it('get on function', () => {
		expect(() => System.run(`
			fun foo() {}
			foo.bar;
		`)).toThrowError('Only instances have properties.');
	});

  it('get on nil', () => {
		expect(() => System.run('nil.foo;')).toThrowError('Only instances have properties.');
	});

  it('get on num', () => {
		expect(() => System.run('123.foo;')).toThrowError('Only instances have properties.');
	});

  it('get on string', () => {
		expect(() => System.run('"str".foo;')).toThrowError('Only instances have properties.');
	});
	
  it('many', () => {
		System.run(`
			class Foo {}

			var foo = Foo();
			fun setFields() {
				foo.bilberry = "bilberry";
				foo.lime = "lime";
				foo.elderberry = "elderberry";
				foo.raspberry = "raspberry";
				foo.gooseberry = "gooseberry";
				foo.longan = "longan";
				foo.mandarine = "mandarine";
				foo.kiwifruit = "kiwifruit";
				foo.orange = "orange";
				foo.pomegranate = "pomegranate";
				foo.tomato = "tomato";
				foo.banana = "banana";
				foo.juniper = "juniper";
				foo.damson = "damson";
				foo.blackcurrant = "blackcurrant";
				foo.peach = "peach";
				foo.grape = "grape";
				foo.mango = "mango";
				foo.redcurrant = "redcurrant";
				foo.watermelon = "watermelon";
				foo.plumcot = "plumcot";
				foo.papaya = "papaya";
				foo.cloudberry = "cloudberry";
				foo.rambutan = "rambutan";
				foo.salak = "salak";
				foo.physalis = "physalis";
				foo.huckleberry = "huckleberry";
				foo.coconut = "coconut";
				foo.date = "date";
				foo.tamarind = "tamarind";
				foo.lychee = "lychee";
				foo.raisin = "raisin";
				foo.apple = "apple";
				foo.avocado = "avocado";
				foo.nectarine = "nectarine";
				foo.pomelo = "pomelo";
				foo.melon = "melon";
				foo.currant = "currant";
				foo.plum = "plum";
				foo.persimmon = "persimmon";
				foo.olive = "olive";
				foo.cranberry = "cranberry";
				foo.boysenberry = "boysenberry";
				foo.blackberry = "blackberry";
				foo.passionfruit = "passionfruit";
				foo.mulberry = "mulberry";
				foo.marionberry = "marionberry";
				foo.plantain = "plantain";
				foo.lemon = "lemon";
				foo.yuzu = "yuzu";
				foo.loquat = "loquat";
				foo.kumquat = "kumquat";
				foo.salmonberry = "salmonberry";
				foo.tangerine = "tangerine";
				foo.durian = "durian";
				foo.pear = "pear";
				foo.cantaloupe = "cantaloupe";
				foo.quince = "quince";
				foo.guava = "guava";
				foo.strawberry = "strawberry";
				foo.nance = "nance";
				foo.apricot = "apricot";
				foo.jambul = "jambul";
				foo.grapefruit = "grapefruit";
				foo.clementine = "clementine";
				foo.jujube = "jujube";
				foo.cherry = "cherry";
				foo.feijoa = "feijoa";
				foo.jackfruit = "jackfruit";
				foo.fig = "fig";
				foo.cherimoya = "cherimoya";
				foo.pineapple = "pineapple";
				foo.blueberry = "blueberry";
				foo.jabuticaba = "jabuticaba";
				foo.miracle = "miracle";
				foo.dragonfruit = "dragonfruit";
				foo.satsuma = "satsuma";
				foo.tamarillo = "tamarillo";
				foo.honeydew = "honeydew";
			}

			setFields();

			fun printFields() {
				print foo.apple;
				print foo.apricot;
				print foo.avocado;
				print foo.banana;
				print foo.bilberry;
				print foo.blackberry;
				print foo.blackcurrant;
				print foo.blueberry;
				print foo.boysenberry;
				print foo.cantaloupe;
				print foo.cherimoya;
				print foo.cherry;
				print foo.clementine;
				print foo.cloudberry;
				print foo.coconut;
				print foo.cranberry;
				print foo.currant;
				print foo.damson;
				print foo.date;
				print foo.dragonfruit;
				print foo.durian;
				print foo.elderberry;
				print foo.feijoa;
				print foo.fig;
				print foo.gooseberry;
				print foo.grape;
				print foo.grapefruit;
				print foo.guava;
				print foo.honeydew;
				print foo.huckleberry;
				print foo.jabuticaba;
				print foo.jackfruit;
				print foo.jambul;
				print foo.jujube;
				print foo.juniper;
				print foo.kiwifruit;
				print foo.kumquat;
				print foo.lemon;
				print foo.lime;
				print foo.longan;
				print foo.loquat;
				print foo.lychee;
				print foo.mandarine;
				print foo.mango;
				print foo.marionberry;
				print foo.melon;
				print foo.miracle;
				print foo.mulberry;
				print foo.nance;
				print foo.nectarine;
				print foo.olive;
				print foo.orange;
				print foo.papaya;
				print foo.passionfruit;
				print foo.peach;
				print foo.pear;
				print foo.persimmon;
				print foo.physalis;
				print foo.pineapple;
				print foo.plantain;
				print foo.plum;
				print foo.plumcot;
				print foo.pomegranate;
				print foo.pomelo;
				print foo.quince;
				print foo.raisin;
				print foo.rambutan;
				print foo.raspberry;
				print foo.redcurrant;
				print foo.salak;
				print foo.salmonberry;
				print foo.satsuma;
				print foo.strawberry;
				print foo.tamarillo;
				print foo.tamarind;
				print foo.tangerine;
				print foo.tomato;
				print foo.watermelon;
				print foo.yuzu;
			}

			printFields();
		`);
		expect(consoleMock).nthCalledWith(1, 'apple');
		expect(consoleMock).nthCalledWith(2, 'apricot');
		expect(consoleMock).nthCalledWith(3, 'avocado');
		expect(consoleMock).nthCalledWith(4, 'banana');
		expect(consoleMock).nthCalledWith(5, 'bilberry');
		expect(consoleMock).nthCalledWith(6, 'blackberry');
		expect(consoleMock).nthCalledWith(7, 'blackcurrant');
		expect(consoleMock).nthCalledWith(8, 'blueberry');
		expect(consoleMock).nthCalledWith(9, 'boysenberry');
		expect(consoleMock).nthCalledWith(10, 'cantaloupe');
		expect(consoleMock).nthCalledWith(11, 'cherimoya');
		expect(consoleMock).nthCalledWith(12, 'cherry');
		expect(consoleMock).nthCalledWith(13, 'clementine');
		expect(consoleMock).nthCalledWith(14, 'cloudberry');
		expect(consoleMock).nthCalledWith(15, 'coconut');
		expect(consoleMock).nthCalledWith(16, 'cranberry');
		expect(consoleMock).nthCalledWith(17, 'currant');
		expect(consoleMock).nthCalledWith(18, 'damson');
		expect(consoleMock).nthCalledWith(19, 'date');
		expect(consoleMock).nthCalledWith(20, 'dragonfruit');
		expect(consoleMock).nthCalledWith(21, 'durian');
		expect(consoleMock).nthCalledWith(22, 'elderberry');
		expect(consoleMock).nthCalledWith(23, 'feijoa');
		expect(consoleMock).nthCalledWith(24, 'fig');
		expect(consoleMock).nthCalledWith(25, 'gooseberry');
		expect(consoleMock).nthCalledWith(26, 'grape');
		expect(consoleMock).nthCalledWith(27, 'grapefruit');
		expect(consoleMock).nthCalledWith(28, 'guava');
		expect(consoleMock).nthCalledWith(29, 'honeydew');
		expect(consoleMock).nthCalledWith(30, 'huckleberry');
		expect(consoleMock).nthCalledWith(31, 'jabuticaba');
		expect(consoleMock).nthCalledWith(32, 'jackfruit');
		expect(consoleMock).nthCalledWith(33, 'jambul');
		expect(consoleMock).nthCalledWith(34, 'jujube');
		expect(consoleMock).nthCalledWith(35, 'juniper');
		expect(consoleMock).nthCalledWith(36, 'kiwifruit');
		expect(consoleMock).nthCalledWith(37, 'kumquat');
		expect(consoleMock).nthCalledWith(38, 'lemon');
		expect(consoleMock).nthCalledWith(39, 'lime');
		expect(consoleMock).nthCalledWith(40, 'longan');
		expect(consoleMock).nthCalledWith(41, 'loquat');
		expect(consoleMock).nthCalledWith(42, 'lychee');
		expect(consoleMock).nthCalledWith(43, 'mandarine');
		expect(consoleMock).nthCalledWith(44, 'mango');
		expect(consoleMock).nthCalledWith(45, 'marionberry');
		expect(consoleMock).nthCalledWith(46, 'melon');
		expect(consoleMock).nthCalledWith(47, 'miracle');
		expect(consoleMock).nthCalledWith(48, 'mulberry');
		expect(consoleMock).nthCalledWith(49, 'nance');
		expect(consoleMock).nthCalledWith(50, 'nectarine');
		expect(consoleMock).nthCalledWith(51, 'olive');
		expect(consoleMock).nthCalledWith(52, 'orange');
		expect(consoleMock).nthCalledWith(53, 'papaya');
		expect(consoleMock).nthCalledWith(54, 'passionfruit');
		expect(consoleMock).nthCalledWith(55, 'peach');
		expect(consoleMock).nthCalledWith(56, 'pear');
		expect(consoleMock).nthCalledWith(57, 'persimmon');
		expect(consoleMock).nthCalledWith(58, 'physalis');
		expect(consoleMock).nthCalledWith(59, 'pineapple');
		expect(consoleMock).nthCalledWith(60, 'plantain');
		expect(consoleMock).nthCalledWith(61, 'plum');
		expect(consoleMock).nthCalledWith(62, 'plumcot');
		expect(consoleMock).nthCalledWith(63, 'pomegranate');
		expect(consoleMock).nthCalledWith(64, 'pomelo');
		expect(consoleMock).nthCalledWith(65, 'quince');
		expect(consoleMock).nthCalledWith(66, 'raisin');
		expect(consoleMock).nthCalledWith(67, 'rambutan');
		expect(consoleMock).nthCalledWith(68, 'raspberry');
		expect(consoleMock).nthCalledWith(69, 'redcurrant');
		expect(consoleMock).nthCalledWith(70, 'salak');
		expect(consoleMock).nthCalledWith(71, 'salmonberry');
		expect(consoleMock).nthCalledWith(72, 'satsuma');
		expect(consoleMock).nthCalledWith(73, 'strawberry');
		expect(consoleMock).nthCalledWith(74, 'tamarillo');
		expect(consoleMock).nthCalledWith(75, 'tamarind');
		expect(consoleMock).nthCalledWith(76, 'tangerine');
		expect(consoleMock).nthCalledWith(77, 'tomato');
		expect(consoleMock).nthCalledWith(78, 'watermelon');
		expect(consoleMock).nthCalledWith(79, 'yuzu');
	});

  it('method', () => {
		System.run(`
			class Foo {
				bar(arg) {
					print arg;
				}
			}

			var bar = Foo().bar;
			print "got method";
			bar("arg");
		`);
		expect(consoleMock).nthCalledWith(1, 'got method');
		expect(consoleMock).nthCalledWith(2, 'arg');
	});

  it('method binds this', () => {
		System.run(`
			class Foo {
				sayName(a) {
					print this.name;
					print a;
				}
			}

			var foo1 = Foo();
			foo1.name = "foo1";

			var foo2 = Foo();
			foo2.name = "foo2";

			foo2.fn = foo1.sayName;
			foo2.fn(1);
		`);
		expect(consoleMock).nthCalledWith(1, 'foo1');
		expect(consoleMock).nthCalledWith(2, '1');
	});

  it('on instance', () => {
		System.run(`
			class Foo {}

			var foo = Foo();

			print foo.bar = "bar value";
			print foo.baz = "baz value";
			print foo.bar;
			print foo.baz;
		`);
		expect(consoleMock).nthCalledWith(1, 'bar value');
		expect(consoleMock).nthCalledWith(2, 'baz value');
		expect(consoleMock).nthCalledWith(3, 'bar value');
		expect(consoleMock).nthCalledWith(4, 'baz value');
	});
	
  it('set evaluation order', () => {
		expect(() => System.run(`
			undefined1.bar
				= undefined2;
		`)).toThrowError("Undefined variable 'undefined1'.");
	});

  it('set on bool', () => {
		expect(() => System.run('true.foo = "value";')).toThrowError('Only instances have fields.');
	});

  it('set on class', () => {
		expect(() => System.run(`
			class Foo {}
			Foo.bar = "value";
		`)).toThrowError('Only instances have fields.');
	});

  it('set on function', () => {
		expect(() => System.run(`
			fun foo() {}
			foo.bar = "value";
		`)).toThrowError('Only instances have fields.');
	});

  it('set on nil', () => {
		expect(() => System.run('nil.foo = "value";')).toThrowError('Only instances have fields.');
	});

  it('set on num', () => {
		expect(() => System.run('123.foo = "value";')).toThrowError('Only instances have fields.');
	});

  it('set on string', () => {
		expect(() => System.run('"str".foo = "value";')).toThrowError('Only instances have fields.');
	});

  it('undefined', () => {
		expect(() => System.run(`
			class Foo {}

			var foo = Foo();
			foo.bar;
		`)).toThrowError("Undefined property 'bar'.");
	});
});