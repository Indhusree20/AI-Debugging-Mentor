import { test, describe } from 'node:test';
import assert from 'node:assert';
import { LanguageDetector } from '../../src/languages/LanguageDetector.js';

describe('LanguageDetector Unit Tests', () => {
  test('Accurately identifies Python code', () => {
    const code = `def calculate_average(scores):
    total = sum(scores)
    return total / len(scores)`;
    const result = LanguageDetector.detect(code);
    assert.strictEqual(result.language, 'python');
    assert.strictEqual(result.status, 'DETECTED');
    assert.ok(result.confidence > 0.85);
  });

  test('Accurately identifies JavaScript code', () => {
    const code = `const express = require('express');
const app = express();
app.get('/api', (req, res) => {
  res.json({ success: true });
});`;
    const result = LanguageDetector.detect(code);
    assert.strictEqual(result.language, 'javascript');
    assert.strictEqual(result.status, 'DETECTED');
  });

  test('Accurately identifies TypeScript code with interfaces', () => {
    const code = `interface UserProfile {
  id: string;
  age: number;
  isActive: boolean;
}
type Status = 'active' | 'inactive';`;
    const result = LanguageDetector.detect(code);
    assert.strictEqual(result.language, 'typescript');
    assert.strictEqual(result.status, 'DETECTED');
  });

  test('Accurately identifies Java code with class and main method', () => {
    const code = `public class Solution {
    public static void main(String[] args) {
        System.out.println("Hello World");
    }
}`;
    const result = LanguageDetector.detect(code);
    assert.strictEqual(result.language, 'java');
    assert.strictEqual(result.status, 'DETECTED');
  });

  test('Accurately identifies C++ code with iostream and std::', () => {
    const code = `#include <iostream>
#include <vector>
using namespace std;
int main() {
    cout << "Hello C++" << endl;
    return 0;
}`;
    const result = LanguageDetector.detect(code);
    assert.strictEqual(result.language, 'cpp');
    assert.strictEqual(result.status, 'DETECTED');
  });

  test('Accurately identifies SQL queries', () => {
    const code = `SELECT u.id, u.name, o.total 
FROM users u 
INNER JOIN orders o ON u.id = o.user_id 
WHERE o.total > 100 
GROUP BY u.id 
ORDER BY o.total DESC;`;
    const result = LanguageDetector.detect(code);
    assert.strictEqual(result.language, 'sql');
    assert.strictEqual(result.status, 'DETECTED');
  });

  test('Accurately identifies Go code', () => {
    const code = `package main
import "fmt"
func main() {
    msg := "Hello Go"
    fmt.Println(msg)
}`;
    const result = LanguageDetector.detect(code);
    assert.strictEqual(result.language, 'go');
    assert.strictEqual(result.status, 'DETECTED');
  });

  test('Handles empty input gracefully', () => {
    const result = LanguageDetector.detect('');
    assert.strictEqual(result.status, 'EMPTY_INPUT');
  });

  test('Flags ambiguous 1-line generic expressions honestly', () => {
    const result = LanguageDetector.detect('x = 42');
    assert.ok(result.status === 'AMBIGUOUS' || result.confidence < 0.80);
  });
});
