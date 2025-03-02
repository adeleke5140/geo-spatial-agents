import { useState } from 'react';

import { Message } from 'ai';

import { useEffect } from 'react';

export function DeepseekForm({ transcription }: { transcription: string[] }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!transcription.length) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: transcription.join('\n'),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    async function postMessage() {
      try {
        // Create a new message for the assistant's response
        const assistantMessageId = (Date.now() + 1).toString();
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
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

        const data = await response.json();
        setMessages(prev => [
          ...prev,
          { id: assistantMessageId, role: 'assistant', content: JSON.stringify(data, null, 2) },
        ]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: 'Sorry, there was an error processing your request.',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    postMessage();
  }, [transcription]);

  return (
    <div className="flex flex-col">
      <div className="space-y-4 mt-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.role === 'user' ? 'bg-blue-50 text-blue-800' : 'bg-gray-50 text-gray-800'
            }`}
          >
            <div className="text-xs font-medium mb-1">{message.role === 'user' ? 'Your Idea:' : 'Critic 1'}</div>
            <div className="whitespace-pre-wrap max-h-[400px] overflow-y-scroll font-mono text-sm">
              {isLoading && message.role === 'assistant' ? <span>Thinking...</span> : message.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
