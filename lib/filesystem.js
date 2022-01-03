import os from 'os';
import fs from 'fs';

const userHomeDirectoryPath = os.homedir();
const programDataDirectoryName = '.blaze-crash-simulator';
const crashPointsHistorySamplesFilename = 'crash-points-history-samples.json';
const bettingStrategiesFilename = 'betting-strategies.json';

export const PROGRAM_DATA_DIRECTORY_PATH = `${userHomeDirectoryPath}/${programDataDirectoryName}`;
export const CRASH_POINTS_HISTORY_SAMPLES_FILE_PATH = `${PROGRAM_DATA_DIRECTORY_PATH}/${crashPointsHistorySamplesFilename}`;
export const BETTING_STRATEGIES_FILE_PATH = `${PROGRAM_DATA_DIRECTORY_PATH}/${bettingStrategiesFilename}`;

export function programFileExists(filePath) {
  return fs.existsSync(`${filePath}`);
}

export function programDataDirectoryExists() {
  return fs.existsSync(PROGRAM_DATA_DIRECTORY_PATH);
}

export function createProgramDataDirectory() {
  fs.mkdirSync(PROGRAM_DATA_DIRECTORY_PATH);
}

export function loadProgramData(filePath) {
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const parsedFileContents = JSON.parse(
    fileContents,
    (programDataKey, programDataValue) => {
      if (programDataKey.toLowerCase().includes('date')) {
        return new Date(programDataValue);
      }

      return programDataValue;
    }
  );

  return parsedFileContents;
}

export function saveProgramData(programData, filePath) {
  const stringifiedProgramData = JSON.stringify(programData, null, 2);
  fs.writeFileSync(filePath, stringifiedProgramData);
}
