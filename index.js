#!/usr/bin/env node

import {
  PROGRAM_DATA_DIRECTORY_PATH,
  programDataDirectoryExists,
  createProgramDataDirectory,
} from './lib/filesystem.js';
import printError from './lib/error-handling.js';
import createCrashPointsHistorySample from './lib/crash-points-history-sample-collection.js';

async function start() {
  if (!programDataDirectoryExists()) {
    console.log('Program data directory not found.');
    console.log(`Creating it at ${PROGRAM_DATA_DIRECTORY_PATH}...`);

    try {
      createProgramDataDirectory();

      console.log('Program data directory successfully created.');
    } catch (error) {
      printError(error);

      return;
    }
  }

  console.log(await createCrashPointsHistorySample());
}

start();
