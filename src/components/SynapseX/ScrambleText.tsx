import React, { useState, useEffect, useRef } from 'react';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

interface ScrambleInProps {
  text: string;
  delay?: number;
  triggered: boolean;
  className?: string;
}

export const ScrambleIn: React.FC<ScrambleInProps> = ({ 
  text, 
  delay = 0, 
  triggered, 
  className = '' 
}) => {
  const [displayText, setDisplayText] = useState<string>('');
  const [isStarted, setIsStarted] = useState(false);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!triggered) {
      setDisplayText('');
      setIsStarted(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsStarted(true);
      frameRef.current = 0;

      const interval = setInterval(() => {
        frameRef.current += 1;
        // 0.5 chars revealed per frame (every 25ms) -> 1 char every 2 frames
        const cursor = Math.floor(frameRef.current * 0.5);

        if (cursor >= text.length) {
          setDisplayText(text);
          clearInterval(interval);
          return;
        }

        let result = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') {
            result += ' ';
            continue;
          }
          if (i < cursor) {
            result += text[i];
          } else if (i <= cursor + 3) {
            const randomChar = CHARS[Math.floor(Math.random() * CHARS.length)];
            result += randomChar;
          } else {
            // beyond cursor + 3 are empty or omitted
            break;
          }
        }
        setDisplayText(result);
      }, 25);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [triggered, text, delay]);

  if (!triggered || !isStarted) {
    return <span className={className} dangerouslySetInnerHTML={{ __html: '&nbsp;' }} />;
  }

  return <span className={className}>{displayText || '\u00A0'}</span>;
};

interface ScrambleTextProps {
  text: string;
  isHovered: boolean;
  className?: string;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({ 
  text, 
  isHovered, 
  className = '' 
}) => {
  const [displayText, setDisplayText] = useState<string>(text);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }

    // On hover: scrambles all chars with random chars, then reveals left-to-right at 4 frames/char, interval 25ms
    frameRef.current = 0;
    const interval = setInterval(() => {
      frameRef.current += 1;
      const revealCharIndex = Math.floor(frameRef.current / 4);

      if (revealCharIndex >= text.length) {
        setDisplayText(text);
        clearInterval(interval);
        return;
      }

      let result = '';
      for (let i = 0; i < text.length; i++) {
        if (text[i] === ' ') {
          result += ' ';
        } else if (i < revealCharIndex) {
          result += text[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplayText(result);
    }, 25);

    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span className={className}>{displayText}</span>;
};
