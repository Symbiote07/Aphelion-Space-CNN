import React, { useState, useRef, useEffect } from 'react';
import { Target, Terminal, Cpu, AlertTriangle, Crosshair } from 'lucide-react';

const AphelionHUD = () => {
  // --- STATE & MEMORY ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanData, setScanData] = useState({ class: 'PENDING', confidence: '0.0%' });
  const [heatmapUrl, setHeatmapUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // --- BACKGROUND ANIMATION (The Starfield) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas to full window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Generate random stars
    const stars = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      alpha: Math.random(),
      speed: Math.random() * 0.05 + 0.01
    }));

    // Animate stars
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(star => {
        star.alpha += star.speed;
        if (star.alpha > 1 || star.alpha < 0) star.speed *= -1;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${Math.abs(star.alpha)})`; // Cyan colored stars
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // --- LOGIC: HANDLE FILE UPLOAD ---
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setScanData({ class: 'TARGET LOCKED', confidence: '---' });
      setHeatmapUrl(null); // Clear previous heatmap
    }
  };

  // --- LOGIC: THE BRIDGE (SEND TO PYTHON) ---
  const executeScan = async () => {
    if (!selectedFile) return;

    setIsScanning(true);
    setScanData({ class: 'ANALYZING TENSORS...', confidence: 'CALCULATING' });

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // 🚀 Shooting the image to FastAPI on Port 8000
      const response = await fetch('http://localhost:8000/api/v1/scan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Backend connection failed.");

      const result = await response.json();
      
      // Update UI with the AI predictions
      setScanData({ 
        class: result.anomaly_class || result.prediction || 'UNKNOWN', 
        confidence: result.confidence || '100%' 
      });
      
      // Display Grad-CAM if available
      if (result.heatmap) {
        setHeatmapUrl(`data:image/jpeg;base64,${result.heatmap}`);
      }

    } catch (error) {
      console.error("Scan Failed:", error);
      setScanData({ class: 'SYSTEM FAILURE', confidence: 'ERROR' });
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-cyan-500 font-mono overflow-hidden selection:bg-cyan-900">
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-40 pointer-events-none" />
      
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        accept="image/*" 
        className="hidden" 
      />

      <div className="relative z-10 p-8 h-full flex flex-col justify-between max-w-7xl mx-auto">
        
        {/* HEADER */}
        <header className="flex justify-between items-start">
          <div className="border border-cyan-500/30 bg-cyan-950/20 p-6 backdrop-blur-sm rounded-sm shadow-[0_0_15px_rgba(34,211,238,0.1)]">
            <h1 className="text-4xl font-bold tracking-[0.2em] text-cyan-400 mb-2">APHELION</h1>
            <p className="text-cyan-700 tracking-widest text-xs uppercase flex items-center gap-2">
              <Cpu size={14} /> DEEP LEARNING CELESTIAL EXTRACTION // v4.2
            </p>
          </div>
          
          <div className="border border-red-500/30 bg-red-950/20 p-4 backdrop-blur-sm flex flex-col items-end">
            <span className="text-red-700 text-xs tracking-widest mb-1">SYS_STATUS</span>
            <span className="text-red-500 font-bold tracking-widest animate-pulse flex items-center gap-2">
              <AlertTriangle size={16} /> {isScanning ? 'PROCESSING' : (selectedFile ? 'ARMED' : 'STANDBY')}
            </span>
          </div>
        </header>

        {/* MAIN HUD DISPLAY */}
        <main className="flex-1 flex items-center justify-between mt-8 mb-8">
          
          {/* LEFT PANEL: TERMINAL */}
          <div className="w-80 border border-cyan-500/30 bg-cyan-950/10 p-4 h-96 backdrop-blur-md">
            <div className="border-b border-cyan-800 pb-2 mb-4 flex items-center gap-2">
              <Terminal size={16} />
              <h2 className="text-sm tracking-widest font-bold">TERMINAL LOG</h2>
            </div>
            <div className="text-xs text-cyan-600 space-y-4 opacity-80">
              <p>{'>'} AWAITING TELEMETRY...</p>
              {selectedFile && <p>{'>'} TELEMETRY ACQUIRED. SPATIAL TENSORS ALIGNED.</p>}
              {isScanning && (
                <>
                  <p className="animate-pulse text-cyan-400">{'>'} EXECUTING MOBILENET_V2 FEATURE EXTRACTION...</p>
                  <p className="animate-pulse text-cyan-400">{'>'} CALCULATING GRAD-CAM GRADIENTS...</p>
                </>
              )}
              {heatmapUrl && <p className="text-red-400">{'>'} ANOMALY CLASSIFIED. HEATMAP GENERATED.</p>}
            </div>
          </div>

          {/* CENTER PANEL: TARGETING RETICLE */}
          <div className="relative flex justify-center items-center">
            {/* Sci-fi crosshairs/brackets */}
            <div className="absolute w-96 h-96 border border-cyan-500/20 rounded-full" />
            <div className="absolute w-[400px] h-[400px] border border-dashed border-cyan-500/30 rounded-full animate-[spin_60s_linear_infinite]" />
            
            {/* The Image Viewer */}
            <div className="relative w-64 h-64 border-2 border-cyan-400 bg-cyan-950/20 flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)] rounded-full group">
              {heatmapUrl ? (
                <img src={heatmapUrl} alt="Grad-CAM Heatmap" className="w-full h-full object-cover mix-blend-screen opacity-90 transition-all duration-500" />
              ) : previewUrl ? (
                <img src={previewUrl} alt="Target" className="w-full h-full object-cover opacity-80" />
              ) : (
                <Crosshair className={`w-16 h-16 text-cyan-700 ${isScanning ? 'animate-spin' : ''}`} />
              )}
              
              {/* Overlay targeting lines */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-500/40" />
                <div className="absolute left-1/2 top-0 w-[1px] h-full bg-cyan-500/40" />
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: ACTIONS & DATA */}
          <div className="w-80 space-y-6">
            
            {/* Prediction Block */}
            <div className="border border-cyan-500/30 bg-cyan-950/10 p-6 backdrop-blur-md">
              <div className="border-b border-cyan-800 pb-2 mb-4 flex items-center gap-2">
                <Target size={16} />
                <h2 className="text-sm tracking-widest font-bold">ORACLE CONSENSUS</h2>
              </div>
              
              <div className="space-y-4 text-sm font-bold tracking-widest">
                <div className="flex justify-between items-center border-b border-cyan-900/50 pb-2">
                  <span className="text-cyan-700">CLASS:</span>
                  <span className={`${scanData.class === 'PENDING' ? 'text-cyan-800' : 'text-cyan-300'}`}>
                    {scanData.class}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cyan-700">CONFIDENCE:</span>
                  <span className="text-red-400">{scanData.confidence}</span>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => fileInputRef.current.click()}
                disabled={isScanning}
                className="w-full bg-cyan-950 border border-cyan-600/50 text-cyan-500 py-3 px-4 hover:bg-cyan-900 transition-all font-mono tracking-widest text-xs disabled:opacity-50"
              >
                {selectedFile ? 'CHANGE TELEMETRY' : 'UPLOAD TELEMETRY'}
              </button>

              <button 
                onClick={executeScan}
                disabled={isScanning || !selectedFile}
                className={`w-full border py-4 px-6 transition-all font-bold tracking-widest text-sm shadow-[0_0_15px_rgba(34,211,238,0.1)] ${
                  isScanning 
                    ? 'bg-red-950/50 border-red-500/50 text-red-500 animate-pulse cursor-not-allowed' 
                    : !selectedFile 
                      ? 'bg-cyan-950/20 border-cyan-900/50 text-cyan-800 cursor-not-allowed'
                      : 'bg-cyan-600/20 border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 hover:shadow-[0_0_25px_rgba(34,211,238,0.4)]'
                }`}
              >
                {isScanning ? 'EXECUTING SCAN...' : 'INITIATE SCAN'}
              </button>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <footer className="flex justify-between text-[10px] tracking-widest text-cyan-800 border-t border-cyan-900/50 pt-4">
          <span>LOC: 34.542, -112.441</span>
          <span>POWERED BY TENSORFLOW & FASTAPI</span>
          <span>ENCRYPTION: ENABLED</span>
        </footer>
      </div>
    </div>
  );
};

export default AphelionHUD;