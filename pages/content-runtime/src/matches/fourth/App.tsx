import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log('[CEB] fourth script');
  }, []);

  return <div className="ceb-fourth-runtime-content-view-text">fourth script </div>;
}
