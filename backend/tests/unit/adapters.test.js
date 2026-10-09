import { test, describe } from 'node:test';
import assert from 'node:assert';
import { languageFactory } from '../../src/languages/LanguageFactory.js';

describe('Language Adapters Unit Tests', () => {
  test('PythonAdapter detects missing colon syntax error', async () => {
    const adapter = languageFactory.getAdapter('python');
    const code = 'def test_func()\n    return 42';
    const result = await adapter.analyzeSyntax(code);

    assert.strictEqual(result.hasSyntaxError, true);
    assert.ok(result.errors.length > 0);
    assert.strictEqual(result.errors[0].line, 1);
  });

  test('PythonAdapter passes valid python syntax', async () => {
    const adapter = languageFactory.getAdapter('python');
    const code = 'def test_func():\n    return 42\n\nprint(test_func())';
    const result = await adapter.analyzeSyntax(code);

    assert.strictEqual(result.hasSyntaxError, false);
    assert.strictEqual(result.errors.length, 0);
  });

  test('JavaAdapter detects missing semicolon', async () => {
    const adapter = languageFactory.getAdapter('java');
    const code = 'public class Test {\n    public static void main(String[] args) {\n        int a = 10\n        System.out.println(a);\n    }\n}';
    const result = await adapter.analyzeSyntax(code);

    assert.strictEqual(result.hasSyntaxError, true);
    assert.ok(result.errors.some(e => e.message.includes('semicolon') || e.message.includes(';')));
  });

  test('CAdapter detects missing main function and missing semicolon', async () => {
    const adapter = languageFactory.getAdapter('c');
    const code = '#include <stdio.h>\nint x = 10';
    const result = await adapter.analyzeSyntax(code);

    assert.strictEqual(result.hasSyntaxError, true);
  });

  test('CppAdapter detects unbalanced braces', async () => {
    const adapter = languageFactory.getAdapter('cpp');
    const code = '#include <iostream>\nint main() {\n    std::cout << "Hello";\n';
    const result = await adapter.analyzeSyntax(code);

    assert.strictEqual(result.hasSyntaxError, true);
    assert.ok(result.errors.some(e => e.message.includes('brace')));
  });
});
