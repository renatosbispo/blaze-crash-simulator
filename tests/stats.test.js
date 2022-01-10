import { getEntrySignalCount } from '../lib/stats.js';

describe('Stats', () => {
  const samplesBinary = [
    [0, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 1, 1, 1],
    [1, 0, 1, 0],
    [1],
    [0],
    [],
  ];

  const entrySignal = [1, 1];

  test('getEntrySignalCount', () => {
    const expectedEntrySignalCounts = [1, 3, 0, 0, 0, 0];

    samplesBinary.forEach((sample, index) => {
      expect(getEntrySignalCount(entrySignal, sample)).toBe(expectedEntrySignalCounts[index]);
    })
  });
});
