import { getEntrySignalCountAndPredictionProbability } from '../lib/stratgen.js';

describe('Stats', () => {
  const samplesBinary = [
    [1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 1],
    [1],
    [0],
    [],
  ];

  const entrySignal = [1, 0, 0];

  test('getEntrySignalCountAndPredictionProbability', () => {
    const expectedEntrySignalCounts = [4, 2, 2, 0, 0, 0, 0];
    const expectedEntrySignalPredictionProbabilities = [50, 100, 0, 0, 0, 0, 0];

    samplesBinary.forEach((sample, index) => {
      const { entrySignalCount, predictionProbability } =
        getEntrySignalCountAndPredictionProbability(entrySignal, sample);

      expect(entrySignalCount).toBe(expectedEntrySignalCounts[index]);
      expect(predictionProbability).toBe(expectedEntrySignalPredictionProbabilities[index]);
    });
  });
});
