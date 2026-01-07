import { useEffect, useState, useCallback } from 'react';

interface LLMResponse {
  "message": string;
}


export default function App() {
  const [data, setData] = useState<LLMResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { //this only gets called once on mount, maybe it should be called everytime the user presses the key
    async function fetchData() {
      // const result = await searchAndScrapeGeminiOverview("nothing");
      // if (result) {
      //   setData(result );
      // }
      setLoading(false);
    }
    fetchData()
  }, []);

  if (loading) {
    return <div className="ceb-fourth-runtime-content-view-text">loading newPrompt</div>;
  }
  const displayContent = data?.['message'] ?? "nothing unfortunately";

  return (
    <div className="ceb-fourth-runtime-content-view-text">
      {displayContent}
    </div>
  )

}
