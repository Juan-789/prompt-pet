import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';
// import 'dom-chromium-ai';

console.log('Chud background worker starting...'); //https://developer.chrome.com/docs/ai/get-started#user-activation

let availability: Availability = 'unavailable';
let session: LanguageModel | null = null;

const initializeModel = async () => {
  availability = await LanguageModel.availability();
  if (availability === 'unavailable') {
    //NOTE: If the available storage space falls to less than 10 GB
    //  after the download, the model is removed from your device. The model redownloads once the requirements are met.
    session = await LanguageModel.create({
      //one can pass an abort signal to close
      monitor(m) {
        m.addEventListener('downloadprogress', e => {
          console.log(`Downloaded ${e.loaded * 100}%`);
        });
      },
    });

    // const session_init = await LanguageModel.create({
    //     temperature: params.defaultTemperature,
    //     topK: params.defaultTopK,
    // });
    // multimodal btw

    // in case to about session; like a logout of sorts :shrug's confused:
    // const controller = new AbortController();
    // stopButton.onclick = () => controller.abort();

    // const session = await LanguageModel.create({
    //   signal: controller.signal,
    // });
  } else if (availability === 'available') {
    session = await LanguageModel.create({
      //initial context
      initialPrompts: [{ role: 'system', content: 'You are a helpful and friendly assistant.' }],
    });
  }
};
initializeModel();

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});
chrome.runtime.onMessage.addListener(
  (
    message: { action: string; query: string },
    _sender,
    sendResponse: (response?: { success: boolean; answer?: string }) => void,
  ) => {
    console.log('adding listener');
    if (message.action === 'SCRAPE_OVERVIEW') {
      console.log('Background scrape_overview: service worker got called', message.query);
      //need to replace the whitespace with +
      try {
        const query_modified: string = message.query.replaceAll(' ', '+');
        const url: string = `https://www.google.com/search?q=${query_modified}+gemini+overview`;
        chrome.tabs.create({
          url: url,
        });
        return true;
      } catch (e) {
        console.log(`error in searchAndScrape service worker ${e}`);
        return false;
      }
    } else if (message.action === 'NANO_OVERVIEW') {
      console.log('Nano LLM overview: service worker got called', message.query);
      try {
        //need to check if ai is available, IT WILL THO
        handleUserPrompt(message.query, sendResponse);
        return true;
      } catch (e) {
        console.log(`error in NANO_OVERVIEW service worker ${e}`);
        return false;
      }
    }
    return false;
  },
);

const handleUserPrompt = async (
  user_prompt: string,
  sendResponse: (response?: { success: boolean; answer?: string }) => void,
): Promise<void> => {
  if (availability === 'available') {
    const result = await session?.prompt(user_prompt);
    sendResponse({
      success: true,
      answer: result,
    });
  }
  return Promise.resolve();
};
