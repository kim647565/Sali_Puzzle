type Entry = readonly [row: number, column: number, down: 0 | 1];

export const crosswordLayouts: Record<string, readonly Entry[]> = {
  animals: [[3, 3, 0], [1, 0, 0], [0, 3, 1]],
  weather: [[3, 0, 0], [0, 4, 1], [1, 2, 0]],
  solar: [[3, 0, 0], [0, 2, 1], [1, 2, 0]],
  environment: [[1, 0, 0], [0, 4, 1], [1, 0, 1]],
  matter: [[4, 0, 0], [0, 3, 1], [2, 0, 1]],
  geography: [[3, 0, 0], [0, 1, 1], [0, 0, 0]],
  filipino: [[3, 0, 0], [1, 0, 1], [0, 2, 1]],
  science: [[7, 0, 0], [5, 0, 1], [0, 2, 1]],
  plants: [[0, 0, 0], [0, 4, 1], [2, 3, 0]],
  body: [[1, 0, 0], [4, 1, 0], [0, 3, 1]],
};
