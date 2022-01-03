import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';

const crashGameScraper = {
  urlToScrape: 'https://blaze.com/games/crash',
  browserLaunchOptions: {
    headless: true,
    args: ['--window-size=1920,1080'],
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  },
  browser: null,
  page: null,
  async launch() {
    this.browser = await puppeteer.launch(this.browserLaunchOptions);
    this.page = await this.browser.newPage();

    this.page.on('console', (message) => {
      const messageText = message.text();

      if (messageText.includes('BCSim')) {
        console.log(messageText);
      }
    });

    await this.page.goto(this.urlToScrape);
  },
  async close() {
    await this.browser.close();
  },
};

async function collectCrashPointsHistorySampleData() {
  console.log('> [BCSim] Launching Crash Game scraper...');
  await crashGameScraper.launch();

  console.log('> [BCSim] Collecting crash points history sample...');
  const dataCollectionStartDate = new Date();

  const crashPointsHistorySampleData = await crashGameScraper.page.evaluate(
    () => {
      const recentCrashPointsHtmlElement = document.querySelector(
        '.crash-previous .entries'
      );
      const extractRecentCrashPointsFromGamePage = () => {
        const recentCrashPointsHtmlCollection =
          recentCrashPointsHtmlElement.children;
        const recentCrashPoints = [...recentCrashPointsHtmlCollection].map(
          ({ innerText, className }) => ({
            isGood: className === 'good',
            value: Number(innerText.replace('X', '')),
          })
        );

        return recentCrashPoints;
      };
      const printNewCrashPointAndProgress = (
        newCrashPoint,
        numberOfCrashPointsCollectedSoFar,
        desiredCrashPointsHistorySampleSize
      ) => {
        console.warn(
          `> [BCSim] Added new crash point: ${JSON.stringify(
            newCrashPoint
          )} (${numberOfCrashPointsCollectedSoFar}/${desiredCrashPointsHistorySampleSize})`
        );
      };

      return new Promise((resolve, reject) => {
        const recentCrashPointsHtmlElementObserver = new MutationObserver(
          () => {
            try {
              const desiredCrashPointsHistorySampleSize = 16;
              const crashPointsHistorySampleDataPartial =
                extractRecentCrashPointsFromGamePage();
              const numberOfCrashPointsCollectedSoFar =
                crashPointsHistorySampleDataPartial.length;

              printNewCrashPointAndProgress(
                crashPointsHistorySampleDataPartial[0],
                numberOfCrashPointsCollectedSoFar,
                desiredCrashPointsHistorySampleSize
              );

              if (
                numberOfCrashPointsCollectedSoFar ===
                desiredCrashPointsHistorySampleSize
              ) {
                recentCrashPointsHtmlElementObserver.disconnect();
                resolve(crashPointsHistorySampleDataPartial);
              }
            } catch (error) {
              recentCrashPointsHtmlElementObserver.disconnect();
              reject(error);
            }
          }
        );

        const recentCrashPointsHtmlElementObserverOptions = {
          childList: true,
        };

        recentCrashPointsHtmlElementObserver.observe(
          recentCrashPointsHtmlElement,
          recentCrashPointsHtmlElementObserverOptions
        );
      });
    }
  );

  const dataCollectionEndDate = new Date();
  await crashGameScraper.browser.close();
  console.log('> [BCSim] Finished collecting crash points history sample.');

  return {
    dataCollectionStartDate,
    dataCollectionEndDate,
    data: crashPointsHistorySampleData,
  };
}

export default async function createCrashPointsHistorySample() {
  const id = uuidv4();
  const { dataCollectionStartDate, dataCollectionEndDate, data } =
    await collectCrashPointsHistorySampleData();
  const newCrashPointsHistorySample = {
    id,
    dataCollectionStartDate,
    dataCollectionEndDate,
    data,
  };

  return newCrashPointsHistorySample;
}
