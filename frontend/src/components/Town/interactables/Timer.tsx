import { useEffect, useState } from "react";

export function Timer ({seconds}: { seconds: number }): JSX.Element {

    const [timeLeft, setTimeLeft] = useState(seconds);
  
    useEffect(() => {
      if (!timeLeft) return;
      const intervalId = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }, [timeLeft]);
  
    return (
      <div>
        <h1>{timeLeft}</h1>
      </div>
    );
  };