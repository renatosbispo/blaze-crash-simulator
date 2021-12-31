#!/usr/bin/env node

import {
  PROGRAM_DATA_DIRECTORY_PATH,
  programDataDirectoryExists,
  createProgramDataDirectory,
} from './lib/filesystem.js';
import printError from './lib/error-handling.js';

async function start() {
  const printSeparator = () => {
    console.log('---------------------------------------------------');
  };

  if (!programDataDirectoryExists()) {
    console.log('> [BCSim] Program data directory not found.');
    console.log(`> [BCSim] Creating it at ${PROGRAM_DATA_DIRECTORY_PATH}...`);

    try {
      createProgramDataDirectory();

      console.log('> [BCSim] Program data directory successfully created.');
      printSeparator();
    } catch (error) {
      printError(error);

      return;
    }
  }
}

start();
