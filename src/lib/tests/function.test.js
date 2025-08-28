import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Functions', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('body must be block', () => {
    System.run('fun f() 123;');
    expect(consoleMock).nthCalledWith(1, expect.stringContaining("Error at '123': Expected '{' before function body."));
  });

  it('empty body', () => {
    System.run(`
      fun f() {}
      print f();
    `);
    expect(consoleMock).lastCalledWith('nil');
  });

  it('extra arguments', () => {
    expect(() => System.run(`
      fun f(a, b) {
        print a;
        print b;
      }

      f(1, 2, 3, 4);
    `)).toThrowError('Expected 2 arguments but got 4.');
  });

  it('local mutual recursion', () => {
    expect(() => System.run(`
      {
        fun isEven(n) {
          if (n == 0) return true;
          return isOdd(n - 1);
        }

        fun isOdd(n) {
          if (n == 0) return false;
          return isEven(n - 1);
        }

        isEven(4);
      }
    `)).toThrowError("Undefined variable 'isOdd'.");
  });

  it('local recursion', () => {
    System.run(`
      {
        fun fib(n) {
          if (n < 2) return n;
          return fib(n - 1) + fib(n - 2);
        }

        print fib(8);
      }
    `);
    expect(consoleMock).lastCalledWith('21');
  });

  it('missing arguments', () => {
    expect(() => System.run(`
      fun f(a, b) {}

      f(1);
    `)).toThrowError('Expected 2 arguments but got 1.');
  });

  it('missing comma in parameters', () => {
    System.run('fun foo(a, b c, d, e, f) {}');
    expect(consoleMock).nthCalledWith(1, expect.stringContaining("Error at 'c': Expected ')' after function parameters."));
  });

  it('mutual recursion', () => {
    System.run(`
      fun isEven(n) {
        if (n == 0) return true;
        return isOdd(n - 1);
      }

      fun isOdd(n) {
        if (n == 0) return false;
        return isEven(n - 1);
      }

      print isEven(4);
      print isOdd(3);
    `);
    expect(consoleMock).nthCalledWith(1, 'true');
    expect(consoleMock).nthCalledWith(2, 'true');
  });

  it('nested call with arguments', () => {
    System.run(`
      fun returnArg(arg) {
        return arg;
      }

      fun returnFunCallWithArg(func, arg) {
        return returnArg(func)(arg);
      }

      fun printArg(arg) {
        print arg;
      }

      returnFunCallWithArg(printArg, "hello world");
    `);
    expect(consoleMock).lastCalledWith('hello world');
  });

  it('parameters', () => {
    System.run(`
      fun f0() { return 0; }
      print f0();

      fun f1(a) { return a; }
      print f1(1);

      fun f2(a, b) { return a + b; }
      print f2(1, 2);

      fun f3(a, b, c) { return a + b + c; }
      print f3(1, 2, 3);

      fun f4(a, b, c, d) { return a + b + c + d; }
      print f4(1, 2, 3, 4);

      fun f5(a, b, c, d, e) { return a + b + c + d + e; }
      print f5(1, 2, 3, 4, 5);

      fun f6(a, b, c, d, e, f) { return a + b + c + d + e + f; }
      print f6(1, 2, 3, 4, 5, 6);

      fun f7(a, b, c, d, e, f, g) { return a + b + c + d + e + f + g; }
      print f7(1, 2, 3, 4, 5, 6, 7);

      fun f8(a, b, c, d, e, f, g, h) { return a + b + c + d + e + f + g + h; }
      print f8(1, 2, 3, 4, 5, 6, 7, 8);
    `);
    expect(consoleMock).nthCalledWith(1, '0');
    expect(consoleMock).nthCalledWith(2, '1');
    expect(consoleMock).nthCalledWith(3, '3');
    expect(consoleMock).nthCalledWith(4, '6');
    expect(consoleMock).nthCalledWith(5, '10');
    expect(consoleMock).nthCalledWith(6, '15');
    expect(consoleMock).nthCalledWith(7, '21');
    expect(consoleMock).nthCalledWith(8, '28');
    expect(consoleMock).nthCalledWith(9, '36');
  });

  it('print', () => {
    System.run(`
      fun foo() {}
      print foo;

      print clock;
    `);
    expect(consoleMock).nthCalledWith(1, '<fn foo>');
    expect(consoleMock).nthCalledWith(2, '<native fn>');
  });

  it('recursion', () => {
    System.run(`
      fun fib(n) {
        if (n < 2) return n;
        return fib(n - 1) + fib(n - 2);
      }

      print fib(8);
    `);
    expect(consoleMock).lastCalledWith('21');
  });

  it('too many arguments', () => {
    System.run(`
      fun foo() {}
      {
        var a = 1;
        foo(
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 16
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 32
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 48
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 64
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 80
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 96
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 112
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 128
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 144
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 160
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 176
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 192
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 208
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 224
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, // 240
          a, a, a, a, a, a, a, a, a, a, a, a, a, a, a, a  // 256
        );
      }
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'a': Can't have more than 255 arguments."));
  });

  it('too many parameters', () => {
    System.run(`
      fun f(
        a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12, a13, a14, a15, a16, 
        a17, a18, a19, a20, a21, a22, a23, a24, a25, a26, a27, a28, a29, a30, a31, a32, 
        a33, a34, a35, a36, a37, a38, a39, a40, a41, a42, a43, a44, a45, a46, a47, a48, 
        a49, a50, a51, a52, a53, a54, a55, a56, a57, a58, a59, a60, a61, a62, a63, a64, 
        a65, a66, a67, a68, a69, a70, a71, a72, a73, a74, a75, a76, a77, a78, a79, a80, 
        a81, a82, a83, a84, a85, a86, a87, a88, a89, a90, a91, a92, a93, a94, a95, a96, 
        a97, a98, a99, a100, a101, a102, a103, a104, a105, a106, a107, a108, a109, a110, a111, a112, 
        a113, a114, a115, a116, a117, a118, a119, a120, a121, a122, a123, a124, a125, a126, a127, a128, 
        a129, a130, a131, a132, a133, a134, a135, a136, a137, a138, a139, a140, a141, a142, a143, a144, 
        a145, a146, a147, a148, a149, a150, a151, a152, a153, a154, a155, a156, a157, a158, a159, a160, 
        a161, a162, a163, a164, a165, a166, a167, a168, a169, a170, a171, a172, a173, a174, a175, a176, 
        a177, a178, a179, a180, a181, a182, a183, a184, a185, a186, a187, a188, a189, a190, a191, a192, 
        a193, a194, a195, a196, a197, a198, a199, a200, a201, a202, a203, a204, a205, a206, a207, a208, 
        a209, a210, a211, a212, a213, a214, a215, a216, a217, a218, a219, a220, a221, a222, a223, a224, 
        a225, a226, a227, a228, a229, a230, a231, a232, a233, a234, a235, a236, a237, a238, a239, a240, 
        a241, a242, a243, a244, a245, a246, a247, a248, a249, a250, a251, a252, a253, a254, a255, a256
      ) {}
    `);
    expect(consoleMock).lastCalledWith(expect.stringContaining("Error at 'a256': Cannot have more than 255 parameters."));
  });
});