import React, { useEffect, useState } from 'react';

interface TypingTextProps {
  text: string;
  speedMs?: number;
  className?: string;
}

const TypingText: React.FC<TypingTextProps> = ({ text, speedMs = 35, className = '' }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
    const interval = setInterval(() => {
      setIndex((prev) => {
        if (prev >= text.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, speedMs);
    return () => clearInterval(interval);
  }, [text, speedMs]);

  const displayed = text.slice(0, index);

  return (
    <span className={`whitespace-pre-wrap font-semibold tracking-wide ${className}`} aria-label={text}>
      {displayed}
      <span className="typing-caret" aria-hidden="true">|</span>
    </span>
  );
};

export default TypingText;

