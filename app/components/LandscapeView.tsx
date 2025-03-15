import { Message as BaseMessage } from 'ai';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import * as THREE from 'three';

interface Critic {
  name: string;
  position?: THREE.Vector3;
}

// Extend the Message type to include reasoning and critic number
interface Message extends BaseMessage {
  reasoning?: string;
  criticNumber?: number;
  isLoading?: boolean;
}

interface LandscapeViewProps {
  transcription: Message[];
  critics: Critic[];
  currentQuestion?: string;
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full h-full grid place-items-center">
        <div className="text-center space-y-2">
          <p className="text-red-500">Failed to load 3D view</p>
          <button onClick={() => setHasError(false)} className="px-4 py-2 bg-white rounded-lg shadow text-sm">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#a3b18a" />
    </mesh>
  );
}

function CriticCharacter({ position, name, isActive }: { position: THREE.Vector3; name: string; isActive: boolean }) {
  return (
    <group position={position}>
      {/* Character body */}
      <mesh castShadow>
        <capsuleGeometry args={[0.3, 1, 4, 8]} />
        <meshStandardMaterial color={isActive ? '#ffd700' : '#588157'} />
      </mesh>
      {/* Name label */}
      <Text position={[0, 1.5, 0]} fontSize={0.5} color="#344e41" anchorX="center" anchorY="middle">
        {name}
      </Text>
    </group>
  );
}

function QuestionBubble({ text, position }: { text: string; position: THREE.Vector3 }) {
  return (
    <group position={position}>
      <Text position={[0, 0, 0]} fontSize={0.4} color="#344e41" anchorX="center" anchorY="middle" maxWidth={10}>
        {text}
      </Text>
    </group>
  );
}

function ResponsePanel({ text, position }: { text: string; position: THREE.Vector3 }) {
  return (
    <group position={position}>
      <Text position={[0, 0, 0]} fontSize={0.3} color="#344e41" anchorX="left" anchorY="top" maxWidth={4}>
        {text}
      </Text>
    </group>
  );
}

function Scene({ critics = [], currentQuestion, transcription }: LandscapeViewProps) {
  const [criticPositions, setCriticPositions] = useState<THREE.Vector3[]>([]);
  const [activeCritic, setActiveCritic] = useState<number | null>(null);
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);

  useEffect(() => {
    // Only calculate positions if we have critics
    if (critics.length > 0) {
      const radius = 5;
      const positions = critics.map((_, index) => {
        const angle = (index / critics.length) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      });
      setCriticPositions(positions);
    }
  }, [critics.length, critics]);

  useEffect(() => {
    // Animate critics when there's a new question and we have critics
    if (currentQuestion && critics.length > 0) {
      let currentCritic = 0;
      const interval = setInterval(() => {
        if (currentCritic < critics.length) {
          setActiveCritic(currentCritic);
          // Find the message for this critic
          const criticMessage = transcription.find(
            msg => msg.role === 'assistant' && msg.criticNumber === currentCritic + 1,
          );
          setActiveMessage(criticMessage || null);
          currentCritic++;
        } else {
          clearInterval(interval);
          setActiveCritic(null);
          setActiveMessage(null);
        }
      }, 2000);

      return () => {
        clearInterval(interval);
        setActiveCritic(null);
        setActiveMessage(null);
      };
    }
  }, [currentQuestion, critics.length, transcription]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />

      <Ground />

      {/* Critics - only render if we have both positions and critics */}
      {criticPositions.length > 0 &&
        critics.length > 0 &&
        criticPositions.map((position, index) => {
          // Safety check for critic at this index
          if (!critics[index]) return null;

          const isActive = activeCritic === index;

          return (
            <group key={`critic-${index}-${critics[index].name}`}>
              <CriticCharacter position={position} name={critics[index].name} isActive={isActive} />
              {/* Show response panel when critic is active */}
              {isActive && activeMessage && (
                <>
                  {/* Response panel */}
                  <ResponsePanel
                    text={activeMessage.content || ''}
                    position={new THREE.Vector3(position.x + 2, 1.5, position.z)}
                  />
                  {/* Reasoning panel */}
                  {activeMessage.reasoning && (
                    <ResponsePanel
                      text={`Reasoning: ${activeMessage.reasoning}`}
                      position={new THREE.Vector3(position.x + 2, 2.5, position.z)}
                    />
                  )}
                </>
              )}
            </group>
          );
        })}

      {/* Question display */}
      {currentQuestion && <QuestionBubble text={currentQuestion} position={new THREE.Vector3(0, 3, 0)} />}

      <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2 - 0.1} />
    </>
  );
}

export default function LandscapeView(props: LandscapeViewProps) {
  return (
    <div className="w-full h-full">
      <ErrorBoundary>
        <Suspense fallback={<div className="w-full h-full grid place-items-center">Loading 3D view...</div>}>
          <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 75 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            }}
          >
            <Scene {...props} />
          </Canvas>
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
