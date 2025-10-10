import '@src/Popup.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import {useState, useEffect} from 'react';

// shit is getting messy real quick, ok maybe start to get a bit more organized, lets go through this or just do it?
const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here!',
} as const;

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';
  const defaultPrompt = "sample cat prompt with suggestion to make it better";

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  const [promptArea, setPromptArea] = useState(defaultPrompt);
  const [readStatus, setReadStatus] = useState('Initializing...');
  // const [fetchStatus, setFetchStatus] = useState('');
  // const [isLoading, setIsLoading] = useState(false);
  // const [currTab, setTab] = useState(0);

  const scrapingScripts = async () => { //this should be like sub-script? idk what to call it but the name is descriptive ig
    setReadStatus('Attempting to read active tab DOM...');
    if(typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      setReadStatus('Error: CHROME API IS UNDEFINED')
      console.error("Chrome API (chrome.tabs or chrome.scripting) is unavailable in this context.");
      return; // Exit if the required API is missing
    }
    try{
      console.log("inside try of popup");
      const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
      if (tab?.id) {
        // setTab(tab.id);
        const results = await chrome.scripting.executeScript({
          target: {tabId: tab.id},
          func: readPromptBoxGemini,
        });
        
        const readContent = results?.[0]?.result;

        if (readContent && readContent.length > 0) {  //maybe here i send an arg or param to another widget
          setPromptArea(readContent);
          setReadStatus(`content succesfuly read (${readContent.length}) chars`)
          // chrome.tabs.sendMessage(chrome.tabs.query({active}))
        } else if (readContent === "") {
          setPromptArea(defaultPrompt);
          setReadStatus('DOM element found, but content was empty (""). Using default prompt.');
          console.log("empty");
        } else {
          // If readContent is null/undefined, the element was not found.
          setPromptArea(defaultPrompt);
          setReadStatus('DOM element not found or returned null. Using default prompt.');
          console.log("else");
        }
      }
    } catch (error){
      console.log("error reading dom content", error);
      setReadStatus('Error reading dom content. check perms and manifest');
    }
  };

  const sendUserPromptToBackend = async () => {
    
  };

  const injectContentScript = async () => {
    //this to inject stuff in react
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

    if (tab.url!.startsWith('about:') || tab.url!.startsWith('chrome:')) {
      chrome.notifications.create('inject-error', notificationOptions);
    }

    await chrome.scripting
      .executeScript({
        target: { tabId: tab.id! },
        files: [  // theres no order of these, not strict and for thus 
          '/content-runtime/catHelper.iife.js', // this is the element that gets injected on top, but may change?
          //i feel like maybe injecting it directly on the prompt box is a bit invasive but may be best, i mean the user could tailor or 
          // straight up say no, and thus it must somewhere save the original prompt the user asked, maybe a db is necessary?

          // '/content-runtime/callLLM.iife.js', //  this is what calls the LLM, and sends the prompt, and receives the new
        ],
      })
      .catch(err => {
        // Handling errors related to other paths
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', notificationOptions);
        }
      });
  };

  const sendPromptToTextArea = async (promptToSend) => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true});
    chrome.tabs.sendMessage(tab.id, {
      action: 'USER_PROMPT',
      // dataToSend: promptArea,
      dataToSend: promptToSend,

    })
  };

  const getAll3exec = async () => {
    await injectContentScript();
    await scrapingScripts();
    const final_promnt = promptArea;
    await sendPromptToTextArea(final_promnt);
  };


  return (
    <div className={cn('App', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <header className={cn('App-header', isLight ? 'text-gray-900' : 'text-gray-100')}>
        <button
          className={cn(
            'mt-4 rounded px-4 py-1 font-bold shadow hover:scale-105',
            isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white',
          )}
          onClick={getAll3exec}>
          {/* // onClick={injectContentScript}> */}
          {t('callPet')}
        </button>
        <ToggleButton>{t('toggleTheme')}</ToggleButton>
        <button
          className={cn(
            'mt-4 rounded px-4 py-1 font-bold shadow hover:scale-105',
            isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white',
          )}
          // onClick={scrapingScripts}
          >
          scrape the chat box
        </button>
        <button 
          // onClick={sendPromptToTextArea}
        >Send to textarea</button>
      </header>
    </div>
  );
};
function readPromptBoxGemini() {  //returns contents of the gemini promptbox string
  const selector = 'div.ql-editor.textarea.new-input-ui[role="textbox"]';
  const targetElement = document.querySelector(selector);
  console.log(targetElement?.textContent);
  return targetElement?.textContent;
}

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
