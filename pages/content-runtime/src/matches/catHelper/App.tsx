import { useEffect, useState, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

// interface Velocity {
//   x: number;
//   y: number;
// }

export default function App() {
  const placeHolder = 'input your slop king, imma kirkify ts';

  const [promptArea, setPromptArea] = useState('');

  const [petPosition, setPetPosition] = useState({
    x: window.innerWidth - 200,
    y: (window.innerHeight - 200) / 2,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  // const [velocity, setVelocity] = useState<Velocity>({ x: 0, y: 0 });
  // const velocityRef = useRef<Velocity>({ x: 0, y: 0 });
  const detectionRadius: number = 150;
  const chaseSpeed: number = 3;
  const clippyUrl = chrome.runtime.getURL('clippy.png');
  const mousePos = useRef<Position>({ x: 0, y: 0 });
  const petSize: number = 80;

  // useEffect(() => {
  //   velocityRef.current = velocity;
  // }, [velocity]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener('mousemove', handleMouseMove);
    return (): void => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPromptArea(e.target.value);
  };

  const handlePetClick = () => {
    setPromptArea('let go of me you fucking chud');
    console.log('let go of me you fucking chud');
  };

  const callQueryServiceWorker = () => {
    // handle prompt scraping
    chrome.runtime.sendMessage(
      {
        action: 'SCRAPE_OVERVIEW',
        query: 'test query',
      },
      response => {
        console.log('Content script: Response from background:', response);
        if (chrome.runtime.lastError) {
          console.log('Content Script: Error:', chrome.runtime.lastError.message);
        }
      },
    );
  };

  const callPromptServiceWorker = () => {
    // handle prompt
    chrome.runtime.sendMessage(
      {
        action: 'NANO_OVERVIEW',
        query: promptArea,
      },
      response => {
        console.log('Content script: Response from background:', response);
        if (chrome.runtime.lastError) {
          console.log('Content Script: Error:', chrome.runtime.lastError.message);
        }
      },
    );
  };

  const handleYesClick = () => {
    console.log('Yes clicked, injecting:', promptArea);
    callQueryServiceWorker();
  };
  const handleNoClick = () => {
    console.log('No clicked, injecting:', promptArea);
    callPromptServiceWorker();
  };

  const messageHandler = useCallback(
    (
      msg: { action: string; dataToSend: string },
      _sender: chrome.runtime.MessageSender,
      sendResponse: (response: { status: string; received: boolean }) => void,
    ) => {
      if (msg.action === 'USER_PROMPT') {
        console.log('Content Script received message with new prompt:', msg.dataToSend);
        setPromptArea(msg.dataToSend);
        sendResponse({ status: 'success', received: true });
        return true;
      }
    },
    [],
  );

  // Movement and collision detection in ONE place
  useEffect(() => {
    const interval: NodeJS.Timeout = setInterval(() => {
      setPetPosition((prev: Position): Position => {
        const minX: number = 180;
        const maxX: number = window.innerWidth - 200;
        const minY: number = 0;
        const maxY: number = window.innerHeight - 200;

        const mouseX: number = mousePos.current.x;
        const mouseY: number = mousePos.current.y;

        const petCenterX: number = prev.x + petSize / 2 - 200;
        const petCenterY: number = prev.y + petSize / 2;

        // Calculate distance from pet to mouse
        const dx: number = mouseX - petCenterX;
        const dy: number = mouseY - petCenterY;
        const distance: number = Math.sqrt(dx * dx + dy * dy);

        let newX: number = prev.x;
        let newY: number = prev.y;

        // If mouse is within detection radius, chase it!
        if (distance < detectionRadius && distance > 5) {
          // Normalize direction vector and scale by chase speed
          const directionX: number = dx / distance;
          const directionY: number = dy / distance;

          newX = prev.x + directionX * chaseSpeed;
          newY = prev.y + directionY * chaseSpeed;

          console.log(`CHASING! Distance: ${distance.toFixed(0)}px, Moving towards (${mouseX}, ${mouseY})`);
        } else if (distance >= detectionRadius) {
          console.log(`Too far: ${distance.toFixed(0)}px`);
        }

        // Clamp to boundaries
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        return { x: newX, y: newY };
      });
    }, 50);

    return (): void => clearInterval(interval);
  }, []); // No dependencies - runs once and uses refs for everything

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
        position: 'fixed',
        transition: 'left 0.05s linear, top 0.05s linear',
        width: 'fit-content',
        left: `${petPosition.x}px`,
        top: `${petPosition.y}px`,
      }}>
      <div
        style={{
          backgroundColor: 'transparent',
          marginBottom: '8px',
        }}>
        <button
          type="button"
          onClick={handlePetClick}
          className="cursor-pointer border-0 bg-transparent p-0"
          style={{
            marginBottom: '8px',
          }}
          aria-label="Click Clippy the pet">
          <img
            src={clippyUrl}
            alt="Clippy, (your pet)"
            className="h-10 w-10 object-contain"
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'contain',
              display: 'block',
              backgroundColor: 'transparent',
            }}
          />
        </button>
      </div>
      <div className="flex flex-col gap-3 rounded-3xl rounded-lg border border-gray-300 bg-transparent p-4 shadow-lg">
        <textarea
          className="min-h-32 w-full resize-none rounded-md border-black bg-white p-3 text-black focus:outline-none focus:ring-2 focus:ring-teal-400"
          value={promptArea}
          onChange={handlePromptChange}
          placeholder={placeHolder}
        />
        <div className="flex justify-center gap-2">
          <button
            className="border-2 border-gray-500 px-4 py-1 text-sm text-black"
            style={{
              backgroundColor: '#ece9d8',
            }}
            onClick={handleYesClick} //send the prompt to the actual main textbox
          >
            Yes
          </button>
          <button
            className="border-2 border-gray-500 px-4 py-1 text-sm text-black"
            style={{
              backgroundColor: '#ece9d8',
            }}
            onClick={handleNoClick}>
            No
          </button>
        </div>
      </div>
    </div>
  );
}
