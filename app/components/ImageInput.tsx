'use client';

import { Camera, CirclePause } from 'lucide-react';
import { useRef, useState } from 'react';

export default function ImageInput({ onImageProcessed }: { onImageProcessed: (text: string) => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setIsVideoLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setIsVideoLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setShowCamera(false);
      setIsVideoLoading(true);
    }
  };

  const captureImage = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw the video frame to canvas
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            await processImage(file);
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'vision');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.text) {
        onImageProcessed(data.text);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center font-mono justify-center gap-4">
      {showCamera && (
        <div className="relative">
          {isVideoLoading && (
            <div className="w-[300px] h-[225px] rounded-lg bg-gray-200 animate-pulse" />
          )}
          <video
            width={300}
            height={300}
            ref={videoRef}
            autoPlay
            playsInline
            className={`rounded-lg max-w-sm ${isVideoLoading ? 'hidden' : 'block'}`}
            onLoadedData={() => setIsVideoLoading(false)}
          />
          <button
            onClick={captureImage}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 rounded-full font-medium text-[hsl(0deg,16%,48%)]"
            disabled={isProcessing}
          >
            {isProcessing ? <span className="text-sm">Processing...</span> : <div className='flex items-center gap-2'><span className='bg-[#faf9f5] w-32 px-2 py-1 inline-block rounded-full text-sm'>Take Photo</span ><span onClick={stopCamera} className='bg-[#faf9f5] p-1 rounded-full text-sm'><CirclePause /></span></div>}
          </button>
        </div>
      )}
      {!showCamera && (
        <button
          onClick={startCamera}
          className="px-6 py-2 rounded-full font-medium transition-colors bg-[#faf9f5] text-[hsl(0deg,16%,48%)]"
          disabled={isProcessing}
        >
          {isProcessing ? <span className="text-sm">Processing...</span> : <Camera className='size-5' />}
        </button>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 