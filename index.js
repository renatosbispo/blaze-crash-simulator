#!/usr/bin/env node

import {
  PROGRAM_DATA_DIRECTORY_PATH,
  CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH,
  programDataDirectoryExists,
  createProgramDataDirectory,
  programDataExists,
  saveProgramData,
} from './lib/filesystem.js';
import printError from './lib/error-handling.js';
import createCrashPointsHistorySample from './lib/crash-points-history-sample-collection.js';

async function start() {
  const printSeparator = () => {
    console.log('\n\r---------------------------------------------------\n\r');
  };

  if (!programDataDirectoryExists()) {
    console.log('> [BCSim] Program data directory not found.');
    console.log(`> [BCSim] Creating it at ${PROGRAM_DATA_DIRECTORY_PATH}...`);

    try {
      createProgramDataDirectory();

      console.log('> [BCSim] Program data directory was successfully created.');
      printSeparator();
    } catch (error) {
      printError(error);

      return;
    }
  }

  if (!programDataExists(CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH)) {
    console.log('> [BCSim] No crash points history samples were found.');
    console.log('> [BCSim] Creating new sample...');

    try {
      const newCrashPointsHistorySample =
        await createCrashPointsHistorySample();

      console.log('> [BCSim] Sample was successfully created.');
      console.log('> [BCSim] Saving sample to program data directory...');

      saveProgramData(
        [newCrashPointsHistorySample],
        CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH
      );

      console.log('> [BCSim] Sample was successfully saved.');
      printSeparator();
    } catch (error) {
      printError(error);

      return;
    }
  }
}

start();
