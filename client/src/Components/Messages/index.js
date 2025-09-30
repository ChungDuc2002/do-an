import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerStyle={{ top: 20 }}
        toastOptions={{
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '16px',
            borderRadius: '7px',
            padding: '7px 20px',
          },
          success: {
            duration: 4000,
            style: {
              background: '#4CAF50',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ebc8c4',
              color: '#EE4E4E',
            },
            iconTheme: {
              primary: 'red',
              secondary: '#FFFAEE',
            },
          },
          loading: {
            duration: 1000,
            style: {
              background: '#363636',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
