'use client';
import { useState, useRef, useEffect } from 'react';

import { Message as BaseMessage } from 'ai';

// Extend the Message type to include reasoning and critic number
interface Message extends BaseMessage {
  reasoning?: string;
  criticNumber?: number;
  isLoading?: boolean;
}

interface DeepseekFormProps {
  transcription: Message[];
  numCritics: number;
}

const UserMessage = ({ message }: { message: Message; index: number }) => {
  const [showThought, setShowThought] = useState(false);
  return (
    <div className=" w-fit">
      <div className="">
        <button
          type="button"
          onClick={() => setShowThought(prev => !prev)}
          className="text-xs font-mono w-fit p-2 rounded-b-xl rounded-tl-lg px-4 bg-[hsl(0deg,16%,48%)] text-[#faf9f5] font-medium mb-1"
        >
          Idea...
        </button>
        {showThought ? (
          <div className="whitespace-pre-wrap bg-white p-2 rounded-t-xl rounded-tr-lg -top-[38px] left-[81px] w-fit  absolute overflow-auto font-mono text-sm">
            {message.content}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const AssistantMessage = ({
  message,
  expandedReasoning,
  toggleReasoning,
  currentCritic,
}: {
  message: Message;
  index: number;
  expandedReasoning: Set<string>;
  toggleReasoning: (messageId: string) => void;
  currentCritic: number;
}) => {
  const reasoningRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reasoningRef.current && expandedReasoning.has(message.id)) {
      reasoningRef.current.scrollTop = reasoningRef.current.scrollHeight;
    }
  }, [message.reasoning, expandedReasoning]);

  return (
    <div className="relative w-1/2">
      <div className="p-3 rounded-b-lg relative shadow rounded-tr-lg bg-white text-gray-800 mr-auto">
        <div className="relative">
          <button
            onClick={() => toggleReasoning(message.id)}
            className="text-xs font-mono w-fit p-2 rounded-b-xl rounded-tl-lg px-4 bg-[hsl(0deg,16%,48%)] text-[#faf9f5] font-medium mb-1"
          >
            Reasoning
          </button>
          {message.reasoning && expandedReasoning.has(message.id) && (
            <div className="absolute rounded-xl z-50 transform translate-x-full -translate-y-1/4 bg-white shadow-lg border border-gray-200 rounded-t-xl rounded-tr-lg p-4 min-w-[300px] max-w-[600px]">
              <div
                ref={reasoningRef}
                className="whitespace-pre-wrap font-mono max-h-[200px] overflow-auto text-xs scroll-smooth"
              >
                <div className="text-xs font-semibold mb-2 text-gray-700">Reasoning:</div>
                {message.reasoning}
              </div>
            </div>
          )}
        </div>

        <div className="absolute top-0 z-20 -left-12 w-10 h-10 bg-white shadow grid place-items-center rounded-b-xl rounded-tl-lg">
          <svg
            className="text-[hsl(0deg,16%,48%)] inline h-5 w-5"
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0517 21.0773C16.7127 21.0773 20.4911 17.2988 20.4911 12.6379C20.4911 7.97692 16.7127 4.19846 12.0517 4.19846C7.39074 4.19846 3.61228 7.97692 3.61228 12.6379C3.61228 17.2988 7.39074 21.0773 12.0517 21.0773ZM12.0517 23.0021C17.7757 23.0021 22.4159 18.3619 22.4159 12.6379C22.4159 6.91389 17.7757 2.27368 12.0517 2.27368C6.32771 2.27368 1.6875 6.91389 1.6875 12.6379C1.6875 18.3619 6.32771 23.0021 12.0517 23.0021Z"
              fill="currentColor"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M21.7604 15.9482C20.3777 19.8074 16.6877 22.5682 12.3529 22.5682C12.2795 22.5682 12.2062 22.5674 12.1331 22.5659C11.1367 20.1776 10.7021 17.6643 11.0679 14.9347C11.1946 14.4818 11.37 13.8202 11.3419 13.2212C11.3291 12.9471 11.0284 12.9803 10.9529 13.2442C10.8608 13.5658 10.7324 13.903 10.5696 14.2011C10.3829 14.2316 10.1447 14.253 9.84442 14.2353C8.89878 14.1797 8.20169 13.6862 8.05277 13.5267C7.78227 13.6493 7.76532 13.7401 7.7491 13.827C7.7389 13.8817 7.729 13.9347 7.6565 13.9932L7.63423 14.0114C7.50276 14.1195 7.40664 14.1985 7.10473 13.7403C6.83312 13.2077 6.63285 12.43 7.44954 11.5934C7.93537 11.0958 8.90676 10.6894 9.04515 10.6681C9.04515 9.88096 9.66213 8.46196 11.4283 7.96536C13.2916 7.44146 15.4425 7.97378 16.6851 9.79022C17.4657 10.9313 17.5423 11.5907 17.6007 12.0938C17.6616 12.6182 17.7028 12.973 18.5008 13.5267C18.7213 13.6796 18.9427 13.8289 19.166 13.9795C19.9916 14.5361 20.8425 15.1097 21.7604 15.9482ZM12.0158 10.7617C12.3108 10.7617 12.5499 10.5226 12.5499 10.2276C12.5499 9.93255 12.3108 9.6934 12.0158 9.6934C11.7208 9.6934 11.4816 9.93255 11.4816 10.2276C11.4816 10.5226 11.7208 10.7617 12.0158 10.7617Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-xs bg-[hsl(0deg,16%,48%)] size-4 grid place-items-center rounded-full text-white absolute -right-[3px] top-[29px] font-mono">
            {currentCritic}
          </span>
        </div>
        <div className="whitespace-pre-wrap max-h-[400px] overflow-auto font-mono text-sm ml-auto">
          {message.isLoading ? <Blink /> : message.content}
        </div>
      </div>
    </div>
  );
};

export function ConversationCanvas({ transcription, numCritics }: DeepseekFormProps) {
  const [expandedReasoning, setExpandedReasoning] = useState<Set<string>>(new Set());
  const [currentCritic, setCurrentCritic] = useState(1);
  const [criticMessages, setCriticMessages] = useState<Message[]>([]);
  const [agentIndicators, setAgentIndicators] = useState<React.ReactNode[]>([]);

  const toggleReasoning = (messageId: string) => {
    setExpandedReasoning(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Update agent indicators when numCritics changes
  useEffect(() => {
    const indicators = Array.from({ length: numCritics }, (_, i) => (
      <div key={`agent-${i + 1}`} className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm animate-fadeIn">
        <div className="w-8 h-8 bg-white shadow grid place-items-center rounded-lg">
          <svg
            className="text-[hsl(0deg,16%,48%)] inline h-5 w-5"
            width="24"
            height="25"
            viewBox="0 0 24 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.0517 21.0773C16.7127 21.0773 20.4911 17.2988 20.4911 12.6379C20.4911 7.97692 16.7127 4.19846 12.0517 4.19846C7.39074 4.19846 3.61228 7.97692 3.61228 12.6379C3.61228 17.2988 7.39074 21.0773 12.0517 21.0773ZM12.0517 23.0021C17.7757 23.0021 22.4159 18.3619 22.4159 12.6379C22.4159 6.91389 17.7757 2.27368 12.0517 2.27368C6.32771 2.27368 1.6875 6.91389 1.6875 12.6379C1.6875 18.3619 6.32771 23.0021 12.0517 23.0021Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <span className="text-xs font-mono">Agent {i + 1}</span>
      </div>
    ));
    setAgentIndicators(indicators);
  }, [numCritics]);

  const processCritic = async (prompt: string, criticNumber: number, previousResponses: Message[]) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          criticNumber,
          previousResponses,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';
      let accumulatedReasoning = '';

      // Create a new message for this critic
      const criticMessageId = `${Date.now()}-${criticNumber}`;
      const criticMessage: Message = {
        id: criticMessageId,
        role: 'assistant',
        content: '',
        criticNumber: criticNumber,
        isLoading: true,
      };

      // Add the critic message to criticMessages
      setCriticMessages(prev => [...prev, criticMessage]);

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          // Update the message one final time to mark it as not loading
          setCriticMessages(prev =>
            prev.map(msg =>
              msg.id === criticMessageId
                ? {
                    ...msg,
                    content: accumulatedContent,
                    reasoning: accumulatedReasoning,
                    isLoading: false,
                  }
                : msg,
            ),
          );
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const { content, reasoning } = JSON.parse(line);
            accumulatedContent += content;
            accumulatedReasoning += reasoning;

            // Update the critic message in criticMessages
            setCriticMessages(prev =>
              prev.map(msg =>
                msg.id === criticMessageId
                  ? {
                      ...msg,
                      content: accumulatedContent,
                      reasoning: accumulatedReasoning,
                      isLoading: true,
                    }
                  : msg,
              ),
            );

            setCurrentCritic(criticNumber);
          } catch (error) {
            console.error('Error parsing JSON:', error);
          }
        }
      }

      return { content: accumulatedContent, reasoning: accumulatedReasoning };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!transcription.length) return;

    const processAllCritics = async () => {
      // Get the latest user message
      const userMessage = transcription[transcription.length - 1];

      // Only process if it's a user message
      if (userMessage.role !== 'user') return;

      // Reset critic messages and add the user message first
      setCriticMessages([
        {
          ...userMessage,
          id: `user-${Date.now()}`,
        },
      ]);

      try {
        const previousResponses: Message[] = [];

        // Process each critic in sequence
        for (let i = 1; i <= numCritics; i++) {
          setCurrentCritic(i);
          const response = await processCritic(userMessage.content, i, previousResponses);
          previousResponses.push({
            id: `${Date.now()}-${i}`,
            role: 'assistant',
            content: response.content,
            reasoning: response.reasoning,
            criticNumber: i,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Error processing critics:', error);
      } finally {
        setCurrentCritic(1);
      }
    };

    processAllCritics();
  }, [transcription, numCritics]);

  return (
    <div className="flex w-[40rem] relative mx-auto flex-col gap-4">
      {/* Agent Indicators */}
      <div className="flex flex-wrap gap-2 mb-4">{agentIndicators}</div>

      <div className="space-y-4">
        {criticMessages.map((message, index) =>
          message.role === 'user' ? (
            <UserMessage key={message.id} message={message} index={index} />
          ) : (
            <AssistantMessage
              currentCritic={message.criticNumber || currentCritic}
              key={message.id}
              message={message}
              index={index}
              expandedReasoning={expandedReasoning}
              toggleReasoning={toggleReasoning}
            />
          ),
        )}
      </div>
    </div>
  );
}

function Blink() {
  return (
    <>
      <span className="inline-block w-2 h-4 bg-gray-800 animate-[blink_1s_infinite]"></span>
      <style jsx global>{`
        @keyframes blink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
}
