import React, { useState, useEffect } from 'react';

interface PerformanceMonitorProps {
  notesCount: number;
  loading: boolean;
  lastQueryTime?: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  notesCount, 
  loading, 
  lastQueryTime 
}) => {
  const [renderTime, setRenderTime] = useState<number>(0);

  useEffect(() => {
    const startTime = performance.now();
    
    const measureRender = () => {
      const endTime = performance.now();
      setRenderTime(endTime - startTime);
    };

    // Measure render time
    setTimeout(measureRender, 0);
  }, [notesCount]);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="performance-indicator">
      <div>📊 Performance</div>
      <div>Notes: {notesCount}</div>
      <div>Render: {renderTime.toFixed(1)}ms</div>
      {lastQueryTime && <div>Query: {lastQueryTime}ms</div>}
      {loading && <div>🔄 Loading...</div>}
    </div>
  );
};

export default PerformanceMonitor;