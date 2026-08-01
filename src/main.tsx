import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress non-critical third-party Kakao AdFit script errors in sandboxed / dynamic environments
window.addEventListener('error', (event) => {
  if (
    event.message &&
    (event.message.includes('getAttribute') ||
      event.message.includes('kakaocdn') ||
      event.message.includes('adfit'))
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
    return true;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

