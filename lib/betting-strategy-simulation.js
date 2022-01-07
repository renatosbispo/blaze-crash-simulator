import {
  CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH,
  loadProgramData,
} from './filesystem.js';

const initialBalance = 50;
const numberOfRuns = 5;

const sample = loadProgramData(CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH)[0];
const sampleData = sample.data;
const sessionDurationInMs =
  sample.dataCollectionEndDate - sample.dataCollectionStartDate;
const sessionDurationInSeconds = Math.floor(sessionDurationInMs / 1000);
const sessionDurationInHours = sessionDurationInSeconds / 3600;

const strategies = [
  {
    parameters: {
      cashoutAt: 10,
      stopOnProfit: 10,
      stopOnLoss: 20,
      betValue: 0.2,
      entrySignals: [[0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0]],
    },
  },
  {
    parameters: {
      cashoutAt: 2.8,
      stopOnProfit: 0.5,
      stopOnLoss: 0.25,
      betValue: 0.2,
      entrySignals: [[0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0]],
    },
  },
  {
    parameters: {
      cashoutAt: 120,
      stopOnProfit: 0.5,
      stopOnLoss: 0.25,
      betValue: 0.2,
      entrySignals: [[0, 1, 0, 1, 0], [0, 0, 0, 0, 0, 0]],
    },
  }
];

export default function simulateStrategy() {
  const {
    parameters: { cashoutAt, stopOnProfit, stopOnLoss, betValue, entrySignals },
  } = strategies[1];

  let currentBalance = initialBalance;
  let runsWon = 0;
  let runsLost = 0;
  let crashPointsSequence = [];
  let shouldEnterRound = false;
  let roundsEntered = 0;
  let crashPointIndex = sampleData.length - 1;

  for (
    let i = 0;
    i < numberOfRuns && crashPointIndex > -1;
    i++
  ) {
    const runStopOnProfit = stopOnProfit < 1 ? stopOnProfit * currentBalance : stopOnProfit;
    const runStopOnLoss = stopOnLoss < 1 ? stopOnLoss * currentBalance : stopOnLoss;
    const runBetValue =
      runStopOnLoss * betValue > 0.2 ? runStopOnLoss * betValue : 0.2;
    let wonRun = false;
    let lostRun = false;
    let runProfit = 0;

    console.log(`Run ${i + 1}`);
    console.log('============');
    console.log('stopOnProfit:', runStopOnProfit);
    console.log('stopOnLoss:', runStopOnLoss);
    console.log('betValue:', runBetValue);
    console.log();

    while (crashPointIndex > -1 && !wonRun && !lostRun) {
      const crashPoint = sampleData[crashPointIndex];
      crashPointsSequence.push(crashPoint);

      if (shouldEnterRound) {
        roundsEntered++;
        if (crashPoint.value > cashoutAt) {
          const roundProfit = cashoutAt * runBetValue - runBetValue;
          currentBalance += roundProfit;
          runProfit += roundProfit;
        } else {
          currentBalance -= runBetValue;
          runProfit -= runBetValue;
        }
        console.log(`Round ${roundsEntered + 1}`, crashPoint.value > cashoutAt ? '(WON)' : '(LOST)');
        console.log('----------------------')
        console.log('crashPoint:', crashPoint);
        console.log('currentBalance:', currentBalance);
        console.log('runProfit:', runProfit);
        console.log();

        if (runProfit >= runStopOnProfit) {
          wonRun = true;
          runsWon += 1;
        } else if (runProfit < 0 && Math.abs(runProfit) >= runStopOnLoss) {
          lostRun = true;
          runsLost += 1;
        }
      }

      shouldEnterRound = entrySignals.some((entrySignal) => {
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

      crashPointIndex--;
    }
  }
  console.log('Simulation Results:\n');

  console.log('crashPointIndex', crashPointIndex);
  console.log('roundsEntered', roundsEntered);
  console.log(`Runs won: ${runsWon}`);
  console.log(`Runs lost: ${runsLost}`);
  console.log(`Success rate: ${runsWon / (runsWon + runsLost)}`);
  console.log(`Profit: ${currentBalance - initialBalance}`);
}
