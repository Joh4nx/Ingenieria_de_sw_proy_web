// src/components/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div style={{ padding: '1rem', background: '#ffdede', color: '#d8000c', textAlign: 'center' }}>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;
