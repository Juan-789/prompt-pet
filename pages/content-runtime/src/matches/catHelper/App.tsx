import { useEffect, useState, useCallback, useRef, SetStateAction } from 'react';

export default function App() {
  const defaultPrompt = "app func";

  const [promptArea, setPromptArea] = useState(defaultPrompt);
  const [petPosition, setPetPosition] = useState({
    x: window.innerWidth - 200,
    y: (window.innerHeight - 200)/2
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [velocity, setVelocity] = useState({ x:-2, y: -1.5});
  // const [velocity, setVelocity] = useState({ x:0, y: 0});

  const clippyUrl = chrome.runtime.getURL('clippy.png');

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptArea(e.target.value);
  };

  const handlePetClick = () => {
    setPromptArea("let go of me you fucking chud");
    console.log("let go of me you fucking chud");
  }

  const callQueryServiceWorker = () => { // handle prompt scraping
    chrome.runtime.sendMessage({
      action: 'SCRAPE_OVERVIEW',
      query: "test query"
    }, (response) => {
      console.log("Content script: Response from background:", response);
      if (chrome.runtime.lastError) {
        console.log("Content Script: Error:", chrome.runtime.lastError.message);
      } 
    });
  };

  const callPromptServiceWorker = () => { // handle prompt
    chrome.runtime.sendMessage({
      action: 'NANO_OVERVIEW',
      query: "who is alexander the great"
    }, (response) => {
      console.log("Content script: Response from background:", response);
      if (chrome.runtime.lastError) {
        console.log("Content Script: Error:", chrome.runtime.lastError.message);
      } 
    });
  };

  const handleYesClick = () => {
    console.log("Yes clicked, injecting:", promptArea);
    callQueryServiceWorker();
  };
  const handleNoClick = () => {
    console.log("No clicked, injecting:", promptArea);
    callPromptServiceWorker();
  };

  const messageHandler = useCallback((msg: { action: string; dataToSend: SetStateAction<string>; }, sender: any, sendResponse: (arg0: { status: string; received: boolean; }) => void) => {
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
        // const containerWidth = containerRef.current?.offsetWidth || 400;
        // const containerHeight = containerRef.current?.offsetHeight || 300;

        const minX = 180;
        const maxX = window.innerWidth;
        const minY = 0;
        const maxY = window.innerHeight;

        let newX =  prev.x + velocity.x;
        let newY =  prev.y + velocity.y;
        let newVelocityX = velocity.x;
        let newVelocityY = velocity.y;

        if (newX <= minX || newX >= maxX){
          newVelocityX = -velocity.x;
          // newX = newX < minX ? minX : maxX; //this could be wrong
          if (newX<=minX) {
            newX = minX;
          } else {
            newX = maxX;
          }
        }
          
        if (newY <= minY || newY >= maxY) {
          newVelocityY = -velocity.y;
          if (newY<=minY) {
            newY = minY;
          } else {
            newY = maxY;
          }
        }
          
        if (newVelocityX !== velocity.x || newVelocityY !== velocity.y) {
          setVelocity({ x: newVelocityX, y: newVelocityY});
        }

        return {x: newX, y: newY};
      });
    }, 50);

    return () => clearInterval(interval);
  }, [velocity]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);
    return () => {
        chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);


        return (  
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
            }}
            onClick={handleNoClick}>
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
          onClick={handlePetClick}
        />
      </div>
    </div>
  );
}
