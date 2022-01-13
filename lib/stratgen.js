import _ from 'lodash';
import {
  min,
  mean,
  sampleStandardDeviation,
  medianAbsoluteDeviation,
} from 'simple-statistics';
import {
  loadProgramData,
  CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH,
} from './filesystem.js';

const samplesRaw = loadProgramData(CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH).map(
  ({ data }) => data
);

const samplesBinary = samplesRaw.map((rawSample) => {
  return _.reverse(rawSample.map(({ isGood }) => (isGood ? 1 : 0)));
});

export function getEntrySignalCountAndPredictionProbability(
  entrySignal,
  sample
) {
  let entrySignalCount = 0;
  let rightPredictions = 0;

  for (
    let index = 0;
    index < sample.length - entrySignal.length + 1;
    index += 1
  ) {
    const sampleSection = sample.slice(index, index + entrySignal.length);

    if (JSON.stringify(sampleSection) === JSON.stringify(entrySignal)) {
      entrySignalCount += 1;
      if (sample[index + entrySignal.length] === 1) {
        rightPredictions += 1;
      }
    }
  }
  const predictionProbability =
    entrySignalCount > 0 ? (rightPredictions / entrySignalCount) * 100 : 0;

  return {
    entrySignalCount,
    predictionProbability,
  };
}

function getEntrySignalStats(entrySignal, samples = [...samplesBinary]) {
  const predictionProbabilities = [];
  const frequences = [];
  const stats = {};

  for (let sample of samples) {
    const { entrySignalCount, predictionProbability } =
      getEntrySignalCountAndPredictionProbability(entrySignal, sample);

    predictionProbabilities.push(predictionProbability);
    frequences.push(entrySignalCount);
  }

  if (samples.length > 1) {
    const predictionProbabilityMin = min(predictionProbabilities);

    const predictionProbabilityMean = mean(predictionProbabilities);

    const predictionProbabilityStandardDeviation = sampleStandardDeviation(
      predictionProbabilities
    );

    const predictionProbabilityMedianAbsoluteDeviation =
      medianAbsoluteDeviation(predictionProbabilities);

    const frequencesMean = mean(frequences);

    const frequencesStandardDeviation = sampleStandardDeviation(frequences);

    const score =
      (predictionProbabilityMean ** 2 /
        predictionProbabilityStandardDeviation ** 0.5) **
        2 *
      (frequencesMean / frequencesStandardDeviation);

    stats.score = score;
    stats.predictionProbabilityMin = predictionProbabilityMin;
    stats.predictionProbabilityMean = predictionProbabilityMean;
    stats.predictionProbabilityStandardDeviation =
      predictionProbabilityStandardDeviation;
    stats.predictionProbabilityMedianAbsoluteDeviation =
      predictionProbabilityMedianAbsoluteDeviation;
    stats.frequencesMean = frequencesMean;
    stats.frequencesStandardDeviation = frequencesStandardDeviation;
  } else {
    const predictionProbability = predictionProbabilities[0];
    const frequence = frequences[0];

    stats.score = predictionProbability ** 2 * frequence ** 0.5;
    stats.predictionProbability = predictionProbability;
    stats.frequence = frequence;
  }

  return stats;
}

function generateAllPossibleEntrySignals(length = 7) {
  const cartesian = (array) =>
    array.reduce((a, b) =>
      a.reduce((r, v) => r.concat(b.map((w) => [].concat(v, w))), [])
    );

  return cartesian(Array.from({ length }, (_) => [0, 1]));
}

// let desiredSample = samplesBinary[5];
// const halfLength = Math.ceil(desiredSample.length / 2);
// desiredSample = desiredSample.slice(halfLength);

const generatedEntrySignalsStats = generateAllPossibleEntrySignals().map(
  (sequence) => ({
    sequence: JSON.stringify(sequence),
    ...getEntrySignalStats(sequence),
  })
);

console.log(
  _.orderBy(
    generatedEntrySignalsStats.filter(({ predictionProbabilityMin }) => predictionProbabilityMin >= 40),
    // ['frequencesMean'],
    // ['desc'],
    ['predictionProbabilityMin'],
    ['desc']
  )
);
