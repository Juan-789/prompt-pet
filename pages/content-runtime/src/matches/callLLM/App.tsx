import { useEffect, useState } from 'react';

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

export default function App() {
  const [data, setData] = useState<LLMResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { //this only gets called once on mount, maybe it should be called everytime the user presses the key
    async function fetchData() {
      const result = await betterPrompt("nothing");
      if (result) {
        setData(result);
      }
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
