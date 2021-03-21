import { useEffect, useState } from "react";
import { GlobalStyle } from "./styles/global";

interface BackgroundData {
  url: string;
  copyright: string;
}

export function App() {
  const [backgroundData, setBackgroundData] = useState<BackgroundData>({} as BackgroundData);

  useEffect(() => {
    fetch (`https://api.allorigins.win/get?url=${encodeURIComponent('https://bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US')}`)
      .then(response => response.json())
      .then(data => {
          let HPImageArchive = JSON.parse(data['contents'])['images'][0];
          console.log(HPImageArchive);
          setBackgroundData(HPImageArchive);
          console.log(backgroundData);
      })
      .catch((error) => {
          console.error(error);
      })
  }, [setBackgroundData]);

  return (
    <>
    <h1>teste</h1>    
    <GlobalStyle background={backgroundData}/> 
    </>
  );
}
