import os from 'os';

const userHomeDirectoryPath = os.homedir();
export const PROGRAM_DATA_DIRECTORY_PATH =
  `${userHomeDirectoryPath}/.blaze-crash-simulator`;
export const CRASH_POINTS_HISTORY_SAMPLE_FILENAME =
  'crash-points-history-sample.json';
export const BETTING_STRATEGIES_FILENAME = 'betting-strategies.json';
