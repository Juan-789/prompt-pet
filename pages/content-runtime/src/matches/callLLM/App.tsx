import { useEffect, useState, useCallback } from 'react';

interface LLMResponse {
  "message": string;
}

async function betterPrompt(initPrompt: string): Promise<LLMResponse | undefined>{ //return string
  const url: string = "http://127.0.0.1:5000/";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Backend is cooked ${response.status}`);
    }
    const result: LLMResponse = await response.json();
    return result;
  } catch (e) {
    console.error(`shi got cooked twin in the callLLM betterPrompt func ${e}`);
    return undefined;
  }
}

async function searchAndScrapeGeminiOverview(query: string): Promise<string | undefined>{
  //need to replace the whitespace with +
  try {
    let query_modified: string = query.replaceAll(" ","+");
    const url: string = `https://www.google.com/search?q=${query_modified}+gemini+overview`

    chrome.tabs.create({
      url: url
    })
    return "great success";
  } catch (e) {
    console.log(`error in searchAndScrape service worker ${e}`);
    return undefined;
  }
}

export default function App() {
  // const messageHandler = useCallback((msg, sender, sendResponse) => {
  //   if (msg.action === 'USER_PROMPT') {
  //     console.log("Content Script received message with new prompt:", msg.dataToSend);        
  //     sendResponse({ status: "success", received: true }); 
  //     return true; 
  //   }
  // }, []); 
  // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   if (message.action === 'SCRAPE_OVERVIEW') {
  //     console.log("received new tab request");
  //     searchAndScrapeGeminiOverview(message.dataToSend);
  //     sendResponse({ status: "success", received: true});
  //     return true;
  //   }
  // }
  // );
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
