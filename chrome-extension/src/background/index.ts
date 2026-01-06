import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("adding listener");
    if (message.action === 'SCRAPE_OVERVIEW') {
        console.log("Background scrape_overview: service worker got called", message.query);
        //need to replace the whitespace with +
        try {
            let query_modified: string = message.query.replaceAll(" ","+");
            const url: string = `https://www.google.com/search?q=${query_modified}+gemini+overview`
            chrome.tabs.create({
                url: url
            });
            return true;
        } catch (e) {
            console.log(`error in searchAndScrape service worker ${e}`);
            return false;
        }
    }
});
console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
