import {
  CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH,
  loadProgramData,
} from './filesystem.js';

const samples = loadProgramData(CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH);

const initialBalance = 50;
const desiredStrategyIndex = 1;
const desiredSampleIndex = 5;

const strategies = [
  {
    parameters: {
      cashoutAt: 2.2,
      stopOnLoss: 0.5,
      betValue: 0.16,
      entrySignals: [
        [1, 1, 1, 0, 0, 1, 1],
        [0, 1, 0, 1, 1, 0, 1],
        [1, 0, 1, 1, 1, 0, 0],
      ],
    },
  },
  {
    parameters: {
      cashoutAt: 2.3,
      stopOnLoss: 0.5,
      betValue: 0.25,
      entrySignals: [
        [1, 1, 1, 0, 0, 1, 1],
        [1, 0, 1, 1, 1, 0, 0],
      ],
    },
  },
  {
    parameters: {
      cashoutAt: 1.55,
      stopOnLoss: 0.95,
      betValue: 0.16,
      entrySignals: [[0], [1]],
    },
  },
  {
    parameters: {
      cashoutAt: 1.4,
      stopOnLoss: 0.5,
      betValue: 0.16,
      entrySignals: [
        [1, 0, 1, 1, 1, 0, 0],
        [1, 1, 1, 0, 0, 1, 1],
        [0, 0, 1, 1, 1, 0, 1],
        [1, 1, 1, 1, 0, 1, 1],
        [0, 0, 0, 0, 1, 0, 1],
      ],
    },
  },
];

const sampleData = samples[desiredSampleIndex].data;
const sessionDurationInMs =
  sample.dataCollectionEndDate - sample.dataCollectionStartDate;
const sessionDurationInSeconds = Math.floor(sessionDurationInMs / 1000);
const sessionDurationInHours = sessionDurationInSeconds / 3600;

export default function simulateStrategy() {
  const {
    parameters: { cashoutAt, stopOnLoss, betValue, entrySignals },
  } = strategies[desiredStrategyIndex];

  let currentBalance = initialBalance;
  let currentBalanceStep = currentBalance;
  let nextBalanceStep = currentBalanceStep * 4;
  let crashPointsSequence = [];
  let shouldEnterRound = false;
  let roundsEntered = 0;
  let crashPointIndex = sampleData.length - 1;
  let shouldStop = false;
  let roundsWon = 0;
  let roundsLost = 0;
  let step = 0;
  let consecutivesBadCrashPoints = 0;

  for (; crashPointIndex > -1 && !shouldStop; step++) {
    const stepStopOnLoss = stopOnLoss * currentBalanceStep;
    const stepBetValue = betValue * stepStopOnLoss;
    let stepProfit = 0;

    console.log(`Step ${step + 1}`);
    console.log('============');
    console.log('stopOnLoss:', stepStopOnLoss);
    console.log('betValue:', stepBetValue);
    console.log();

    while (
      crashPointIndex > -1 &&
      currentBalance < nextBalanceStep &&
      !shouldStop
    ) {
      const crashPoint = sampleData[crashPointIndex];
      crashPointsSequence.push(crashPoint);

      if (shouldEnterRound) {
        roundsEntered++;
        if (crashPoint.value > cashoutAt) {
          const roundProfit = cashoutAt * stepBetValue - stepBetValue;
          currentBalance += roundProfit;
          stepProfit += roundProfit;
          roundsWon++;
        } else {
          currentBalance -= stepBetValue;
          stepProfit -= stepBetValue;
          roundsLost++;
        }

        const lastCrashPoints = crashPointsSequence.slice(
          crashPointsSequence.length - 10
        );

        const lastCrashPointsConvertedValues = lastCrashPoints.map(
          ({ isGood }) => (isGood ? 1 : 0)
        );

        console.log(
          `Round ${roundsEntered} (${crashPointIndex})`,
          crashPoint.value > cashoutAt ? '(WON)' : '(LOST)'
        );
        console.log('----------------------');
        console.log('crashPoint:', crashPoint);
        console.log(
          'lastCrashPoints:',
          JSON.stringify(lastCrashPointsConvertedValues)
        );
        console.log('currentBalance:', currentBalance);
        console.log('stepProfit:', stepProfit);
        console.log();

        if (stepProfit < 0 && Math.abs(stepProfit) >= stepStopOnLoss) {
          shouldStop = true;
        }
      }

      let gotSignalMatch = entrySignals.some((entrySignal) => {
        if (crashPointsSequence.length < entrySignal.length) {
          return false;
        }

        const crashPointsSequenceEndingSection = crashPointsSequence.slice(
          crashPointsSequence.length - entrySignal.length
        );

        const crashPointsSequenceEndingSectionConvertedValues =
          crashPointsSequenceEndingSection.map(({ isGood }) =>
            isGood ? 1 : 0
          );

        return (
          JSON.stringify(crashPointsSequenceEndingSectionConvertedValues) ===
          JSON.stringify(entrySignal)
        );
      });

      if (!crashPoint.isGood) {
        consecutivesBadCrashPoints += 1;
      } else {
        consecutivesBadCrashPoints = 0;
      }

      shouldEnterRound = gotSignalMatch && consecutivesBadCrashPoints < 8;

      crashPointIndex--;
    }

    if (currentBalance >= nextBalanceStep) {
      currentBalanceStep = currentBalance;
      nextBalanceStep = currentBalanceStep * 4;
    }
  }

  console.log('Simulation Results:\n');
  console.log('crashPointIndex:', crashPointIndex);
  console.log('steps:', step);
  console.log('roundsEntered:', roundsEntered);
  console.log('roundsWon:', roundsWon);
  console.log('roundsLost:', roundsLost);
  console.log('roundsSuccessRate:', roundsWon / roundsEntered);
  console.log(`Profit: ${currentBalance - initialBalance}`);
}
