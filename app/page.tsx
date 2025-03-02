'use client';

import { useState, useEffect } from 'react';
import VoiceInput from './components/VoiceInput';
import ImageInput from './components/ImageInput';

// Define the Message interface
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}


export default function Home() {
  const [transcription, setTranscription] = useState<string[]>([]);

  return (
    <section className="text-[hsl(0deg,16%,48%)] h-screen w-full grid pt-[10%]">
      <div className='w-[40rem] mx-auto flex-col flex p-2'>
        <div className="mt-4 p-3 flex-1 bg-[#faf9f5] rounded-lg">
          <DeepseekForm transcription={transcription}/>
        </div>
        <div className="min-h-20 rounded-lg mx-auto p-4 space-y-4">
          <h1 className="font-mono font-medium text-center">Refine your idea</h1>
          <div className="flex items-end justify-center gap-4">
            <VoiceInput onTranscriptionComplete={(text) => setTranscription([...transcription, text])} />
            <ImageInput onImageProcessed={(text) => setTranscription([...transcription, text])} />
          </div>
        </div>
      </div>
    </section>
  );
}


function DeepseekForm({transcription}: {transcription: string[]}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if(!transcription.length) return;
    const userMessage: Message = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: transcription.join('\n') 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

  async function postMessage(){
      try {
      // Create a new message for the assistant's response
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: ''
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      // Make the API request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle the streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is null');

      // Process the stream
      const decoder = new TextDecoder();
      let done = false;
      let accumulatedContent = '';

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true });
          
          try {
            // Parse the chunk as SSE format
            const lines = chunk.split('\n\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const jsonStr = line.slice(6);
                if (jsonStr === '[DONE]') continue;
                
                try {
                  const data = JSON.parse(jsonStr);
                  if (data.type === 'text') {
                    accumulatedContent += data.value || '';
                  }
                } catch {
                  // If it's not valid JSON, just append the raw text
                  accumulatedContent += jsonStr;
                }
              }
            }
            
            // Update the assistant message in the messages array
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: accumulatedContent } 
                  : msg
              )
            );
          } catch {
            // If parsing fails, just append the raw chunk
            accumulatedContent += chunk;
            
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { ...msg, content: accumulatedContent } 
                  : msg
              )
            );
          }
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now().toString(), 
          role: 'assistant', 
          content: 'Sorry, there was an error processing your request.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  postMessage();
  }, [transcription]);



  return (
    <div className='flex flex-col'>
      <div className="space-y-4 mt-4">
        {messages.map(message => (
          <div key={message.id} className={`p-3 rounded-lg ${
            message.role === 'user' ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-800'
          }`}>
            <div className="text-xs font-medium mb-1">
              {message.role === 'user' ? 'Your Idea:' : 'Critic 1'}
            </div>
            <div className="whitespace-pre-wrap max-h-[400px] overflow-y-scroll font-mono text-sm">
              {isLoading && message.role === 'assistant' ? <span>Thinking...</span> : message.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}