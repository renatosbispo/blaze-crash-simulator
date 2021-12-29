#!/usr/bin/env node

import fs from 'fs';
import { PROGRAM_DATA_DIRECTORY_PATH } from './lib/filesystem.js';
import printError from './lib/error-handling.js';


function start() {
  if (!fs.existsSync(PROGRAM_DATA_DIRECTORY_PATH)) {
    console.log('Program data directory not found.');
    console.log(`Creating it at ${PROGRAM_DATA_DIRECTORY_PATH}...`);

    try {
      fs.mkdirSync(PROGRAM_DATA_DIRECTORY_PATH, 'utf8');
      console.log('Successfully created program data directory.');
    } catch (error) {
      printError(error);

      return;
    }
  }
}

start();
