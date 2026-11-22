// GATE CSE-style practice questions for 2010 to 2016.
// These are original questions. Each one is generated from a template with year-specific numbers,
// and the answer is computed in code. No official paper text is copied.
// They are built in the browser after sign-in (this module is loaded on demand) and are never
// written to storage.

import { PRACTICE_YEARS, PRACTICE_PER_YEAR } from './pyqMeta.js'

export { PRACTICE_YEARS, PRACTICE_PER_YEAR, PRACTICE_COUNT, isPractice } from './pyqMeta.js'

// Small seeded random generator, so every year always produces the same set.
function makeRandom(seed) {
  let s = seed >>> 0 || 1
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

const pick = (r, values) => values[Math.floor(r() * values.length)]

function fibonacci(n) {
  let a = 0
  let b = 1
  for (let i = 0; i < n; i += 1) [a, b] = [b, a + b]
  return a
}

function catalan(n) {
  let c = 1
  for (let i = 0; i < n; i += 1) c = (c * 2 * (2 * i + 1)) / (i + 2)
  return c
}


function factorial(n) {
  let f = 1
  for (let i = 2; i <= n; i += 1) f *= i
  return f
}

function choose(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k))
}

// FIFO page replacement: counts the faults for a reference string.
function fifoFaults(refs, frames) {
  const memory = []
  let faults = 0
  for (const page of refs) {
    if (memory.includes(page)) continue
    faults += 1
    if (memory.length === frames) memory.shift()
    memory.push(page)
  }
  return faults
}

// Four answer choices (A to D): the correct value plus plausible wrong ones, in a seeded order.
function buildOptions(r, answer) {
  const match = String(answer).match(/^(-?\d+(?:\.\d+)?)(?:\s+(.+))?$/)
  const text = (value) => String(value)
  let format = text
  let value = null
  let wrong = []
  if (match) {
    value = Number(match[1])
    const decimals = (match[1].split('.')[1] || '').length
    const unit = match[2] ? ` ${match[2]}` : ''
    format = (v) => `${decimals ? v.toFixed(decimals) : Math.round(v)}${unit}`
    const step = decimals ? 10 ** -decimals : 1
    wrong = decimals
      ? [value + step, value - step, value + 2 * step, value - 2 * step, 1 - value, value / 2]
      : [value * 2, Math.floor(value / 2), value + 1, value - 1, value + 2, value * 4, value - 2, value + 3]
    wrong = wrong.filter((v) => Number.isFinite(v) && (decimals ? v >= 0 && v <= 1 : v > 0))
  }
  const seen = new Set([format(value ?? answer)])
  const picked = []
  for (const candidate of wrong) {
    const label = format(candidate)
    if (!seen.has(label)) {
      seen.add(label)
      picked.push(label)
    }
    if (picked.length === 3) break
  }
  for (let extra = 4; picked.length < 3 && value !== null; extra += 1) {
    const label = format(value + extra)
    if (!seen.has(label)) {
      seen.add(label)
      picked.push(label)
    }
  }
  const all = [format(value ?? answer), ...picked]
  for (let i = all.length - 1; i > 0; i -= 1) {
    const j = Math.floor(r() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  const keys = ['A', 'B', 'C', 'D']
  const options = all.map((label, i) => ({ key: keys[i], text: label }))
  const correct = options.find((o) => o.text === format(value ?? answer))
  return { options, correctKey: correct.key, correctText: correct.text }
}

const TEMPLATES = [
  {
    subject: 'Discrete Mathematics',
    tags: ['graph-theory', 'spanning-tree'],
    make(r) {
      const n = pick(r, [4, 5, 6, 7])
      return {
        marks: 1,
        title: `How many spanning trees does the complete graph K${n} have?`,
        answer: String(n ** (n - 2)),
        explain: `By Cayley's formula, Kₙ has n^(n−2) spanning trees. For n = ${n}: ${n}^${n - 2} = ${n ** (n - 2)}.`,
      }
    },
  },
  {
    subject: 'Data Structures',
    tags: ['binary-search-tree', 'catalan'],
    make(r) {
      const n = pick(r, [3, 4, 5, 6])
      return {
        marks: 2,
        title: `How many structurally distinct binary search trees can be formed using ${n} distinct keys?`,
        answer: String(catalan(n)),
        explain: `The count is the nth Catalan number, Cₙ = (2n)! / ((n+1)! · n!). For n = ${n}, the value is ${catalan(n)}.`,
      }
    },
  },
  {
    subject: 'Data Structures',
    tags: ['binary-tree', 'height'],
    make(r) {
      const h = pick(r, [3, 4, 5, 6, 7, 8])
      return {
        marks: 1,
        title: `What is the maximum number of nodes in a binary tree of height ${h}, where the root has height 0?`,
        answer: String(2 ** (h + 1) - 1),
        explain: `Level i holds at most 2^i nodes. Summing levels 0 to ${h} gives 2^(${h}+1) − 1 = ${2 ** (h + 1) - 1}.`,
      }
    },
  },
  {
    subject: 'Computer Organization',
    tags: ['cache', 'set-associative'],
    make(r) {
      const lines = pick(r, [32, 64, 128, 256])
      const ways = pick(r, [2, 4, 8])
      return {
        marks: 1,
        title: `A cache has ${lines} lines and is ${ways}-way set associative. How many sets does it have?`,
        answer: String(lines / ways),
        explain: `Number of sets = lines ÷ associativity = ${lines} ÷ ${ways} = ${lines / ways}.`,
      }
    },
  },
  {
    subject: 'Computer Organization',
    tags: ['cache', 'tag-bits'],
    make(r) {
      const sets = pick(r, [64, 128, 256, 512])
      const block = pick(r, [16, 32, 64])
      const setBits = Math.log2(sets)
      const offsetBits = Math.log2(block)
      return {
        marks: 2,
        title: `A 32-bit address is split for a cache with ${sets} sets and a block size of ${block} bytes. How many tag bits are there?`,
        answer: String(32 - setBits - offsetBits),
        explain: `Offset bits = log₂(${block}) = ${offsetBits}. Index bits = log₂(${sets}) = ${setBits}. Tag bits = 32 − ${setBits} − ${offsetBits} = ${32 - setBits - offsetBits}.`,
      }
    },
  },
  {
    subject: 'Theory of Computation',
    tags: ['dfa', 'minimisation'],
    make(r) {
      const m = pick(r, [2, 3, 4, 5, 6, 7, 8, 9])
      return {
        marks: 1,
        title: `What is the minimum number of states in a DFA that accepts exactly the strings whose length is a multiple of ${m}?`,
        answer: String(m),
        explain: `The DFA must track the length modulo ${m}, which has ${m} residues. All ${m} states are distinguishable, so ${m} is the minimum.`,
      }
    },
  },
  {
    subject: 'Discrete Mathematics',
    tags: ['counting', 'fibonacci'],
    make(r) {
      const n = pick(r, [3, 4, 5, 6, 7])
      return {
        marks: 2,
        title: `How many binary strings of length ${n} contain no two consecutive 1s?`,
        answer: String(fibonacci(n + 2)),
        explain: `Let aₙ be the count. Then aₙ = aₙ₋₁ + aₙ₋₂, which gives Fibonacci numbers shifted by two. For n = ${n}, the answer is F(${n + 2}) = ${fibonacci(n + 2)}.`,
      }
    },
  },
  {
    subject: 'Engineering Mathematics',
    tags: ['probability', 'independence'],
    make(r) {
      const p = pick(r, [0.2, 0.3, 0.4, 0.5, 0.6])
      const q = pick(r, [0.2, 0.3, 0.4, 0.5, 0.6])
      const value = Number((p + q - p * q).toFixed(2))
      return {
        marks: 1,
        title: `If P(A) = ${p} and P(B) = ${q}, and A and B are independent, what is P(A ∪ B)?`,
        answer: String(value),
        explain: `P(A ∪ B) = P(A) + P(B) − P(A)·P(B) = ${p} + ${q} − ${(p * q).toFixed(2)} = ${value}.`,
      }
    },
  },
  {
    subject: 'Operating Systems',
    tags: ['deadlock', 'resources'],
    make(r) {
      const n = pick(r, [2, 3, 4, 5])
      const k = pick(r, [2, 3, 4])
      return {
        marks: 2,
        title: `${n} processes share identical resource instances, and each process needs at most ${k} instances at a time. What is the minimum number of instances that guarantees no deadlock?`,
        answer: String(n * (k - 1) + 1),
        explain: `In the worst case, every process holds k − 1 = ${k - 1} instances. One more instance lets one process finish. So the minimum is ${n}×${k - 1} + 1 = ${n * (k - 1) + 1}.`,
      }
    },
  },
  {
    subject: 'Algorithms',
    tags: ['merge-sort', 'comparisons'],
    make(r) {
      const k = pick(r, [3, 4, 5, 6, 7, 8])
      const n = 2 ** k
      return {
        marks: 2,
        title: `What is the worst-case number of element comparisons when merge sort sorts ${n} elements?`,
        answer: String(n * k - n + 1),
        explain: `For n = 2^k, the worst case is n·k − n + 1. With k = ${k}: ${n}×${k} − ${n} + 1 = ${n * k - n + 1}.`,
      }
    },
  },
  {
    subject: 'Operating Systems',
    tags: ['paging', 'page-table'],
    make(r) {
      const pageShift = pick(r, [12, 13, 14, 15])
      const entryBytes = pick(r, [2, 4, 8])
      const bytes = 2 ** (32 - pageShift) * entryBytes
      const size = bytes >= 2 ** 20 ? `${bytes / 2 ** 20} MB` : `${bytes / 2 ** 10} KB`
      return {
        marks: 2,
        title: `A 32-bit virtual address space uses pages of 2^${pageShift} bytes, and each page-table entry is ${entryBytes} bytes. What is the size of a single-level page table?`,
        answer: size,
        explain: `Number of entries = 2^(32 − ${pageShift}) = 2^${32 - pageShift}. Size = 2^${32 - pageShift} × ${entryBytes} bytes = ${size}.`,
      }
    },
  },
  {
    subject: 'Computer Networks',
    tags: ['ipv4', 'subnetting'],
    make(r) {
      const prefix = pick(r, [22, 23, 24, 25, 26, 27, 28])
      const hosts = 2 ** (32 - prefix) - 2
      return {
        marks: 1,
        title: `How many usable host addresses are there in an IPv4 subnet with prefix /${prefix}?`,
        answer: String(hosts),
        explain: `Host bits = 32 − ${prefix} = ${32 - prefix}. Usable hosts = 2^${32 - prefix} − 2 = ${hosts}, excluding the network and broadcast addresses.`,
      }
    },
  },
  {
    subject: 'Digital Logic',
    tags: ['boolean-functions', 'truth-table'],
    make(r) {
      const n = pick(r, [2, 3, 4, 5])
      return {
        marks: 1,
        title: `How many distinct Boolean functions exist with ${n} input variables?`,
        answer: String(2 ** (2 ** n)),
        explain: `There are 2^${n} rows in the truth table, so each function is one of 2^(2^${n}) possible output columns. That is ${2 ** (2 ** n)}.`,
      }
    },
  },
  {
    subject: 'Discrete Mathematics',
    tags: ['relations', 'reflexive'],
    make(r) {
      const n = pick(r, [2, 3, 4, 5])
      return {
        marks: 1,
        title: `How many reflexive relations are there on a set with ${n} elements?`,
        answer: String(2 ** (n * n - n)),
        explain: `A reflexive relation must contain all ${n} diagonal pairs. The other ${n * n - n} pairs are free, so the count is 2^(${n * n - n}) = ${2 ** (n * n - n)}.`,
      }
    },
  },
  {
    subject: 'Algorithms',
    tags: ['binary-search', 'comparisons'],
    make(r) {
      const k = pick(r, [3, 4, 5, 6, 7, 8, 9, 10])
      const n = 2 ** k - 1
      return {
        marks: 1,
        title: `What is the maximum number of comparisons binary search makes on a sorted array of ${n} elements?`,
        answer: String(k),
        explain: `Each comparison halves the range. An array of 2^${k} − 1 = ${n} elements needs at most ⌊log₂ ${n}⌋ + 1 = ${k} comparisons.`,
      }
    },
  },
  {
    subject: 'Data Structures',
    tags: ['heap', 'height'],
    make(r) {
      const n = pick(r, [10, 20, 40, 64, 100, 500, 1000, 2000])
      const h = Math.floor(Math.log2(n))
      return {
        marks: 1,
        title: `What is the height of a binary heap that stores ${n} elements, where a single node has height 0?`,
        answer: String(h),
        explain: `A heap is a complete binary tree, so its height is ⌊log₂ n⌋. For n = ${n}, that is ${h}.`,
      }
    },
  },
  {
    subject: 'Data Structures',
    tags: ['avl-tree', 'height'],
    make(r) {
      const h = pick(r, [3, 4, 5, 6, 7])
      const counts = [1, 2]
      for (let i = 2; i <= h; i += 1) counts.push(counts[i - 1] + counts[i - 2] + 1)
      return {
        marks: 2,
        title: `What is the minimum number of nodes in an AVL tree of height ${h}, where a single node has height 0?`,
        answer: String(counts[h]),
        explain: `Let N(h) be the minimum. N(h) = N(h−1) + N(h−2) + 1 with N(0) = 1 and N(1) = 2. This gives N(${h}) = ${counts[h]}.`,
      }
    },
  },
  {
    subject: 'Discrete Mathematics',
    tags: ['graph-theory', 'complete-graph'],
    make(r) {
      const n = pick(r, [6, 8, 10, 12, 15, 20])
      return {
        marks: 1,
        title: `How many edges does the complete graph K${n} have?`,
        answer: String((n * (n - 1)) / 2),
        explain: `Every pair of vertices is joined once, so the count is C(${n}, 2) = ${n}×${n - 1}/2 = ${(n * (n - 1)) / 2}.`,
      }
    },
  },
  {
    subject: 'Discrete Mathematics',
    tags: ['relations', 'symmetric'],
    make(r) {
      const n = pick(r, [2, 3, 4, 5])
      const free = (n * (n + 1)) / 2
      return {
        marks: 1,
        title: `How many symmetric relations are there on a set with ${n} elements?`,
        answer: String(2 ** free),
        explain: `A symmetric relation is fixed by the ${n} diagonal pairs and the ${(n * (n - 1)) / 2} unordered off-diagonal pairs, which is ${free} independent choices. The count is 2^${free} = ${2 ** free}.`,
      }
    },
  },
  {
    subject: 'Discrete Mathematics',
    tags: ['counting', 'circular-permutation'],
    make(r) {
      const n = pick(r, [5, 6, 7, 8, 9])
      return {
        marks: 1,
        title: `In how many distinct ways can ${n} people be seated around a circular table, if rotations of an arrangement are treated as the same?`,
        answer: String(factorial(n - 1)),
        explain: `Fix one person to remove the rotations. The other ${n - 1} people can be arranged in (${n} − 1)! = ${factorial(n - 1)} ways.`,
      }
    },
  },
  {
    subject: 'Engineering Mathematics',
    tags: ['combinatorics', 'selection'],
    make(r) {
      const n = pick(r, [8, 9, 10, 12])
      const k = pick(r, [2, 3, 4])
      return {
        marks: 1,
        title: `In how many ways can a committee of ${k} be chosen from ${n} candidates?`,
        answer: String(choose(n, k)),
        explain: `Order does not matter, so the count is C(${n}, ${k}) = ${n}! / (${k}! · ${n - k}!) = ${choose(n, k)}.`,
      }
    },
  },
  {
    subject: 'Engineering Mathematics',
    tags: ['eigenvalues', 'trace'],
    make(r) {
      const [a, b, c] = [pick(r, [1, 2, 3, 4, 5]), pick(r, [2, 3, 4, 6]), pick(r, [1, 3, 5, 7])]
      return {
        marks: 1,
        title: `A 3×3 upper triangular matrix has diagonal entries ${a}, ${b} and ${c}. What is the sum of its eigenvalues?`,
        answer: String(a + b + c),
        explain: `The eigenvalues of a triangular matrix are its diagonal entries, so their sum is ${a} + ${b} + ${c} = ${a + b + c}. This is also the trace.`,
      }
    },
  },
  {
    subject: 'Computer Networks',
    tags: ['bandwidth-delay', 'link'],
    make(r) {
      const bw = pick(r, [10, 20, 50, 100])
      const delay = pick(r, [5, 10, 20, 40])
      return {
        marks: 1,
        title: `A link has a bandwidth of ${bw} Mbps and a one-way propagation delay of ${delay} ms. What is its bandwidth-delay product?`,
        answer: `${bw * delay} kilobits`,
        explain: `Bandwidth-delay product = ${bw} Mbps × ${delay} ms = ${bw * delay} kilobits, because 1 Mbps × 1 ms = 1 kilobit.`,
      }
    },
  },
  {
    subject: 'Computer Networks',
    tags: ['go-back-n', 'sliding-window'],
    make(r) {
      const k = pick(r, [3, 4, 5, 6, 7])
      return {
        marks: 2,
        title: `A Go-Back-N sender uses ${k}-bit sequence numbers. What is the maximum sender window size that works correctly?`,
        answer: String(2 ** k - 1),
        explain: `Go-Back-N needs a window of at most 2^k − 1 so that old and new frames never share a sequence number. For k = ${k}, that is ${2 ** k - 1}.`,
      }
    },
  },
  {
    subject: 'Database Management',
    tags: ['relational-algebra', 'cartesian-product'],
    make(r) {
      const n = pick(r, [20, 30, 40, 50])
      const m = pick(r, [10, 15, 25])
      return {
        marks: 1,
        title: `Relation R has ${n} tuples and relation S has ${m} tuples. How many tuples does the Cartesian product R × S contain?`,
        answer: String(n * m),
        explain: `Each tuple of R pairs with every tuple of S, giving ${n} × ${m} = ${n * m} tuples.`,
      }
    },
  },
  {
    subject: 'Database Management',
    tags: ['keys', 'superkey'],
    make(r) {
      const n = pick(r, [3, 4, 5, 6, 7])
      return {
        marks: 2,
        title: `A relation has ${n} attributes, and one attribute A is a candidate key by itself. How many superkeys does the relation have?`,
        answer: String(2 ** (n - 1)),
        explain: `A superkey is any attribute set that contains A. The other ${n - 1} attributes can each be in or out, so there are 2^${n - 1} = ${2 ** (n - 1)} superkeys.`,
      }
    },
  },
  {
    subject: 'Compiler Design',
    tags: ['lexical-analysis', 'tokens'],
    make(r) {
      const k = pick(r, [3, 4, 5, 6, 7, 8])
      const names = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].slice(0, k)
      return {
        marks: 1,
        title: `How many tokens does a lexical analyser produce for the statement "x = ${names.join(' + ')};"?`,
        answer: String(2 * k + 2),
        explain: `The tokens are x, =, then ${k} identifiers with ${k - 1} plus signs between them (${2 * k - 1} tokens), and the semicolon. In total, 2 + ${2 * k - 1} + 1 = ${2 * k + 2}.`,
      }
    },
  },
  {
    subject: 'Programming in C',
    tags: ['arrays', 'row-major'],
    make(r) {
      const base = pick(r, [1000, 2000, 5000])
      const cols = pick(r, [4, 5, 6, 8])
      const i = pick(r, [1, 2, 3])
      const j = pick(r, [1, 2, 3])
      const rows = 6
      const address = base + 4 * (i * cols + j)
      return {
        marks: 2,
        title: `An int array a[${rows}][${cols}] is stored in row-major order starting at address ${base}, and an int takes 4 bytes. What is the address of a[${i}][${j}]?`,
        answer: String(address),
        explain: `Address = base + 4 × (i × columns + j) = ${base} + 4 × (${i} × ${cols} + ${j}) = ${address}.`,
      }
    },
  },
  {
    subject: 'Operating Systems',
    tags: ['page-replacement', 'fifo'],
    make(r) {
      const frames = pick(r, [3, 4])
      const refs = Array.from({ length: 12 }, () => Math.floor(r() * 6))
      const faults = fifoFaults(refs, frames)
      return {
        marks: 2,
        title: `A process uses ${frames} page frames with FIFO replacement and refers to pages in this order: ${refs.join(', ')}. How many page faults occur, counting the initial loads?`,
        answer: String(faults),
        explain: `Simulating FIFO with ${frames} frames, a fault occurs whenever the page is not already in memory. The reference string causes ${faults} faults.`,
      }
    },
  },
  {
    subject: 'Computer Organization',
    tags: ['pipeline', 'speedup'],
    make(r) {
      const stages = pick(r, [4, 5, 6])
      const n = pick(r, [20, 50, 100])
      return {
        marks: 1,
        title: `A ${stages}-stage pipeline with no stalls executes ${n} instructions. How many clock cycles does it need in total?`,
        answer: String(stages + n - 1),
        explain: `The first instruction takes ${stages} cycles and each later one completes one cycle after the previous. The total is k + n − 1 = ${stages} + ${n} − 1 = ${stages + n - 1}.`,
      }
    },
  },
  {
    subject: 'Digital Logic',
    tags: ['multiplexer', 'select-lines'],
    make(r) {
      const n = pick(r, [8, 16, 32, 64, 128, 256])
      return {
        marks: 1,
        title: `How many select lines does a ${n}:1 multiplexer need?`,
        answer: String(Math.log2(n)),
        explain: `The select lines must address ${n} inputs, so their number is log₂ ${n} = ${Math.log2(n)}.`,
      }
    },
  },
  {
    subject: 'Theory of Computation',
    tags: ['dfa', 'suffix'],
    make(r) {
      const k = pick(r, [2, 3, 4, 5, 6, 7])
      return {
        marks: 2,
        title: `What is the minimum number of states in a DFA over {0, 1} that accepts exactly the strings whose last ${k} symbols are all 1?`,
        answer: String(k + 1),
        explain: `The DFA only needs to remember how many 1s have just been read, from 0 up to ${k}. That is ${k + 1} distinguishable states.`,
      }
    },
  },
  {
    subject: 'Algorithms',
    tags: ['recurrence', 'divide-and-conquer'],
    make(r) {
      const k = pick(r, [3, 4, 5, 6, 7, 8])
      const n = 2 ** k
      return {
        marks: 2,
        title: `Let T(n) = 2T(n/2) + n with T(1) = 1. What is T(${n})?`,
        answer: String(n * k + n),
        explain: `Unrolling the recurrence for n = 2^k gives T(n) = n·log₂ n + n. With n = ${n}: ${n}×${k} + ${n} = ${n * k + n}.`,
      }
    },
  },
  {
    subject: 'Algorithms',
    tags: ['bubble-sort', 'swaps'],
    make(r) {
      const n = pick(r, [6, 8, 10, 12, 15, 20])
      return {
        marks: 1,
        title: `How many swaps does bubble sort perform on an array of ${n} distinct elements that is sorted in reverse order?`,
        answer: String((n * (n - 1)) / 2),
        explain: `Every pair is out of order, and each swap fixes exactly one inversion. There are C(${n}, 2) = ${(n * (n - 1)) / 2} inversions.`,
      }
    },
  },
]

const usedTitles = new Set()

function buildYear(year) {
  const questions = []
  for (let j = 0; j < PRACTICE_PER_YEAR; j += 1) {
    const templateIndex = ((year - PRACTICE_YEARS[0]) * 3 + j) % TEMPLATES.length
    const template = TEMPLATES[templateIndex]
    // Try a few seeds so that two questions never share the same wording and numbers.
    let r
    let made
    for (let attempt = 0; attempt < 40; attempt += 1) {
      r = makeRandom(year * 97 + j * 13 + 1 + attempt * 7919)
      made = template.make(r)
      if (!usedTitles.has(made.title)) break
    }
    usedTitles.add(made.title)
    const { options, correctKey, correctText } = buildOptions(r, made.answer)
    const id = `pyq-${year}-${j + 1}`
    // Posted across the February exam window, at a steady spread of morning and afternoon times.
    const createdAt = Date.UTC(year, 1, 1 + Math.floor(j / 3), 9 + (j % 3) * 3, (j * 7) % 60)
    questions.push({
      id,
      title: made.title,
      body: '',
      subject: template.subject,
      topic: template.tags[0],
      tags: [`gate-${year}`, ...template.tags],
      images: [],
      author: 'GateQ practice',
      createdAt,
      votes: 0,
      voters: {},
      views: 0,
      year,
      number: j + 1,
      marks: made.marks,
      kind: 'MCQ',
      options,
      readonly: true,
      answers: [
        {
          id: `key-${id}`,
          body: `Answer: (${correctKey}) ${correctText}\n\n${made.explain}`,
          images: [],
          author: 'GateQ answer key',
          createdAt: createdAt + 2 * 60 * 60 * 1000,
          votes: 0,
          voters: {},
          comments: [],
        },
      ],
      comments: [],
    })
  }
  return questions
}

// Built once when the module loads. Nothing here is saved to storage.
export const PRACTICE_QUESTIONS = PRACTICE_YEARS.flatMap(buildYear)
