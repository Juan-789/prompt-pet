// import '@src/Popup.css';
import { t } from '@extension/i18n';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';

// shit is getting messy real quick, ok maybe start to get a bit more organized, lets go through this or just do it?
const notificationOptions = {
  type: 'basic',
  iconUrl: chrome.runtime.getURL('icon-34.png'),
  title: 'Injecting content script error',
  message: 'You cannot inject script here! Hint: Try the gemini page',
} as const;

const readPromptBoxGemini = () => {
  //returns contents of the gemini promptbox string
  const selector = 'div.ql-editor.textarea.new-input-ui[role="textbox"]';
  const targetElement = document.querySelector(selector);
  console.log(targetElement?.textContent);
  return targetElement?.textContent;
};

const Popup = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  // const logo = isLight ? 'popup/logo_vertical.svg' : 'popup/logo_vertical_dark.svg';
  // const defaultPrompt = 'useless chud'; //aparently useless :shrug:
  //

  // const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);

  // const [_promptArea, setPromptArea] = useState(defaultPrompt);
  // const [_readStatus, setReadStatus] = useState('Initializing...');

  const themed = {
    bg: isLight ? 'bg-slate-50' : 'bg-gray-800',
    text: isLight ? 'text-gray-900' : 'text-gray-100',
    button: cn(
      'mt-4 rounded px-4 py-1 font-bold shadow hover:scale-105',
      isLight ? 'bg-blue-200 text-black' : 'bg-gray-700 text-white',
    ),
  };

  const scrapingScripts = async () => {
    //this should be like sub-script? idk what to call it but the name is descriptive ig
    // setReadStatus('Attempting to read active tab DOM...');
    if (typeof chrome === 'undefined' || !chrome.tabs || !chrome.scripting) {
      // setReadStatus('Error: CHROME API IS UNDEFINED');
      console.error('Chrome API (chrome.tabs or chrome.scripting) is unavailable in this context.');
      return; // Exit if the required API is missing
    }
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab?.id) {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: readPromptBoxGemini,
        });

        const readContent = results?.[0]?.result;

        if (readContent && readContent.length > 0) {
          //maybe here i send an arg or param to another widget
          // embed here function call to llm
          const url: string = 'http://127.0.0.1:5000/fix';
          try {
            const response = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                prompt: readContent,
              }),
            });
            if (!response.ok) {
              throw new Error(`Backend is cooked ${response.status}`);
            }
            const result = await response.json();
            const improvedPrompt = result?.['message'] ?? 'failed inside try';
            console.log('improved prompt', improvedPrompt);

            // setPromptArea(improvedPrompt);
            // setReadStatus(`Succesfully improved (${improvedPrompt} chars)`);
            return improvedPrompt;
          } catch (e) {
            console.error(`shi got cooked twin in the callLLM betterPrompt func ${e}`);
            return undefined;
          }

          // setReadStatus(`content succesfuly read (${readContent.length}) chars`);
        } else if (readContent === '') {
          // setPromptArea(defaultPrompt);
          // setReadStatus('DOM element found, but content was empty (""). Using default prompt.');
          console.log('empty');
        } else {
          // If readContent is null/undefined, the element was not found.
          // setPromptArea(defaultPrompt);
          // setReadStatus('DOM element not found or returned null. Using default prompt.');
          console.log('else');
        }
      }
    } catch (error) {
      console.log('error reading dom content', error);
      // setReadStatus('Error reading dom content. check perms and manifest');
    }
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
        files: [
          // theres no order of these, not strict and for thus
          // '/content/scraping_gemini.iife.js',
          // '/content-runtime/callLLM.iife.js', //  this is what calls the LLM, and sends the prompt, and receives the new
          '/content-runtime/catHelper.iife.js', // this is the element that gets injected on top, but may change?
          //i feel like maybe injecting it directly on the prompt box is a bit invasive but may be best, i mean the user could tailor or
          // straight up say no, and thus it must somewhere save the original prompt the user asked, maybe a db is necessary?
        ],
      })
      .catch(err => {
        // Handling errors related to other paths
        if (err.message.includes('Cannot access a chrome:// URL')) {
          chrome.notifications.create('inject-error', notificationOptions);
        }
      });
  };
  // create a new tab and scrape the query, then send it back

  const sendPromptToTextArea = async (promptToSend: string) => {
    const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });
    chrome.tabs.sendMessage(tab.id, {
      action: 'USER_PROMPT',
      // dataToSend: promptArea,
      dataToSend: promptToSend,
    });
  };

  const getAll3exec = async () => {
    await injectContentScript();
    const new_prompt = await scrapingScripts();
    console.log('inside 3 execs', new_prompt);
    if (new_prompt) {
      await sendPromptToTextArea(new_prompt);
    }
  };

  return (
    <div className={cn('App relative min-h-screen px-6 py-1', themed.bg)}>
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage: `url(${chrome.runtime.getURL('Transparent_Flowers.png')})`,
          //backgroundColor: 'rgba(255, 0, 0, 0.3)', // temporary red tint
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="relative z-10">
        <header className={cn('App-header px-2.5', themed.text)}>
          <div className="buttonsContainer flex gap-4">
            <button className={cn('App-button', themed.button)} onClick={getAll3exec}>
              {/* // onClick={injectContentScript}> */}

              {t('callPet')}
            </button>

            <ToggleButton className={cn('App-button', themed.button)}>{t('toggleTheme')}</ToggleButton>
          </div>

          <button
            className={cn('App-button', themed.button)}
            // onClick={scrapingScripts}
          >
            scrape the chat box
          </button>

          <button
            className={cn('App-button', themed.button)}
            // onClick={sendPromptToTextArea}
          >
            Send to textarea
          </button>
        </header>

        <div className={cn('App-body', themed.text)}>
          <p> testing... </p>

          <p> \n testing again</p>

          <p> fill the whole box, i musttttt </p>

          <p> once more </p>
        </div>

        <footer className={cn('App-footer', themed.text)}>
          <p>Prompt Pet v0.1.0</p>
          <p>by keena and juan</p>
        </footer>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
