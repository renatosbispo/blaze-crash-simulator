#!/usr/bin/env node

import {
  PROGRAM_DATA_DIRECTORY_PATH,
  CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH,
  programDataDirectoryExists,
  createProgramDataDirectory,
  programFileExists,
  saveProgramData,
  loadProgramData,
} from './lib/filesystem.js';
import printProgramMessage, {
  printSeparator,
  printError,
} from './lib/console-output.js';
import createCrashPointsHistorySample from './lib/crash-points-history-sample-collection.js';
import simulateStrategy from './lib/betting-strategy-simulation-alt.js';

const shouldForceSampleCreation = false;

async function start() {
  if (!programDataDirectoryExists()) {
    printProgramMessage('Program data directory not found.');
    printProgramMessage(`Creating it at ${PROGRAM_DATA_DIRECTORY_PATH}...`);

    try {
      createProgramDataDirectory();

      printProgramMessage('Program data directory was successfully created.');
      printSeparator();
    } catch (error) {
      printError(error);

      return;
    }
  }

  if (
    !programFileExists(CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH) ||
    shouldForceSampleCreation
  ) {
    printProgramMessage('No crash points history samples were found.');
    printProgramMessage('Creating new sample...');

    try {
      const newCrashPointsHistorySample =
        await createCrashPointsHistorySample();

      printProgramMessage('Sample was successfully created.');
      printProgramMessage('Saving sample to program data directory...');

      const currentSamples = loadProgramData(
        CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH
      );

      saveProgramData(
        [...currentSamples, newCrashPointsHistorySample],
        CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH
      );

      printProgramMessage('Sample was successfully saved.');
      printSeparator();
    } catch (error) {
      printError(error);

      return;
    }
  }

  simulateStrategy();
}

start();
