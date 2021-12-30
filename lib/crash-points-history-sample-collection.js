import puppeteer from 'puppeteer';

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
    await this.page.goto(this.urlToScrape);
  },
  async close() {
    await this.browser.close();
  },
};

export default async function collectCrashPointsHistorySample() {
  await crashGameScraper.launch();

  const crashPointsHistorySampleData = await crashGameScraper.page.evaluate(
    () => {
      const crashPointsHistoryHtmlElement = document.querySelector(
        '.crash-previous .entries'
      );
      const extractCrashPointsHistoryFromGamePage = () => {
        const crashPointsHistoryHtmlCollection =
          crashPointsHistoryHtmlElement.children;
        const crashPointsHistory = [...crashPointsHistoryHtmlCollection].map(
          ({ innerText, className }) => ({
            type: className,
            value: innerText.replace('X', ''),
          })
        );

        return crashPointsHistory;
      };

      return new Promise((resolve) => {
        const desiredCrashPointsHistorySampleSize = 16;

        const crashPointsHistoryHtmlElementObserver = new MutationObserver(
          () => {
            const crashPointsHistorySampleDataPartial =
              extractCrashPointsHistoryFromGamePage();

            if (
              crashPointsHistorySampleDataPartial.length ===
              desiredCrashPointsHistorySampleSize
            ) {
              crashPointsHistoryHtmlElementObserver.disconnect();
              resolve(crashPointsHistorySampleDataPartial);
            }
          }
        );

        const crashPointsHistoryHtmlElementObserverOptions = {
          childList: true,
        };

        crashPointsHistoryHtmlElementObserver.observe(
          crashPointsHistoryHtmlElement,
          crashPointsHistoryHtmlElementObserverOptions
        );
      });
    }
  );

  console.log(crashPointsHistorySampleData);
  await crashGameScraper.browser.close();
}
