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

async function collectCrashPointsHistorySampleData() {
  await crashGameScraper.launch();

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
            type: className,
            value: Number(innerText.replace('X', '')),
          })
        );

        return recentCrashPoints;
      };

      return new Promise((resolve) => {
        const desiredCrashPointsHistorySampleSize = 16;

        const recentCrashPointsHtmlElementObserver = new MutationObserver(
          () => {
            const crashPointsHistorySampleDataPartial =
              extractRecentCrashPointsFromGamePage();

            if (
              crashPointsHistorySampleDataPartial.length ===
              desiredCrashPointsHistorySampleSize
            ) {
              recentCrashPointsHtmlElementObserver.disconnect();
              resolve(crashPointsHistorySampleDataPartial);
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

  await crashGameScraper.browser.close();

  return crashPointsHistorySampleData;
}
