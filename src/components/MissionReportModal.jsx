import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, UploadCloud, X, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { verifyQuestImage } from '../lib/gemini';

export default function MissionReportModal({ reportingQuest, onClose, onSubmit }) {
  const [proofImage, setProofImage] = useState('');
  const [reflection, setReflection] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Attach stream when video element mounts
  useEffect(() => {
    if (isCameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isCameraActive]);

  // Stop camera when modal closes or unmounts
  useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    setVerificationError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setVerificationError("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Calculate new dimensions (max 800px width) to prevent massive base64 strings
      const MAX_WIDTH = 800;
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > MAX_WIDTH) {
        height = Math.floor(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, width, height);
      
      // Get compressed base64 string
      const imageData = canvas.toDataURL('image/jpeg', 0.6);
      setProofImage(imageData);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setProofImage('');
    setVerificationError('');
    startCamera();
  };

  const handleSubmit = async () => {
    if (!proofImage || reflection.length < 50) return;
    
    setIsVerifying(true);
    setVerificationError('');

    try {
      const verification = await verifyQuestImage(proofImage, reportingQuest.title);
      
      if (!verification.verified) {
        setVerificationError(verification.reason);
        setIsVerifying(false);
        return;
      }
    } catch (err) {
      setVerificationError("An unexpected error occurred during AI verification.");
      setIsVerifying(false);
      return;
    }

    setIsSuccess(true);
    await onSubmit(proofImage, reflection);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <motion.div 
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ zIndex: 1000 }}
      onClick={() => {
        if (!isVerifying && !isCameraActive) onClose();
      }}
    >
      <motion.div 
        className="quest-detail-modal asset-container"
        onClick={e => e.stopPropagation()}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ width: '95%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        {(() => {
          let cleanDescription = reportingQuest.description || '';
          let photoReq = "Photo Requirement: Snap a pic showing your completed work!";
          
          if (cleanDescription.includes("📸 Photo Requirement:")) {
            const parts = cleanDescription.split("📸 Photo Requirement:");
            cleanDescription = parts[0].trim();
            photoReq = "Photo Requirement:" + parts[1].trim();
          } else if (cleanDescription.includes("Photo Requirement:")) {
            const parts = cleanDescription.split("Photo Requirement:");
            cleanDescription = parts[0].trim();
            photoReq = "Photo Requirement:" + parts[1].trim();
          }

          return (
            <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--wood-light)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <h2 style={{ color: 'var(--konoha-blue)', margin: 0 }}>Adventure Log</h2>
          <button 
            onClick={onClose} 
            disabled={isVerifying}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-light)', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={24} />
          </button>
        </div>
        
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{reportingQuest.title}</p>
        
        {cleanDescription && (
          <div style={{ background: 'var(--wood-light)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--ink-dark)', borderLeft: '4px solid var(--konoha-green)', whiteSpace: 'pre-wrap' }}>
            {cleanDescription}
          </div>
        )}
        
        {isSuccess ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              style={{ display: 'inline-block', background: '#38A169', color: '#fff', borderRadius: '50%', padding: '1rem', marginBottom: '1rem' }}
            >
              <ShieldCheck size={48} />
            </motion.div>
            <h2 style={{ color: '#38A169', marginBottom: '0.5rem' }}>Quest Completed!</h2>
            <p style={{ color: 'var(--ink-light)' }}>The Guildmaster has accepted your proof. Logging adventure to the Tavern...</p>
          </div>
        ) : (
          <div className="report-form">
            <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Live Proof <ShieldCheck size={16} color="var(--konoha-green)" />
            </label>
          
          <div className="proof-upload-box" style={{ 
            border: '2px dashed var(--wood-medium)', padding: isCameraActive ? '0' : '1rem', borderRadius: '8px', textAlign: 'center', marginBottom: '1rem', position: 'relative', overflow: 'hidden', background: proofImage || isCameraActive ? '#000' : '#F7FAFC'
          }}>
            
            {/* Hidden Canvas for capturing */}
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>

            {isCameraActive ? (
              <div style={{ position: 'relative', width: '100%', paddingTop: '75%' /* 4:3 aspect ratio */ }}>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
                  <button 
                    onClick={capturePhoto}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fff', border: '4px solid var(--konoha-blue)', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}
                  />
                </div>
              </div>
            ) : proofImage ? (
              <div style={{ position: 'relative' }}>
                <img src={proofImage} alt="Proof" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />
                <button 
                  className="btn-secondary"
                  onClick={handleRetake}
                  disabled={isVerifying}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', padding: '0.4rem', borderRadius: '50%', background: 'rgba(255,255,255,0.8)' }}
                >
                  <RefreshCw size={18} />
                </button>
              </div>
            ) : (
              <div 
                style={{ padding: '2rem 0', color: 'var(--ink-light)', cursor: 'pointer' }}
                onClick={startCamera}
              >
                <Camera size={32} style={{ margin: '0 auto 0.5rem auto' }} />
                <p>Tap to open Live Camera</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.8rem', color: 'var(--ink-dark)', fontWeight: 'bold', fontStyle: 'italic', background: 'rgba(255,112,0,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                  {photoReq}
                </p>
              </div>
            )}
          </div>

          {/* Verification Error Box */}
          {verificationError && (
            <div style={{ background: '#FED7D7', color: '#E53E3E', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={18} style={{ flexShrink: 0 }} />
              <div>
                <strong>Verification Failed:</strong> {verificationError}
              </div>
            </div>
          )}

          <label style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
            Adventure Note (Required)
          </label>
          <textarea 
            value={reflection} onChange={e => setReflection(e.target.value)} 
            disabled={isVerifying || isCameraActive}
            placeholder="What happened? How did it feel? What did you learn? (Min 50 chars)"
            style={{ width: '100%', padding: '0.8rem', border: '2px solid var(--wood-medium)', borderRadius: '6px', minHeight: '100px', fontFamily: 'inherit', marginBottom: '1rem', resize: 'none' }}
          />
          <div style={{ fontSize: '0.8rem', color: reflection.length < 50 ? 'red' : 'green', textAlign: 'right', marginTop: '-0.8rem', marginBottom: '1rem' }}>
            {reflection.length}/50
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSubmit} 
            disabled={isVerifying || !proofImage || reflection.length < 50 || isCameraActive}
            style={{ 
              width: '100%', 
              background: (isVerifying || !proofImage || reflection.length < 50 || isCameraActive) ? 'var(--wood-medium)' : '#38A169', 
              borderColor: 'var(--ink-dark)',
              cursor: (isVerifying || !proofImage || reflection.length < 50 || isCameraActive) ? 'not-allowed' : 'pointer',
              color: (isVerifying || !proofImage || reflection.length < 50 || isCameraActive) ? 'var(--ink-dark)' : '#fff'
            }}
          >
            {isVerifying ? (
              <><RefreshCw size={18} className="spin" style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Submitting...</>
            ) : (
              <><UploadCloud size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} /> Submit Adventure</>
            )}
          </button>
        </div>
        )}
            </>
          );
        })()}
      </motion.div>
    </motion.div>
  );
}
