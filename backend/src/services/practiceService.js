import { Problem } from '../models/Problem.js';
import { Submission } from '../models/Submission.js';
import { sandboxManager } from '../sandbox/SandboxManager.js';
import { analyzerService } from './analyzerService.js';

export const INITIAL_PROBLEMS = [
  {
    title: 'Sum of Two Numbers',
    slug: 'sum-of-two-numbers',
    difficulty: 'Easy',
    topic: 'Basic Mathematics',
    order: 1,
    statement: `Given two integers **A** and **B**, calculate and print their sum.

This problem introduces you to reading standard input, parsing numbers, and printing standard output.`,
    inputFormat: 'Two integers A and B separated by a space on a single line.',
    outputFormat: 'Print the sum of A and B on a single line.',
    constraints: '-10^9 <= A, B <= 10^9',
    exampleCases: [
      {
        input: '5 7',
        output: '12',
        explanation: '5 + 7 = 12',
      },
      {
        input: '-3 8',
        output: '5',
        explanation: '-3 + 8 = 5',
      },
    ],
    hiddenTestCases: [
      { input: '10 20', output: '30' },
      { input: '-5 15', output: '10' },
      { input: '0 0', output: '0' },
      { input: '-10 -20', output: '-30' },
      { input: '100000000 200000000', output: '300000000' },
    ],
    starterCode: {
      python: `a, b = map(int, input().split())
print(a + b)
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println(a + b);
        }
        sc.close();
    }
}
`,
      c: `#include <stdio.h>

int main() {
    long long a, b;
    if (scanf("%lld %lld", &a, &b) == 2) {
        printf("%lld\\n", a + b);
    }
    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long a, b;
    if (cin >> a >> b) {
        cout << (a + b) << endl;
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 2) {
  const a = parseInt(input[0], 10);
  const b = parseInt(input[1], 10);
  console.log(a + b);
}
`,
    },
    supportedLanguages: ['python', 'java', 'c', 'cpp', 'javascript'],
  },

  {
    title: 'Prime Number',
    slug: 'prime-number',
    difficulty: 'Easy',
    topic: 'Number Theory',
    order: 2,
    statement: `Given an integer **N**, determine whether it is a prime number.

A prime number is an integer greater than 1 that has exactly two positive divisors: 1 and itself.`,
    inputFormat: 'A single integer N on one line.',
    outputFormat: 'Print "Prime" if N is prime; otherwise print "Not Prime".',
    constraints: '-10^9 <= N <= 10^9',
    exampleCases: [
      {
        input: '7',
        output: 'Prime',
        explanation: '7 is divisible only by 1 and 7.',
      },
      {
        input: '4',
        output: 'Not Prime',
        explanation: '4 is divisible by 1, 2, and 4.',
      },
    ],
    hiddenTestCases: [
      { input: '1', output: 'Not Prime' },
      { input: '2', output: 'Prime' },
      { input: '3', output: 'Prime' },
      { input: '9', output: 'Not Prime' },
      { input: '17', output: 'Prime' },
      { input: '0', output: 'Not Prime' },
      { input: '-7', output: 'Not Prime' },
      { input: '97', output: 'Prime' },
      { input: '100', output: 'Not Prime' },
    ],
    starterCode: {
      python: `import math

def is_prime(n):
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

n = int(input().strip())
print("Prime" if is_prime(n) else "Not Prime")
`,
      java: `import java.util.Scanner;

public class Main {
    public static boolean isPrime(int n) {
        if (n <= 1) return false;
        if (n <= 3) return true;
        if (n % 2 == 0 || n % 3 == 0) return false;
        for (int i = 5; i * i <= n; i += 6) {
            if (n % i == 0 || n % (i + 2) == 0) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            System.out.println(isPrime(n) ? "Prime" : "Not Prime");
        }
        sc.close();
    }
}
`,
      c: `#include <stdio.h>
#include <stdbool.h>

bool is_prime(long long n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (long long i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}

int main() {
    long long n;
    if (scanf("%lld", &n) == 1) {
        printf("%s\\n", is_prime(n) ? "Prime" : "Not Prime");
    }
    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;

bool isPrime(long long n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 == 0 || n % 3 == 0) return false;
    for (long long i = 5; i * i <= n; i += 6) {
        if (n % i == 0 || n % (i + 2) == 0) return false;
    }
    return true;
}

int main() {
    long long n;
    if (cin >> n) {
        cout << (isPrime(n) ? "Prime" : "Not Prime") << endl;
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
  const n = parseInt(input, 10);
  function isPrime(num) {
    if (num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0 || num % 3 === 0) return false;
    for (let i = 5; i * i <= num; i += 6) {
      if (num % i === 0 || num % (i + 2) === 0) return false;
    }
    return true;
  }
  console.log(isPrime(n) ? 'Prime' : 'Not Prime');
}
`,
    },
    supportedLanguages: ['python', 'java', 'c', 'cpp', 'javascript'],
  },

  {
    title: 'Odd or Even',
    slug: 'odd-or-even',
    difficulty: 'Easy',
    topic: 'Conditions',
    order: 3,
    statement: `Given an integer **N**, determine whether it is odd or even.`,
    inputFormat: 'A single integer N on one line.',
    outputFormat: 'Print "Even" if N is even; otherwise print "Odd".',
    constraints: '-10^9 <= N <= 10^9',
    exampleCases: [
      {
        input: '8',
        output: 'Even',
        explanation: '8 is divisible by 2 with no remainder.',
      },
      {
        input: '5',
        output: 'Odd',
        explanation: '5 is not divisible by 2.',
      },
    ],
    hiddenTestCases: [
      { input: '0', output: 'Even' },
      { input: '102', output: 'Even' },
      { input: '77', output: 'Odd' },
      { input: '-4', output: 'Even' },
      { input: '-13', output: 'Odd' },
      { input: '1000000', output: 'Even' },
    ],
    starterCode: {
      python: `n = int(input().strip())
print("Even" if n % 2 == 0 else "Odd")
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            System.out.println(n % 2 == 0 ? "Even" : "Odd");
        }
        sc.close();
    }
}
`,
      c: `#include <stdio.h>

int main() {
    long long n;
    if (scanf("%lld", &n) == 1) {
        printf("%s\\n", (n % 2 == 0) ? "Even" : "Odd");
    }
    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    long long n;
    if (cin >> n) {
        cout << ((n % 2 == 0) ? "Even" : "Odd") << endl;
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
  const n = parseInt(input, 10);
  console.log(n % 2 === 0 ? 'Even' : 'Odd');
}
`,
    },
    supportedLanguages: ['python', 'java', 'c', 'cpp', 'javascript'],
  },

  {
    title: 'Leap Year',
    slug: 'leap-year',
    difficulty: 'Easy',
    topic: 'Conditions',
    order: 4,
    statement: `Given a year **Y**, determine whether it is a leap year.

A year is a leap year if:
- It is divisible by 400, **OR**
- It is divisible by 4 but not divisible by 100.`,
    inputFormat: 'A single integer Y representing the year.',
    outputFormat: 'Print "Leap Year" if the year is a leap year; otherwise print "Not a Leap Year".',
    constraints: '1 <= Y <= 10000',
    exampleCases: [
      {
        input: '2024',
        output: 'Leap Year',
        explanation: '2024 is divisible by 4 and not divisible by 100.',
      },
      {
        input: '1900',
        output: 'Not a Leap Year',
        explanation: '1900 is divisible by 100 but not by 400.',
      },
    ],
    hiddenTestCases: [
      { input: '2000', output: 'Leap Year' },
      { input: '2023', output: 'Not a Leap Year' },
      { input: '2100', output: 'Not a Leap Year' },
      { input: '2400', output: 'Leap Year' },
      { input: '2016', output: 'Leap Year' },
      { input: '1999', output: 'Not a Leap Year' },
    ],
    starterCode: {
      python: `def is_leap_year(year):
    return (year % 400 == 0) or (year % 4 == 0 and year % 100 != 0)

y = int(input().strip())
print("Leap Year" if is_leap_year(y) else "Not a Leap Year")
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int y = sc.nextInt();
            boolean isLeap = (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0);
            System.out.println(isLeap ? "Leap Year" : "Not a Leap Year");
        }
        sc.close();
    }
}
`,
      c: `#include <stdio.h>

int main() {
    int y;
    if (scanf("%d", &y) == 1) {
        int isLeap = (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0);
        printf("%s\\n", isLeap ? "Leap Year" : "Not a Leap Year");
    }
    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int y;
    if (cin >> y) {
        bool isLeap = (y % 400 == 0) || (y % 4 == 0 && y % 100 != 0);
        cout << (isLeap ? "Leap Year" : "Not a Leap Year") << endl;
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (input) {
  const y = parseInt(input, 10);
  const isLeap = (y % 400 === 0) || (y % 4 === 0 && y % 100 !== 0);
  console.log(isLeap ? 'Leap Year' : 'Not a Leap Year');
}
`,
    },
    supportedLanguages: ['python', 'java', 'c', 'cpp', 'javascript'],
  },

  {
    title: 'Largest of Three Numbers',
    slug: 'largest-of-three-numbers',
    difficulty: 'Easy',
    topic: 'Conditions',
    order: 5,
    statement: `Given three integers **A**, **B**, and **C**, find and print the largest number among them.`,
    inputFormat: 'Three integers A, B, and C separated by spaces on a single line.',
    outputFormat: 'Print the largest integer on a single line.',
    constraints: '-10^9 <= A, B, C <= 10^9',
    exampleCases: [
      {
        input: '3 9 5',
        output: '9',
        explanation: '9 is strictly greater than 3 and 5.',
      },
      {
        input: '-10 -5 -20',
        output: '-5',
        explanation: '-5 is the maximum among -10, -5, -20.',
      },
    ],
    hiddenTestCases: [
      { input: '10 20 30', output: '30' },
      { input: '50 20 10', output: '50' },
      { input: '10 50 20', output: '50' },
      { input: '-5 -2 -10', output: '-2' },
      { input: '7 7 3', output: '7' },
      { input: '4 4 4', output: '4' },
      { input: '0 -10 5', output: '5' },
    ],
    starterCode: {
      python: `a, b, c = map(int, input().split())
print(max(a, b, c))
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            int c = sc.nextInt();
            System.out.println(Math.max(a, Math.max(b, c)));
        }
        sc.close();
    }
}
`,
      c: `#include <stdio.h>

int main() {
    long long a, b, c;
    if (scanf("%lld %lld %lld", &a, &b, &c) == 3) {
        long long maxVal = a;
        if (b > maxVal) maxVal = b;
        if (c > maxVal) maxVal = c;
        printf("%lld\\n", maxVal);
    }
    return 0;
}
`,
      cpp: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    long long a, b, c;
    if (cin >> a >> b >> c) {
        cout << max({a, b, c}) << endl;
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
if (input.length >= 3) {
  const a = parseInt(input[0], 10);
  const b = parseInt(input[1], 10);
  const c = parseInt(input[2], 10);
  console.log(Math.max(a, b, c));
}
`,
    },
    supportedLanguages: ['python', 'java', 'c', 'cpp', 'javascript'],
  },

  {
    title: 'Factorial',
    slug: 'factorial',
    difficulty: 'Easy',
    topic: 'Loops',
    order: 6,
    statement: `Given a non-negative integer **N**, calculate and print **N!** (N factorial).

By definition:
- 0! = 1
- For N > 0: N! = 1 * 2 * 3 * ... * N`,
    inputFormat: 'A single non-negative integer N on one line.',
    outputFormat: 'Print N! on a single line.',
    constraints: '0 <= N <= 20',
    exampleCases: [
      {
        input: '5',
        output: '120',
        explanation: '5! = 5 * 4 * 3 * 2 * 1 = 120',
      },
      {
        input: '0',
        output: '1',
        explanation: '0! is defined as 1.',
      },
    ],
    hiddenTestCases: [
      { input: '1', output: '1' },
      { input: '3', output: '6' },
      { input: '4', output: '24' },
      { input: '6', output: '720' },
      { input: '10', output: '3628800' },
      { input: '12', output: '479001600' },
    ],
    starterCode: {
      python: `def factorial(n):
    res = 1
    for i in range(2, n + 1):
        res *= i
    return res

n = int(input().strip())
print(factorial(n))
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            long res = 1;
            for (int i = 2; i <= n; i++) {
                res *= i;
            }
            System.out.println(res);
        }
        sc.close();
    }
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        long long res = 1;
        for (int i = 2; i <= n; i++) {
            res *= i;
        }
        printf("%lld\\n", res);
    }
    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (cin >> n) {
        long long res = 1;
        for (int i = 2; i <= n; i++) {
            res *= i;
        }
        cout << res << endl;
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (input !== '') {
  const n = parseInt(input, 10);
  let res = 1n;
  for (let i = 2n; i <= BigInt(n); i++) {
    res *= i;
  }
  console.log(res.toString());
}
`,
    },
    supportedLanguages: ['python', 'java', 'c', 'cpp', 'javascript'],
  },

  {
    title: 'Multiplication Table',
    slug: 'multiplication-table',
    difficulty: 'Easy',
    topic: 'Loops',
    order: 7,
    statement: `Given an integer **N**, print its multiplication table from 1 through 10.

Format each line exactly as:
\`N x i = <result>\` where i goes from 1 to 10.`,
    inputFormat: 'A single integer N on one line.',
    outputFormat: 'Print 10 lines. The i-th line should be "N x i = <result>".',
    constraints: '-10^4 <= N <= 10^4',
    exampleCases: [
      {
        input: '5',
        output: `5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
5 x 4 = 20
5 x 5 = 25
5 x 6 = 30
5 x 7 = 35
5 x 8 = 40
5 x 9 = 45
5 x 10 = 50`,
        explanation: 'Multiplication table of 5 from 1 to 10.',
      },
    ],
    hiddenTestCases: [
      {
        input: '2',
        output: `2 x 1 = 2
2 x 2 = 4
2 x 3 = 6
2 x 4 = 8
2 x 5 = 10
2 x 6 = 12
2 x 7 = 14
2 x 8 = 16
2 x 9 = 18
2 x 10 = 20`,
      },
      {
        input: '7',
        output: `7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70`,
      },
      {
        input: '0',
        output: `0 x 1 = 0
0 x 2 = 0
0 x 3 = 0
0 x 4 = 0
0 x 5 = 0
0 x 6 = 0
0 x 7 = 0
0 x 8 = 0
0 x 9 = 0
0 x 10 = 0`,
      },
    ],
    starterCode: {
      python: `n = int(input().strip())
for i in range(1, 11):
    print(f"{n} x {i} = {n * i}")
`,
      java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            for (int i = 1; i <= 10; i++) {
                System.out.println(n + " x " + i + " = " + (n * i));
            }
        }
        sc.close();
    }
}
`,
      c: `#include <stdio.h>

int main() {
    int n;
    if (scanf("%d", &n) == 1) {
        for (int i = 1; i <= 10; i++) {
            printf("%d x %d = %d\\n", n, i, n * i);
        }
    }
    return 0;
}
`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    int n;
    if (cin >> n) {
        for (int i = 1; i <= 10; i++) {
            cout << n << " x " << i << " = " << (n * i) << endl;
        }
    }
    return 0;
}
`,
      javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
if (input !== '') {
  const n = parseInt(input, 10);
  for (let i = 1; i <= 10; i++) {
    console.log(\`\${n} x \${i} = \${n * i}\`);
  }
}
`,
    },
    supportedLanguages: ['python', 'java', 'c', 'cpp', 'javascript'],
  },
];

export class PracticeService {
  /**
   * Seed the 7 practice problems idempotently
   */
  static async seedInitialProblems() {
    for (const p of INITIAL_PROBLEMS) {
      await Problem.findOneAndUpdate(
        { slug: p.slug },
        { $set: p },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[PracticeService] Seeded ${INITIAL_PROBLEMS.length} initial practice problems.`);
  }

  /**
   * Get filtered problems with user completion status
   */
  static async getProblems(userId, { difficulty, topic, language, search } = {}) {
    const query = { isActive: true };

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }
    if (topic && topic !== 'All') {
      query.topic = topic;
    }
    if (language && language !== 'All') {
      query.supportedLanguages = language;
    }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { statement: regex }, { topic: regex }];
    }

    const problems = await Problem.find(query).sort({ order: 1 });

    // Fetch user submissions to calculate isSolved and isAttempted
    let solvedSlugSet = new Set();
    let attemptedSlugSet = new Set();

    if (userId) {
      const userSubmissions = await Submission.find({ userId }).select('problemSlug status');
      for (const sub of userSubmissions) {
        attemptedSlugSet.add(sub.problemSlug);
        if (sub.status === 'Accepted') {
          solvedSlugSet.add(sub.problemSlug);
        }
      }
    }

    return problems.map((p) => {
      const pObj = p.toObject ? p.toObject() : p;
      delete pObj.hiddenTestCases;
      return {
        ...pObj,
        isSolved: solvedSlugSet.has(p.slug),
        isAttempted: attemptedSlugSet.has(p.slug),
      };
    });
  }

  /**
   * Get single problem by slug (safe without hidden test cases)
   */
  static async getProblemBySlug(slug, userId) {
    const problem = await Problem.findOne({ slug: slug.toLowerCase(), isActive: true });
    if (!problem) return null;

    let isSolved = false;
    let isAttempted = false;

    if (userId) {
      const userSubmissions = await Submission.find({ userId, problemSlug: slug });
      isAttempted = userSubmissions.length > 0;
      isSolved = userSubmissions.some((s) => s.status === 'Accepted');
    }

    const pObj = problem.toObject ? problem.toObject() : problem;
    delete pObj.hiddenTestCases;

    return {
      ...pObj,
      isSolved,
      isAttempted,
    };
  }

  /**
   * Normalize output string for reliable equality check (strip trailing whitespace & normalize CRLF to LF)
   */
  static normalizeOutput(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .trim()
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n');
  }

  /**
   * Helper to query problem by either slug or ObjectId safely without Mongoose CastError
   */
  static async findProblem(slugOrId) {
    if (!slugOrId) return null;
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    if (isObjectId) {
      return await Problem.findOne({ $or: [{ slug: slugOrId.toLowerCase() }, { _id: slugOrId }] });
    }
    return await Problem.findOne({ slug: slugOrId.toLowerCase() });
  }

  /**
   * Run code against sample visible example test cases (Experimentation)
   */
  static async runCode(slugOrId, { language, sourceCode }) {
    if (!sourceCode || !sourceCode.trim()) {
      throw new Error('Source code cannot be empty.');
    }

    const problem = await this.findProblem(slugOrId);
    if (!problem) {
      throw new Error('Problem not found.');
    }

    const validLangs = problem.supportedLanguages || ['python', 'java', 'c', 'cpp', 'javascript'];
    if (!validLangs.includes(language)) {
      throw new Error(`Language "${language}" is not supported for this problem.`);
    }

    const sandbox = sandboxManager.getSandbox();
    const results = [];
    let allPassed = true;
    let totalTimeMs = 0;
    let overallStatus = 'Accepted';

    for (let i = 0; i < problem.exampleCases.length; i++) {
      const testCase = problem.exampleCases[i];
      const execResult = await sandbox.execute({
        language,
        sourceCode,
        stdin: testCase.input,
        timeoutMs: 4000,
      });

      totalTimeMs += execResult.executionTimeMs || 0;
      const actualNormalized = this.normalizeOutput(execResult.stdout);
      const expectedNormalized = this.normalizeOutput(testCase.output);
      const passed = execResult.exitCode === 0 && actualNormalized === expectedNormalized;

      if (!passed) {
        allPassed = false;
        if (execResult.timedOut) {
          overallStatus = 'Time Limit Exceeded';
        } else if (execResult.isCompilationError) {
          overallStatus = 'Compilation Error';
        } else if (execResult.exitCode !== 0) {
          overallStatus = 'Runtime Error';
        } else {
          overallStatus = 'Wrong Answer';
        }
      }

      results.push({
        testCaseIndex: i + 1,
        input: testCase.input,
        expectedOutput: testCase.output,
        actualOutput: execResult.stdout || (execResult.stderr ? `Error: ${execResult.stderr}` : ''),
        passed,
        executionTimeMs: execResult.executionTimeMs || 0,
        error: execResult.stderr || null,
      });
    }

    // Run error analysis if any errors occurred
    let diagnostics = [];
    if (!allPassed) {
      try {
        const analysis = await analyzerService.analyzeCode({ language, sourceCode });
        diagnostics = analysis.errors || [];
      } catch (e) {
        // AI/analyzer diagnostics optional
      }
    }

    return {
      status: allPassed ? 'Accepted' : overallStatus,
      allPassed,
      totalTestCases: problem.exampleCases.length,
      passedTestCases: results.filter((r) => r.passed).length,
      executionTimeMs: totalTimeMs,
      sampleResults: results,
      diagnostics,
    };
  }

  /**
   * Submit code against hidden test suite & persist submission
   */
  static async submitCode(userId, slugOrId, { language, sourceCode }) {
    if (!sourceCode || !sourceCode.trim()) {
      throw new Error('Source code cannot be empty.');
    }

    const problem = await this.findProblem(slugOrId);
    if (!problem) {
      throw new Error('Problem not found.');
    }

    const validLangs = problem.supportedLanguages || ['python', 'java', 'c', 'cpp', 'javascript'];
    if (!validLangs.includes(language)) {
      throw new Error(`Language "${language}" is not supported for this problem.`);
    }

    const allTestCases = [
      ...(problem.exampleCases || []).map((c) => ({ input: c.input, output: c.output, isHidden: false })),
      ...(problem.hiddenTestCases || []).map((c) => ({ input: c.input, output: c.output, isHidden: true })),
    ];

    const sandbox = sandboxManager.getSandbox();
    let passedCount = 0;
    let totalTimeMs = 0;
    let finalStatus = 'Accepted';
    let sampleResults = [];
    let firstFailedError = null;

    for (let i = 0; i < allTestCases.length; i++) {
      const tc = allTestCases[i];
      const execResult = await sandbox.execute({
        language,
        sourceCode,
        stdin: tc.input,
        timeoutMs: 4000,
      });

      totalTimeMs += execResult.executionTimeMs || 0;
      const actualNormalized = this.normalizeOutput(execResult.stdout);
      const expectedNormalized = this.normalizeOutput(tc.output);
      const isCorrect = execResult.exitCode === 0 && actualNormalized === expectedNormalized;

      if (isCorrect) {
        passedCount++;
      } else {
        if (finalStatus === 'Accepted') {
          if (execResult.timedOut) {
            finalStatus = 'Time Limit Exceeded';
          } else if (execResult.isCompilationError) {
            finalStatus = 'Compilation Error';
          } else if (execResult.exitCode !== 0) {
            finalStatus = 'Runtime Error';
          } else {
            finalStatus = 'Wrong Answer';
          }
          firstFailedError = execResult.stderr || null;
        }
      }

      // Record visible sample results only (DO NOT leak hidden test cases!)
      if (!tc.isHidden) {
        sampleResults.push({
          testCaseIndex: i + 1,
          input: tc.input,
          expectedOutput: tc.output,
          actualOutput: execResult.stdout || (execResult.stderr ? `Error: ${execResult.stderr}` : ''),
          passed: isCorrect,
          executionTimeMs: execResult.executionTimeMs || 0,
          error: execResult.stderr || null,
        });
      }
    }

    // Run analyzer diagnostics if submission was not accepted
    let diagnostics = [];
    if (finalStatus !== 'Accepted') {
      try {
        const analysis = await analyzerService.analyzeCode({ language, sourceCode });
        diagnostics = analysis.errors || [];
      } catch (e) {
        // Ignore
      }
    }

    // Persist submission
    const submission = await Submission.create({
      userId,
      problemId: problem._id,
      problemSlug: problem.slug,
      language,
      sourceCode,
      status: finalStatus,
      passedTestCases: passedCount,
      totalTestCases: allTestCases.length,
      executionTimeMs: totalTimeMs,
      memoryUsageKb: 0,
      diagnostics,
      sampleResults,
    });

    return {
      submissionId: submission._id || submission.id,
      status: finalStatus,
      passedTestCases: passedCount,
      totalTestCases: allTestCases.length,
      executionTimeMs: totalTimeMs,
      sampleResults,
      diagnostics,
      createdAt: submission.createdAt,
    };
  }

  /**
   * User Progress Tracking
   */
  static async getProgress(userId) {
    const totalProblems = await Problem.countDocuments({ isActive: true });
    if (!userId) {
      return {
        solvedCount: 0,
        attemptedCount: 0,
        totalProblems,
        completionPercentage: 0,
        topicBreakdown: {},
        recentSubmissions: [],
      };
    }

    const userSubmissions = await Submission.find({ userId }).sort({ createdAt: -1 });

    const solvedSlugs = new Set();
    const attemptedSlugs = new Set();

    for (const sub of userSubmissions) {
      attemptedSlugs.add(sub.problemSlug);
      if (sub.status === 'Accepted') {
        solvedSlugs.add(sub.problemSlug);
      }
    }

    const solvedCount = solvedSlugs.size;
    const attemptedCount = attemptedSlugs.size;
    const completionPercentage = totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

    return {
      solvedCount,
      attemptedCount,
      totalProblems,
      completionPercentage,
      recentSubmissions: userSubmissions.slice(0, 10).map((s) => ({
        id: s._id || s.id,
        problemSlug: s.problemSlug,
        language: s.language,
        status: s.status,
        passedTestCases: s.passedTestCases,
        totalTestCases: s.totalTestCases,
        createdAt: s.createdAt,
      })),
    };
  }

  /**
   * Get user submission history
   */
  static async getSubmissions(userId, { problemSlug, limit = 20 } = {}) {
    const query = { userId };
    if (problemSlug) {
      query.problemSlug = problemSlug.toLowerCase();
    }
    return await Submission.find(query).sort({ createdAt: -1 }).limit(limit);
  }
}
