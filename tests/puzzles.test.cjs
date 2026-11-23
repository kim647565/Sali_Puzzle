const { levels } = require("../src/data/levels");
const { crosswordGrid, clueCells, writeClue } = require("../src/engines/crossword");
const { findWordStart, generateGrid, selectionToWord } = require("../src/engines/wordHunt");
const { scoreRound } = require("../src/engines/round");

test.each(levels.map((level) => [level.id, level]))("valid word hunt and connected crossword for %s", (_, level) => {
  const size = { Easy: 5, Medium: 8, Hard: 12 }[level.difficulty];
  expect(level.grid).toHaveLength(size);
  expect(level.grid.every((row) => row.length === size)).toBe(true);
  for (const word of level.huntWords) {
    const start = findWordStart(level.grid, word, level.difficulty !== "Easy");
    expect(start).not.toBeNull();
    const candidates = level.grid.flatMap((row, r) => row.map((_, column) => ({ row: r, column })));
    const end = candidates.find((candidate) => (level.difficulty !== "Easy" || candidate.row === start.row || candidate.column === start.column) && selectionToWord(level.grid, start, candidate)?.word === word);
    expect(end).toBeDefined();
    expect(selectionToWord(level.grid, end, start).word).toBe([...word].reverse().join(""));
  }
  expect(level.clues.map((clue) => clue.answer).sort()).toEqual([...level.huntWords].sort());
  const { cells } = crosswordGrid(level.clues);
  expect(cells.size).toBeLessThan(level.clues.reduce((sum, clue) => sum + clue.answer.length, 0));
  const connected = new Set([level.clues[0]]);
  for (let pass = 0; pass < level.clues.length; pass++) {
    for (const cell of cells.values()) {
      if (cell.clues.some((clue) => connected.has(clue))) cell.clues.forEach((clue) => connected.add(clue));
    }
  }
  expect(connected.size).toBe(level.clues.length);
  for (const clue of level.clues) {
    expect(clueCells(clue).map(({ key }) => cells.get(key).letter).join("")).toBe(clue.answer);
    expect(cells.get(clueCells(clue)[0].key).number).toBe(clue.number);
  }
  for (const cell of cells.values()) {
    for (const [direction, dr, dc] of [["across", 0, 1], ["down", 1, 0]]) {
      const neighbor = cells.get(`${cell.row + dr}:${cell.column + dc}`);
      if (neighbor) expect(cell.clues.some((clue) => clue.direction === direction && neighbor.clues.includes(clue))).toBe(true);
    }
  }
});

test("grid generation is reproducible and rejects words that cannot fit", () => {
  expect(generateGrid(["SUN"], 5, 21)).toEqual(generateGrid(["SUN"], 5, 21));
  expect(generateGrid(["SUN"], 5, 21)).not.toEqual(generateGrid(["SUN"], 5, 22));
  expect(() => generateGrid(["HYPOTHESIS"], 5, 4)).toThrow();
  expect(selectionToWord(levels[0].grid, { row: 0, column: 0 }, { row: 2, column: 1 })).toBeNull();
  expect(selectionToWord(levels[0].grid, { row: 0, column: 0 }, { row: 0, column: 10 })).toBeNull();
});

test("writing to a crossing cannot overwrite a locked letter", () => {
  const clue = levels[0].clues.find((item) => item.answer === "ROOTS");
  const crossing = clueCells(clue).at(-1).key;
  expect(writeClue(clue, "ROOTT", { [crossing]: "S" }, new Set([crossing]))[crossing]).toBe("S");
});

test.each([[0, 3, 100], [1, 2, 600 / 7], [2, 2, 75], [3, 1, 600 / 9]])("score and stars with %s wrong attempts", (wrong, stars, accuracy) => {
  const result = scoreRound({ found: { A: [], B: [], C: [] }, solved: [1, 2, 3], wrong }, "date");
  expect(result.score).toBe(600);
  expect(result.stars).toBe(stars);
  expect(result.accuracy).toBeCloseTo(accuracy);
});
