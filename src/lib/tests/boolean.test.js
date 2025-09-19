import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../tree-walker/system.js';

describe('Booleans', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('equality', () => {
    System.run(`
      print true == true;
      print true == false;
      print false == true;
      print false == false;

      print true == 1;
      print false == 0;
      print true == "true";
      print false == "false";
      print true == "";
      
      print true != true;
      print true != false;
      print false != true;
      print false != false;
      
      print true != 1;
      print false != 0;
      print true != "true";
      print false != "false";
      print false != "";
    `);
    expect(consoleMock).nthCalledWith(1, 'true');
    expect(consoleMock).nthCalledWith(2, 'false');
    expect(consoleMock).nthCalledWith(3, 'false');
    expect(consoleMock).nthCalledWith(4, 'true');
    expect(consoleMock).nthCalledWith(5, 'false');
    expect(consoleMock).nthCalledWith(6, 'false');
    expect(consoleMock).nthCalledWith(7, 'false');
    expect(consoleMock).nthCalledWith(8, 'false');
    expect(consoleMock).nthCalledWith(9, 'false');
    expect(consoleMock).nthCalledWith(10, 'false');
    expect(consoleMock).nthCalledWith(11, 'true');
    expect(consoleMock).nthCalledWith(12, 'true');
    expect(consoleMock).nthCalledWith(13, 'false');
    expect(consoleMock).nthCalledWith(14, 'true');
    expect(consoleMock).nthCalledWith(15, 'true');
    expect(consoleMock).nthCalledWith(16, 'true');
    expect(consoleMock).nthCalledWith(17, 'true');
    expect(consoleMock).nthCalledWith(18, 'true');
  });

  it('not', () => {
    System.run(`
      print !true;
      print !false;
      print !!true;
    `);
    expect(consoleMock).nthCalledWith(1, 'false');
    expect(consoleMock).nthCalledWith(2, 'true');
    expect(consoleMock).nthCalledWith(3, 'true');
  });
});