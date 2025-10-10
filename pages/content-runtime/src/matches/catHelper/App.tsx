import { read } from 'fs';
import { useEffect, useState, useCallback } from 'react';

export default function App() {
  const defaultPrompt = "sample cat prompt with suggestion to make it better";

  
  const [promptArea, setPromptArea] = useState(defaultPrompt);
  
  const handlePromptChange = (e) =>{
    setPromptArea(e.target.value);
  };
  // This script runs in the isolated world of the webpage.
  // It sets up listeners for commands coming from the Pop-up/UI.

  // chrome.runtime.onMessage.addListener((msg) => {
  //   switch (msg.action) {
  //     case 'USER_PROMPT':
  //       setPromptArea(msg.dataToSend);
  //       break;
  //   }
  //   }
  // );
// 1. Define the message handler using useCallback to memoize it
  const messageHandler = useCallback((msg, sender, sendResponse) => {
      if (msg.action === 'USER_PROMPT') {
          console.log("Content Script received message with new prompt:", msg.dataToSend);
          
          // Use the setter directly. Because this is the *only* place 
          // the chrome listener interacts with React state, it's safer than 
          // relying on closures if the component re-rendered.
          setPromptArea(msg.dataToSend);
          
          // Acknowledging the message is good practice (needed if sender uses an await-wrapper)
          sendResponse({ status: "success", received: true }); 
          
          // Return true to indicate you will respond asynchronously
          return true; 
      }
  }, []); // IMPORTANT: No dependencies. The setPromptArea is guaranteed to be stable.

  // 2. Register the listener ONCE when the component mounts.
  useEffect(() => {
    // Add the listener
    chrome.runtime.onMessage.addListener(messageHandler);
    
    // Cleanup: Remove the listener when the component unmounts
    return () => {
        // This is crucial to prevent multiple listeners on subsequent injections/reloads
        chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]); // Re-register only if messageHandler changes (which it won't due to [])




  return (  //so at some point the insert button on the popup should trigger a response from backend, which will in turn get into this textbox  

    <div className="input-bar-container">
      <div className='input-wrapper'>
        <textarea
          className="auto-resize-textarea"
          value={promptArea}
          onChange={handlePromptChange}
        />
        <button className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 
        overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br 
        from-teal-300 to-lime-300 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white
        dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-lime-200 
        dark:focus:ring-lime-800"
        // onClick={}
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white 
          dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            Accept prompt
          </span>
        </button>
      </div>
    </div>
  );
}
