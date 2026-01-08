// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//     console.log("adding listener");
//     if (message.action === 'SCRAPE_OVERVIEW') {
//         console.log("inside the scri[t of scraping gemini")
//         console.log("Background scrape_overview: service worker got called", message);
//         //need to replace the whitespace with +
//         try {
//             console.log(message.dataToSend);
//             const query_modified: string = message.dataToSend.replaceAll(" ","+");
//             const url: string = `https://www.google.com/search?q=${query_modified}+gemini+overview`
//             chrome.tabs.create({
//                 url: url
//             });
//             return true;
//         } catch (e) {
//             console.log(`error in searchAndScrape service worker ${e}`);
//             return false;
//         }
//     }
// });
