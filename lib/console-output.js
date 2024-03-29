export const PROGRAM_MESSAGE_PREFIX = '> [BCSim]';

export default function printProgramMessage(message) {
  console.log(`${PROGRAM_MESSAGE_PREFIX} ${message}`);
}

export function printProgramMessageFromWithinTheScraper(message) {
  console.warn(`${PROGRAM_MESSAGE_PREFIX} ${message}`);
}

export function printSeparator() {
  console.log('\n\r---------------------------------------------------\n\r');
}

export function printError(error) {
  console.log('');
  console.log('Operation aborted due to error:');
  console.log('');
  console.error(error);
}
