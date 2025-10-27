import { useEffect, useState, useCallback, useRef } from 'react';

export default function App() {
  const defaultPrompt = "sample cat prompt with suggestion to make it better";

  const [promptArea, setPromptArea] = useState(defaultPrompt);
  const [petPosition, setPetPosition] = useState({
    x: window.innerWidth - 200,
    y: window.innerHeight - 200/2
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const clippyUrl = chrome.runtime.getURL('clippy.png');

  const handlePromptChange = (e) =>{
    setPromptArea(e.target.value);
  };

  const injectIntoGemini = () => {
    const selector = 'div.ql-editor.textarea.new-input-ui[role="textbox"]';
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      // Set the text content
      targetElement.textContent = promptArea;
      
      // Trigger input event so Gemini recognizes the change
      targetElement.dispatchEvent(new Event('input', { bubbles: true }));
      targetElement.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Focus the element
      targetElement.focus();
      
      console.log("Successfully injected prompt into Gemini!");
      return true;
    } else {
      console.error("Gemini prompt box not found!");
      return false;
    }
  };

  const handleYesClick = () => {
    console.log("Yes clicked, injecting:", promptArea);
    injectIntoGemini();
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
    const interval = setInterval(() => {
      setPetPosition(prev => {
        const newX =  prev.x - 2;
        const newY =  prev.y - 1;

        const containerWidth = containerRef.current?.offsetWidth || 400;
        const containerHeight = containerRef.current?.offsetHeight || 300;

        const minX = window.innerWidth - containerWidth + 180;
        const minY = 20;
        const maxY = window.innerWidth - containerWidth;

        if (newX <= minX || newY <= minY) {
          clearInterval(interval);
          return {
            x: Math.max(newX, minX),
            y: Math.max(newY, minY),
          };
        }
        return {x: newX, y: newY};
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);
    return () => {
        chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);


  return (  //so at some point the insert button on the popup should trigger a response from backend, which will in turn get into this textbox  
    // <div className="fixed top-1/2 right-6 -translate-y-1/2  w-96  style={{zIndex: 9999}}z-50">
    <div
      ref={containerRef}
      className="input-bar-container" 
      style={{
        display: 'flex', 
        alignItems: 'flex-end',
        left: `${petPosition.x}px`,
        top: `${petPosition.y}px`,
        transition: 'left 0.05s linear, top 0.05s linear',
      }}
    >
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
            onClick={handleYesClick}  //send the prompt to the actual main textbox
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
        <img src={clippyUrl} 
          alt="Clippy, (your pet)" 
          className="w-10 h-10 object-contain"
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
