import React, { useState, useEffect, useRef } from 'react';

const DitherReveal = () => {
  const [progress, setProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  const text = "PROTOTYPE";
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Draw text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 120px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply dithering based on progress
    const ditherSize = 4;
    
    for (let y = 0; y < height; y += ditherSize) {
      for (let x = 0; x < width; x += ditherSize) {
        const i = (y * width + x) * 4;
        const brightness = data[i]; // R channel
        
        // Threshold based on progress and position
        const threshold = 255 * (1 - progress);
        const noise = Math.random() * 50;
        
        const shouldShow = brightness > threshold - noise;
        
        // Draw dithered block
        ctx.fillStyle = shouldShow ? '#ffffff' : '#000000';
        ctx.fillRect(x, y, ditherSize, ditherSize);
      }
    }
  }, [progress]);

  const startAnimation = () => {
    setIsAnimating(true);
    setProgress(0);
    
    const duration = 3000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min(elapsed / duration, 1);
      
      setProgress(newProgress);
      
      if (newProgress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  const resetAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setProgress(0);
    setIsAnimating(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-4xl w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-light text-gray-800">Prototype</h1>
          <span className="text-5xl font-light text-gray-300">02</span>
        </div>
        
        <div className="relative bg-black rounded-lg overflow-hidden mb-6">
          <canvas 
            ref={canvasRef}
            width={1000}
            height={400}
            className="w-full h-auto"
          />
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-normal text-gray-800">
              Test ideas. Validate impact.
            </h2>
            <span className="text-sm text-gray-500">
              Experimentation. Proof of value.
            </span>
          </div>
          
          <p className="text-sm text-gray-600 leading-relaxed">
            Turn insight to action. By starting small and proving value early, we build
            confidence feedback and lay the groundwork for scalable deployment.
          </p>
          
          <div className="flex gap-4 pt-4">
            <button
              onClick={startAnimation}
              disabled={isAnimating}
              className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isAnimating ? 'Animating...' : 'Play Animation'}
            </button>
            
            <button
              onClick={resetAnimation}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-600">Progress:</span>
              <span className="text-sm font-mono text-gray-800">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-black h-2 rounded-full transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DitherReveal;
