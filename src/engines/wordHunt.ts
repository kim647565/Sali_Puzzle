export type Cell = { row: number; column: number };

export function generateGrid(words: string[], size: number, seed: number, diagonals = true): string[][] {
  if (words.some((word) => word.length > size || word.length < 2)) throw new Error("A word does not fit its grid.");
  const directions = diagonals
    ? [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]]
    : [[0, 1], [1, 0], [0, -1], [-1, 0]];
  const grid = Array.from({ length: size }, () => Array<string>(size).fill(""));
  const ordered = [...words].sort((a, b) => b.length - a.length);
  function random(max: number) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return Math.floor(seed / 4294967296 * max);
  }
  function place(index: number): boolean {
    const word = ordered[index];
    if (!word) return true;
    const slots: [number, number, number, number][] = [];
    for (let row = 0; row < size; row++) {
      for (let column = 0; column < size; column++) {
        for (const [dr, dc] of directions) {
          if ([...word].every((letter, i) => {
            const cell = grid[row + dr * i]?.[column + dc * i];
            return cell === "" || cell === letter;
          })) slots.push([row, column, dr, dc]);
        }
      }
    }
    while (slots.length) {
      const [row, column, dr, dc] = slots.splice(random(slots.length), 1)[0];
      const added: Cell[] = [];
      [...word].forEach((letter, i) => {
        const r = row + dr * i;
        const c = column + dc * i;
        if (!grid[r][c]) added.push({ row: r, column: c });
        grid[r][c] = letter;
      });
      if (place(index + 1)) return true;
      for (const cell of added) grid[cell.row][cell.column] = "";
    }
    return false;
  }
  if (!place(0)) throw new Error("The grid is too small for its words.");
  return grid.map((row) => row.map((letter) => letter || String.fromCharCode(65 + random(26))));
}

export function sameCell(first: Cell | null, second: Cell) {
  return first?.row === second.row && first.column === second.column;
}

export function selectionToWord(grid: string[][], start: Cell, end: Cell): { word: string; cells: Cell[] } | null {
  const rowDelta = end.row - start.row;
  const columnDelta = end.column - start.column;
  const length = Math.max(Math.abs(rowDelta), Math.abs(columnDelta)) + 1;
  if (length < 2) return null;
  const stepRow = rowDelta === 0 ? 0 : rowDelta / Math.abs(rowDelta);
  const stepColumn = columnDelta === 0 ? 0 : columnDelta / Math.abs(columnDelta);
  if (rowDelta !== 0 && columnDelta !== 0 && Math.abs(rowDelta) !== Math.abs(columnDelta)) return null;
  const cells = Array.from({ length }, (_, index) => ({ row: start.row + stepRow * index, column: start.column + stepColumn * index }));
  if (cells.some((cell) => !grid[cell.row]?.[cell.column])) return null;
  return { word: cells.map((cell) => grid[cell.row][cell.column]).join(""), cells };
}

export function findWordStart(grid: string[][], word: string, diagonals = true): Cell | null {
  for (const [row, letters] of grid.entries()) {
    for (const [column, letter] of letters.entries()) {
      if (letter !== word[0]) continue;
      const start = { row, column };
      for (const rowStep of [-1, 0, 1]) {
        for (const columnStep of [-1, 0, 1]) {
          if (!diagonals && rowStep && columnStep) continue;
          const end = { row: row + rowStep * (word.length - 1), column: column + columnStep * (word.length - 1) };
          if (selectionToWord(grid, start, end)?.word === word) return start;
        }
      }
    }
  }
  return null;
}
