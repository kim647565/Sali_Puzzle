export type Cell = { row: number; column: number };

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
