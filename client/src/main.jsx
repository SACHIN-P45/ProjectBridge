import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <SocketProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1d27',
                color: '#f1f5f9',
                border: '1px solid #2a2d3a',
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
        </SocketProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
