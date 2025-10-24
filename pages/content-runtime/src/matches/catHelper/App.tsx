import { useEffect, useState, useCallback } from 'react';

export default function App() {
  const defaultPrompt = "sample cat prompt with suggestion to make it better";

  const [promptArea, setPromptArea] = useState(defaultPrompt);
  
  const clippyUrl = chrome.runtime.getURL('clippy.png');

  const handlePromptChange = (e) =>{
    setPromptArea(e.target.value);
  };


  const messageHandler = useCallback((msg, sender, sendResponse) => {
      if (msg.action === 'USER_PROMPT') {
          console.log("Content Script received message with new prompt:", msg.dataToSend);        
          setPromptArea(msg.dataToSend);
          sendResponse({ status: "success", received: true }); 
          return true; 
      }
  }, []); 

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);
    return () => {
        chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);


  return (  //so at some point the insert button on the popup should trigger a response from backend, which will in turn get into this textbox  
    // <div className="fixed top-1/2 right-6 -translate-y-1/2  w-96  style={{zIndex: 9999}}z-50">
    <div className="input-bar-container" style={{display: 'flex', alignItems: 'flex-end'}}>
      <div className='flex flex-col gap-3 p-4 border border-gray-300 rounded-3xl shadow-lg bg-transparent rounded-lg p-4 shadow-lg'>
        <textarea
          className="w-full min-h-32 p-3 bg-white text-black rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-400 border-black"
          value={promptArea}
          onChange={handlePromptChange}
        />
        <div className='justify-center flex gap-2'>
          <button className="px-4 py-1 border-2 border-gray-500 text-black text-sm"
            style={{ 
              backgroundColor: '#ece9d8' 
            }}
            // onClick={}
            >
              Yes
          </button>
          <button className="px-4 py-1 border-2 border-gray-500 text-black text-sm"
            style={{ 
              backgroundColor: '#ece9d8' 
            }}>
              No
          </button>
        </div>
      </div>
      <div
        style={{
          backgroundColor: 'transparent',
          marginBottom: '8px'
        }}  
      >
        <img src={clippyUrl} alt="Clippy, (your pet)" className='w-10 h-10 object-contain ' 
          style={{
            width: '80px',
            height: '80px',
            objectFit: 'contain',
            display: 'block',
            backgroundColor: 'transparent',
          }}
        />
      </div>
    </div>
  );
}
