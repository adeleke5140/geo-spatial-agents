import { AlertCircle, Brain } from 'lucide-react';
import { useState } from 'react';

// Define types for node positions
interface NodePosition {
  x: number;
  y: number;
  id: number;
}

// Define type for flow animation
interface FlowAnimation {
  from: number;
  to: number;
}

export const CriticFlowVisualization = () => {
  const [userInput, setUserInput] = useState('I want to build the next Apple');
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [completedNodes, setCompletedNodes] = useState<number[]>([]);
  const [thinking, setThinking] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [flowAnimation, setFlowAnimation] = useState<FlowAnimation | null>(null);
  const [isFlowing, setIsFlowing] = useState(false);

  // Mock reasoning data for each critic
  const criticReasonings = [
    "Analyzing 'building the next Apple'... This could mean creating a tech company with revolutionary products, strong design focus, and vertical integration. Need to consider: market saturation, high capital requirements, and Apple's established ecosystem. Key question: what specific innovation would differentiate this venture?",

    "Building on Critic 1's analysis... The idea needs specificity. 'Next Apple' is ambitious but vague. Could focus on: 1) A new product category Apple hasn't dominated 2) An alternative approach to tech design 3) Targeting markets Apple has underserved. Recommend defining a specific innovation vector.",

    'Examining market opportunity... Apple succeeded by simplifying complex technology and creating premium experiences. Potential areas: health tech integration, AR/VR solutions, sustainable tech manufacturing, or AI-native devices. Each requires different expertise and capital structures. What core competency would drive this venture?',

    "Considering business model implications... Apple's success relies on hardware+software+services ecosystem. A true 'next Apple' would need similar integration advantages. Question: is the founder planning to compete directly or create a new category? Direct competition with Apple is extremely capital-intensive and risky.",

    'Evaluating practical requirements... Building an Apple-like company requires: 1) Significant technical innovation 2) Design excellence 3) Manufacturing expertise 4) Strong brand development 5) Ecosystem planning. Founder should assess their unique advantages in these areas and start with focused innovation in one domain.',

    "Final synthesis... Building 'the next Apple' is ambitious but requires specificity. Recommendation: Instead of replicating Apple entirely, identify a specific emerging technology domain with high growth potential, develop a distinctive design language and user experience, and create a product with initial standalone value that could later expand into an ecosystem. Start focused, with a clear first product that solves a specific problem exceptionally well.",
  ];

  // Calculate positions for the critics in a circular arrangement
  const calculateNodePositions = () => {
    const positions: NodePosition[] = [];
    const centerX = 400;
    const centerY = 300;
    const radius = 220;

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 - Math.PI / 2; // Start from top
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        id: i,
      });
    }

    return positions;
  };

  const nodePositions = calculateNodePositions();

  // Function to start the flow visualization
  const startFlow = () => {
    // Reset any previous flow
    resetFlow();

    // Start with the first critic
    activateCritic(0);
  };

  // Reset the flow
  const resetFlow = () => {
    setActiveNode(null);
    setCompletedNodes([]);
    setThinking('');
    setIsThinking(false);
    setFlowAnimation(null);
    setIsFlowing(false);
  };

  // Activate a critic node
  const activateCritic = (index: number) => {
    if (index >= 6) return;

    setActiveNode(index);
    setIsThinking(true);

    // Show thinking process
    simulateThinking(criticReasonings[index], () => {
      // When thinking is complete, mark node as completed
      setCompletedNodes(prev => [...prev, index]);
      setIsThinking(false);

      // Move to the next critic after a delay
      if (index < 5) {
        setTimeout(() => {
          // Animate flow to next critic
          setFlowAnimation({ from: index, to: index + 1 });
          setIsFlowing(true);

          setTimeout(() => {
            setIsFlowing(false);
            setFlowAnimation(null);
            activateCritic(index + 1);
          }, 1000);
        }, 500);
      }
    });
  };

  // Simulate the thinking process with typing effect
  const simulateThinking = (fullText: string, onComplete: () => void) => {
    setThinking('');
    let index = 0;

    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        setThinking(prev => prev + fullText.charAt(index));
        index++;
      } else {
        clearInterval(typingInterval);
        if (onComplete) onComplete();
      }
    }, 20); // Adjust typing speed
  };

  // Function to render flow lines between nodes
  const renderFlowLines = () => {
    // Render permanent flow lines for completed transitions
    const permanentLines = [];

    for (let i = 0; i < completedNodes.length - 1; i++) {
      const from = nodePositions[completedNodes[i]];
      const to = nodePositions[completedNodes[i] + 1];

      permanentLines.push(
        <line
          key={`permanent-${from.id}-${to.id}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#22c55e"
          strokeWidth={3}
          strokeDasharray="none"
        />,
      );
    }

    // Render animated flow line if active
    let animatedLine = null;
    if (flowAnimation && isFlowing) {
      const from = nodePositions[flowAnimation.from];
      const to = nodePositions[flowAnimation.to];

      animatedLine = (
        <line
          key={`animated-${from.id}-${to.id}`}
          x1={from.x}
          y1={from.y}
          x2={to.x}
          y2={to.y}
          stroke="#22c55e"
          strokeWidth={3}
          strokeDasharray="5,5"
          className="animated-dash"
        />
      );
    }

    return [...permanentLines, animatedLine];
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="p-4 bg-white shadow-md">
        <h2 className="text-xl font-bold mb-2">Critic Reasoning Flow Visualization</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            className="flex-grow p-2 border rounded"
            placeholder="Enter your idea..."
          />
          <button onClick={startFlow} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Start Flow
          </button>
          <button onClick={resetFlow} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
            Reset
          </button>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <div className="flex items-center">
            <AlertCircle size={16} className="mr-1" />
            <span>Top-down view of 6 critics analyzing the input and passing ideas between them</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* SVG Visualization */}
        <div className="flex-1 bg-gray-200 p-4 relative overflow-hidden">
          <svg width="100%" height="100%" viewBox="0 0 800 600" className="bg-white rounded-lg shadow-inner">
            {/* Grid lines for better perspective */}
            {Array(20)
              .fill(0)
              .map((_, i) => (
                <line key={`grid-h-${i}`} x1={0} y1={i * 30} x2={800} y2={i * 30} stroke="#f0f0f0" strokeWidth={1} />
              ))}
            {Array(26)
              .fill(0)
              .map((_, i) => (
                <line key={`grid-v-${i}`} x1={i * 30} y1={0} x2={i * 30} y2={600} stroke="#f0f0f0" strokeWidth={1} />
              ))}

            {/* Central input node */}
            <g>
              <circle cx={400} cy={300} r={40} fill="#e5e7eb" stroke="#6b7280" strokeWidth={2} />
              <text
                x={400}
                y={300}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-sm font-bold"
                fill="#4b5563"
              >
                Input
              </text>
              <text x={400} y={320} textAnchor="middle" dominantBaseline="middle" className="text-xs" fill="#4b5563">
                Idea
              </text>
            </g>

            {/* Flow lines */}
            {renderFlowLines()}

            {/* Nodes for each critic */}
            {nodePositions.map((node, index) => {
              // Determine node state
              let bgColor = '#e5e7eb'; // Default gray
              let strokeColor = '#6b7280';
              let strokeWidth = 2;

              if (completedNodes.includes(index)) {
                bgColor = '#bbf7d0'; // Light green for completed
                strokeColor = '#16a34a';
                strokeWidth = 3;
              } else if (activeNode === index) {
                bgColor = '#fef08a'; // Yellow for active
                strokeColor = '#ca8a04';
                strokeWidth = 3;
              }

              return (
                <g key={`critic-${index}`}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={45}
                    fill={bgColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                  />
                  <text
                    x={node.x}
                    y={node.y - 10}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-sm font-bold"
                    fill="#4b5563"
                  >
                    Critic {index + 1}
                  </text>
                  <g transform={`translate(${node.x - 12}, ${node.y + 10})`}>
                    <Brain size={24} className="text-gray-700" />
                  </g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info Panel */}
        <div className="w-1/3 bg-white p-4 overflow-y-auto shadow-inner">
          <div className="mb-6">
            <h3 className="font-bold mb-2">
              {isThinking && activeNode !== null
                ? `Critic ${activeNode + 1} Thinking:`
                : activeNode !== null && !isThinking
                ? `Critic ${activeNode + 1} Conclusion:`
                : 'Reasoning Flow'}
            </h3>
            <div className="p-3 bg-gray-100 rounded min-h-[150px] max-h-[300px] overflow-y-auto">
              <p className="whitespace-pre-line">{thinking || 'Click "Start Flow" to begin the reasoning process.'}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-bold mb-2">Progress</h3>
            <div className="flex items-center space-x-2 mb-4">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={index}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      completedNodes.includes(index)
                        ? 'bg-green-500 text-white'
                        : activeNode === index
                        ? 'bg-yellow-400 text-gray-800'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                ))}
            </div>
            <div className="text-sm text-gray-600">
              <p>
                <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full mr-1"></span> Active
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full ml-3 mr-1"></span> Completed
              </p>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-bold mb-2">About This Visualization</h3>
            <p className="text-sm text-blue-700 mt-1">
              This visualization demonstrates a reasoning flow between 6 critic agents analyzing the input idea. Each
              critic processes the idea, builds on previous critics&apos; analyses, and passes their thoughts to the
              next critic in sequence.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              The simulation shows a top-down view of the system, similar to watching &quot;ants&quot; move about as
              each critic processes information and passes it along.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticFlowVisualization;
