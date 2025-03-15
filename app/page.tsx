'use client';

import { Message } from 'ai';
import { MinusIcon, PlusIcon, Map, LayoutGrid } from 'lucide-react';
import { useState } from 'react';
import VoiceInput from './components/VoiceInput';
import { ConversationCanvas } from './components/form';
import dynamic from 'next/dynamic';

// Dynamically import the 3D landscape to avoid SSR issues
const LandscapeView = dynamic(() => import('./components/LandscapeView'), {
  ssr: false,
  loading: () => <div className="w-full h-full grid place-items-center">Loading 3D View...</div>,
});

export default function Home() {
  const [transcription, setTranscription] = useState<Message[]>([]);
  const [critics, setCritics] = useState([{ name: 'critic 1' }, { name: 'critic 2' }, { name: 'critic 3' }]);
  const [viewMode, setViewMode] = useState<'flat' | '3d'>('flat');

  const userQuestion = transcription.find(msg => msg.role === 'user')?.content;
  const lastCriticResponse = transcription.filter(msg => msg.role === 'assistant').pop()?.content;

  return (
    <section className="text-[hsl(0deg,16%,48%)] bg-[#faf9f5] relative h-screen w-full grid">
      <div className="h-[calc(100vh-5rem)] w-full flex-col border-[20px] border-white flex p-2">
        <div className="flex items-baseline justify-between">
          <div className="flex-1 max-w-[40rem] mx-auto">
            {userQuestion && (
              <div className="bg-white rounded-lg p-4 shadow-sm space-y-4 mb-4">
                <div className="space-y-2">
                  <h2 className="text-xs font-mono font-medium">Question</h2>
                  <p className="text-sm font-mono">{userQuestion}</p>
                </div>
                {lastCriticResponse && (
                  <div className="space-y-2 pt-2 border-t">
                    <h2 className="text-xs font-mono font-medium">Final Response</h2>
                    <p className="text-sm font-mono">{lastCriticResponse}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <button
              onClick={() => setViewMode(prev => (prev === 'flat' ? '3d' : 'flat'))}
              className="bg-white shadow px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-mono"
            >
              {viewMode === 'flat' ? (
                <>
                  <Map className="size-4" />
                  <span>View 3D</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="size-4" />
                  <span>View Flat</span>
                </>
              )}
            </button>
            <div className="flex gap-2 items-center">
              <span className="font-mono text-sm">Number of critics: {critics.length}</span>
              <button
                className="bg-[#faf9f5] w-fit shadow px-2 py-2 text-sm rounded-lg text-[hsl(0deg,16%,48%)]"
                onClick={() => {
                  if (critics.length < 6) {
                    setCritics([...critics, { name: `critic ${critics.length + 1}` }]);
                  }
                }}
              >
                <PlusIcon className="size-3" />
              </button>
              <button
                onClick={() => {
                  if (critics.length > 1) {
                    setCritics(critics.slice(0, critics.length - 1));
                  }
                }}
                className="bg-[#faf9f5] w-fit shadow px-2 py-2 text-sm rounded-lg text-[hsl(0deg,16%,48%)]"
              >
                <MinusIcon className="size-3" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 p-3 w-full overflow-auto flex-1 rounded-lg">
          {viewMode === 'flat' ? (
            <ConversationCanvas transcription={transcription} numCritics={critics.length} />
          ) : (
            <LandscapeView transcription={transcription} critics={critics} currentQuestion={userQuestion} />
          )}
        </div>
      </div>

      <div className="min-h-20 absolute bottom-0 -translate-x-1/2 left-1/2 rounded-lg mx-auto p-4 space-y-4">
        <div className="flex items-end justify-center gap-4">
          <VoiceInput
            onTranscriptionComplete={text =>
              setTranscription([
                {
                  id: Date.now().toString(),
                  role: 'user',
                  content: text,
                },
              ])
            }
          />
        </div>
      </div>
    </section>
  );
}
