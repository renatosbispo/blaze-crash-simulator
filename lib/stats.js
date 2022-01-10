import {
  min,
  max,
  mean,
  standardDeviation,
  sampleStandardDeviation,
} from 'simple-statistics';
import {
  loadProgramData,
  CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH,
} from './filesystem.js';

const samplesRaw = loadProgramData(CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH).map(
  ({ data }) => data
);

const samplesBinary = samplesRaw.map((rawSample) => {
  return rawSample.map(({ isGood }) => (isGood ? 1 : 0));
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

  return {
    entrySignalCount,
    predictionProbability: (rightPredictions / entrySignalCount) * 100,
  };
}

function getEntrySignalStats(entrySignal) {
  const entrySignalCountsPercentages = [];
  const entrySignalPredictionProbabilities = [];

  for (let sample of samplesBinary) {
    const { entrySignalCount, predictionProbability } =
      getEntrySignalCountAndPredictionProbability(entrySignal, sample);
    entrySignalCountsPercentages.push((entrySignalCount / sample.length) * 100);
    entrySignalPredictionProbabilities.push(predictionProbability);
  }

  const entrySignalPredictionProbabilityMin = min(
    entrySignalPredictionProbabilities
  );
  const entrySignalPredictionProbabilityMax = max(
    entrySignalPredictionProbabilities
  );
  const entrySignalPredictionProbabilityMean = mean(
    entrySignalPredictionProbabilities
  );
  const entrySignalPredictionProbabilityStandardDeviation = sampleStandardDeviation(
    entrySignalPredictionProbabilities
  );

  const entrySignalCountPercentageMin = min(entrySignalCountsPercentages);
  const entrySignalCountPercentageMax = max(entrySignalCountsPercentages);
  const entrySignalCountPercentageMean = mean(entrySignalCountsPercentages);
  const entrySignalCountPercentageStandardDeviation = sampleStandardDeviation(
    entrySignalCountsPercentages
  );

  return {
    entrySignalPredictionProbabilityMin,
    entrySignalPredictionProbabilityMax,
    entrySignalPredictionProbabilityMean,
    entrySignalPredictionProbabilityStandardDeviation,
    entrySignalCountPercentageMin,
    entrySignalCountPercentageMax,
    entrySignalCountPercentageMean,
    entrySignalCountPercentageStandardDeviation,
  };
}

// function getEntrySignalStats(entrySignal) {
//   const entrySignalCountsPercentages = [];

//   for (let sample of samplesBinary) {
//     const entrySignalCount = getEntrySignalCount(entrySignal, sample);
//     entrySignalCountsPercentages.push((entrySignalCount / sample.length) * 100);
//   }

//   const entrySignalPercentageMin = min(entrySignalCountsPercentages);
//   const entrySignalPercentageMax = max(entrySignalCountsPercentages);
//   const entrySignalPercentageMean = mean(entrySignalCountsPercentages);
//   const entrySignalPercentageStandardDeviation = standardDeviation(
//     entrySignalCountsPercentages
//   );

//   return {
//     entrySignalPercentageMin,
//     entrySignalPercentageMax,
//     entrySignalPercentageMean,
//     entrySignalPercentageStandardDeviation,
//   };
// }

function printEntrySignalStats(entrySignal) {
  console.log(JSON.stringify(entrySignal));

  let separator = '';

  for (let index = 0; index < entrySignal.length * 2 + 1; index += 1) {
    separator += '-';
  }

  console.log(separator);

  for (let [statName, statValue] of Object.entries(
    getEntrySignalStats(entrySignal)
  )) {
    console.log(`${statName}:`, `${statValue}`);
  }

  console.log('');
}

printEntrySignalStats([0, 1, 0, 1, 0]);
printEntrySignalStats([0, 0, 0, 0, 0, 0, 0]);
