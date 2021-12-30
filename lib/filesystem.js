import os from 'os';
import fs from 'fs';

const userHomeDirectoryPath = os.homedir();
export const PROGRAM_DATA_DIRECTORY_PATH = `${userHomeDirectoryPath}/.blaze-crash-simulator`;
export const CRASH_POINTS_HISTORY_SAMPLE_FILENAME =
  'crash-points-history-sample.json';
export const BETTING_STRATEGIES_FILENAME = 'betting-strategies.json';

export function programDataDirectoryExists() {
  return fs.existsSync(PROGRAM_DATA_DIRECTORY_PATH);
}

export function createProgramDataDirectory() {
  fs.mkdirSync(PROGRAM_DATA_DIRECTORY_PATH);
}
