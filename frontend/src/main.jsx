import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

// Detect if Clerk publishable key has been configured by the user
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = Boolean(
  clerkPubKey &&
  typeof clerkPubKey === 'string' &&
  clerkPubKey.startsWith('pk_') &&
  !clerkPubKey.includes('your_')
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isClerkConfigured ? (
      <ClerkProvider publishableKey={clerkPubKey} afterSignOutUrl="/">
        <AuthProvider clerkEnabled={true}>
          <App />
        </AuthProvider>
      </ClerkProvider>
    ) : (
      <AuthProvider clerkEnabled={false}>
        <App />
      </AuthProvider>
    )}
  </React.StrictMode>,
)
