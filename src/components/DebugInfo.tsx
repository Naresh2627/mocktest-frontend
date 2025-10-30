import React, { useState } from 'react';
import axios from 'axios';

const DebugInfo: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Not tested');
  const [testing, setTesting] = useState(false);

  const testAPI = async () => {
    setTesting(true);
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
    
    try {
      console.log('Testing API at:', apiUrl);
      const response = await axios.get(`${apiUrl}/`);
      console.log('API Response:', response.data);
      setApiStatus('✅ API is working');
    } catch (error: any) {
      console.error('API Test Error:', error);
      setApiStatus(`❌ API Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      background: 'white', 
      padding: '15px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4>Debug Info</h4>
      <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
      <p><strong>API URL:</strong> {process.env.REACT_APP_API_URL || 'http://localhost:3000'}</p>
      <p><strong>API Status:</strong> {apiStatus}</p>
      
      <button 
        onClick={testAPI} 
        disabled={testing}
        style={{
          background: '#007bff',
          color: 'white',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '12px'
        }}
      >
        {testing ? 'Testing...' : 'Test API'}
      </button>
    </div>
  );
};

export default DebugInfo;