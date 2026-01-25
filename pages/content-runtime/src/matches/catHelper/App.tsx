import { useEffect, useState, useCallback, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}
type PetDirection =
  | 'IDLE'
  | 'ALERT'
  | 'SCRATCH'
  | 'TIRED'
  | 'SLEEPING'
  | 'N'
  | 'NE'
  | 'E'
  | 'SE'
  | 'S'
  | 'SW'
  | 'W'
  | 'NW';
// const SPRITE_SIZE = 32; // The source pixel size of oneko
const DISPLAY_SIZE = 32; // The size you want in your UI
export default function App() {
  const placeHolder = 'input your slop king, imma kirkify ts';
  const [showTextArea, setShowTextArea] = useState(true);
  const [promptArea, setPromptArea] = useState('');
  const [petDirection, setPetDirection] = useState<PetDirection>('IDLE');
  const [petPosition, setPetPosition] = useState({
    x: window.innerWidth - 200,
    y: (window.innerHeight - 200) / 2,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);

  // Oneko Logic States
  const [idleTime, setIdleTime] = useState(0);
  const [idleAnimation, setIdleAnimation] = useState<string | null>(null);
  const [idleAnimationFrame, setIdleAnimationFrame] = useState(0);

  const petSpeed = 10;
  const mousePos = useRef<Position>({ x: 0, y: 0 });
  const spriteSets: Record<string, number[][]> = {
    IDLE: [[-3, -3]],
    ALERT: [[-7, -3]],
    SCRATCH: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    TIRED: [[-3, -2]],
    SLEEPING: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

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
    setShowTextArea(!showTextArea);
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
    const interval = setInterval(() => {
      setFrame(f => f + 1);

      const diffX = petPosition.x - mousePos.current.x;
      const diffY = petPosition.y - mousePos.current.y;
      const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

      // 1. IDLE LOGIC
      if (distance < petSpeed || distance < 48) {
        // console.log('idle logic');
        setIdleTime(prev => prev + 1);

        // Randomly start an idle animation (scratch or sleep)
        if (idleTime > 10 && !idleAnimation) {
          // console.log('inside the random start');
          // if (Math.random() < 0.2) {
          setIdleAnimation(Math.random() > 0.5 ? 'SLEEPING' : 'SCRATCH');
          // }
          // setIdleAnimation('SLEEPING');
        }

        if (idleAnimation === 'SLEEPING') {
          if (idleAnimationFrame < 8) {
            // console.log('tired');
            setPetDirection('TIRED');
          } else {
            // console.log('sleeping');
            setPetDirection('SLEEPING');
          }

          if (idleAnimationFrame > 192) {
            setIdleAnimation(null); //????
            setIdleAnimationFrame(0); // ???
          } else setIdleAnimationFrame(prev => prev + 1);
        } else if (idleAnimation === 'SCRATCH') {
          setPetDirection('SCRATCH');
          if (idleAnimationFrame > 9) {
            setIdleAnimation(null);
            setIdleAnimationFrame(0);
          } else setIdleAnimationFrame(prev => prev + 1);
        } else {
          setPetDirection('IDLE');
        }
        return;
      }

      // 2. MOVING LOGIC
      setIdleAnimation(null);
      setIdleAnimationFrame(0);

      // Alert state before running
      if (idleTime > 0) {
        // console.log('alert');
        setPetDirection('ALERT');
        setIdleTime(prev => Math.min(prev, 7) - 1);
        return;
      }

      // Determine Direction String (N, NE, S, etc.)
      let dir = '';
      if (diffY / distance > 0.5) dir = 'N';
      else if (diffY / distance < -0.5) dir = 'S';

      if (diffX / distance > 0.5) dir += 'W';
      else if (diffX / distance < -0.5) dir += 'E';

      setPetDirection((dir || 'S') as PetDirection);

      // Update Position
      setPetPosition(prev => ({
        x: prev.x - (diffX / distance) * petSpeed,
        y: prev.y - (diffY / distance) * petSpeed,
      }));
    }, 100); // 100ms matches original oneko speed
    return () => clearInterval(interval);
  }, [petPosition, idleTime, idleAnimation, idleAnimationFrame]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(messageHandler);
    return () => {
      chrome.runtime.onMessage.removeListener(messageHandler);
    };
  }, [messageHandler]);
  // Helper to calculate background position
  const getBackgroundPos = () => {
    const set = spriteSets[petDirection] || spriteSets['IDLE'];

    const currentSprite = set[frame % set.length];
    return `${currentSprite[0] * DISPLAY_SIZE}px ${currentSprite[1] * DISPLAY_SIZE}px`;
  };

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
        minWidth: 'max-content',
        flexShrink: 0,
      }}>
      <button
        type="button"
        onClick={() => handlePetClick()}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            setPromptArea('let go of me you fucking chud');
          }
        }}
        style={{
          // Reset default button styles
          padding: 0,
          border: 'none',
          background: 'none',
          outline: 'none',

          width: `${DISPLAY_SIZE}px`,
          height: `${DISPLAY_SIZE}px`,
          backgroundImage: `url(${chrome.runtime.getURL('oneko.gif')})`,
          backgroundPosition: getBackgroundPos(),
          backgroundSize: `${DISPLAY_SIZE * 8}px ${DISPLAY_SIZE * 4}px`, // Oneko sheet is 8x4 sprites
          imageRendering: 'pixelated',
          cursor: 'pointer',
          marginBottom: '8px',
        }}
      />
      {showTextArea && (
        <div
          className="flex flex-col gap-3 rounded-3xl rounded-lg border border-gray-100 bg-transparent p-4 shadow-lg"
          style={{
            minWidth: '100px', // Set a minimum width for the textarea box
            flexShrink: 0, // Don't allow it to shrink
          }}>
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
      )}
    </div>
  );
}
