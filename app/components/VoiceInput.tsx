'use client';

import { AudioLines, CirclePause } from 'lucide-react';
import { useRef, useState } from 'react';

export default function VoiceInput({ onTranscriptionComplete }: { onTranscriptionComplete: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsProcessing(true);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.text) {
        onTranscriptionComplete(data.text);
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center font-mono justify-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`px-6 py-2 rounded-full font-medium transition-colors ${
          isRecording ? 'bg-[#faf9f5] text-[hsl(0deg,16%,48%)]' : 'bg-[#faf9f5] text-[hsl(0deg,16%,48%)]'
        }`}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="text-sm">Processing...</span>
        ) : isRecording ? (
          <CirclePause className="size-5" />
        ) : (
          <AudioLines className="size-5" />
        )}
      </button>
      {isRecording && (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-mono">Recording...</span>
        </div>
      )}
    </div>
  );
}
