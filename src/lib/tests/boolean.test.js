import { afterEach, describe, it, expect, vi } from 'vitest';
import { System } from '../system.js';

describe('Booleans', () => {
  const consoleMock = vi.spyOn(console, 'log');

  afterEach(() => {
    consoleMock.mockClear();
  });

  it('equality', () => {
    System.run('print true == true;');
    expect(consoleMock).lastCalledWith('true');
    System.run('print true == false;');
    expect(consoleMock).lastCalledWith('false');
    System.run('print false == true;');
    expect(consoleMock).lastCalledWith('false');
    System.run('print false == false;');
    expect(consoleMock).lastCalledWith('true');

    System.run('print true == 1;');
    expect(consoleMock).lastCalledWith('false');
    System.run('print false == 0;');
    expect(consoleMock).lastCalledWith('false');
    System.run('print true == "true";');
    expect(consoleMock).lastCalledWith('false');
    System.run('print false == "false";');
    expect(consoleMock).lastCalledWith('false');
    System.run('print true == "";');
    expect(consoleMock).lastCalledWith('false');

    System.run('print true != true;');
    expect(consoleMock).lastCalledWith('false');
    System.run('print true != false;');
    expect(consoleMock).lastCalledWith('true');
    System.run('print false != true;');
    expect(consoleMock).lastCalledWith('true');
    System.run('print false != false;');
    expect(consoleMock).lastCalledWith('false');

    System.run('print true != 1;');
    expect(consoleMock).lastCalledWith('true');
    System.run('print false != 0;');
    expect(consoleMock).lastCalledWith('true');
    System.run('print true != "true";');
    expect(consoleMock).lastCalledWith('true');
    System.run('print false != "false";');
    expect(consoleMock).lastCalledWith('true');
    System.run('print false != "";');
    expect(consoleMock).lastCalledWith('true');
  });

  it('not', () => {
    System.run('print !true;');
    expect(consoleMock).lastCalledWith('false');
    System.run('print !false;');
    expect(consoleMock).lastCalledWith('true');
    System.run('print !!true;');
    expect(consoleMock).lastCalledWith('true');
  })
});