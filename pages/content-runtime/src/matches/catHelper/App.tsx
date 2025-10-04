import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log('[CEB] calling juan from catHelper');
  }, []);
  
  return (

    <div className="input-bar-container">
      <div className='input-wrapper'>
        <textarea
          className="auto-resize-textarea"
          value={"sample cat prompt with suggestion to make it better"}
        />
        <button className='accept-prompt-button'>accpet prompt</button>
      </div>
    </div>
  );
}
