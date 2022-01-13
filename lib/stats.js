import _ from 'lodash';
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

function generateCrashPointValuesOfInterest(start, end, step) {
  const crashPointValuesOfInterest = [];

  for (
    let crashPointValue = start;
    crashPointValue <= end;
    crashPointValue += step
  ) {
    crashPointValuesOfInterest.push(crashPointValue.toFixed(2));
  }

  return crashPointValuesOfInterest;
}

const crashPointValuesOfInterest = generateCrashPointValuesOfInterest(1.4, 3.5, 0.05);

function getCrashPointValuesProbabilities(sample) {
  const crashPointValuesProbabilities = crashPointValuesOfInterest.map((crashPointValue) => {
    const probability = sample.reduce((count, { value }) => {
      if (Number(value) > Number(crashPointValue)) {
        return count + 1;
      }
  
      return count;
    }, 0) / sample.length * 100;
  
    return {
      crashPointValue,
      probability
    }
  });

  return crashPointValuesProbabilities;
}



console.log(_.orderBy(getCrashPointValuesProbabilities(samplesRaw[5]), ['probability'], ['desc']));
