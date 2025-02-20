
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Provider } from 'react-redux'; // Make sure this is imported
import store, { persistor } from './redux/store'; // Ensure this is your Redux store
import { PersistGate } from 'redux-persist/integration/react';

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <GoogleOAuthProvider clientId="your-client-id">
        <Provider store={store}> {/* Ensure this wraps App */}
          <PersistGate loading={null} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </GoogleOAuthProvider>
    </StrictMode>
  );
} else {
  console.error('Root element not found');
}
