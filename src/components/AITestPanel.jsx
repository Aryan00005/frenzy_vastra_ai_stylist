import React, { useState } from 'react';
import { aiService } from '../services/aiService';

export default function AITestPanel() {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testPythonBackend = async () => {
    setIsLoading(true);
    setTestResult('Testing Python AI Backend...');
    
    try {
      // Test direct backend connection
      const response = await fetch('http://localhost:8002/');
      const result = await response.json();
      
      if (result.message) {
        setTestResult(`✅ Python Backend Connected: ${result.message}`);
        
        // Test AI recommendations
        const aiTest = await aiService.getRecommendations({
          body_type: 'rectangle',
          style_preference: 'casual',
          occasion: 'everyday'
        });
        
        setTestResult(prev => prev + '\n✅ AI Service Working: ' + JSON.stringify(aiTest, null, 2));
      }
    } catch (error) {
      setTestResult(`❌ Backend Error: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border max-w-md">
      <h3 className="font-bold mb-2">🧪 AI Backend Test</h3>
      
      <button
        onClick={testPythonBackend}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2 disabled:opacity-50"
      >
        {isLoading ? 'Testing...' : 'Test Python AI'}
      </button>
      
      {testResult && (
        <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
          {testResult}
        </pre>
      )}
    </div>
  );
}