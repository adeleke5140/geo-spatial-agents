# Three.js Dependencies for Critic Ant Visualization

To run the 3D visualization, you'll need to install the following packages:

```bash
npm install three @react-three/fiber @react-three/drei
# or
yarn add three @react-three/fiber @react-three/drei
# or
pnpm add three @react-three/fiber @react-three/drei
```

## What each package provides:

- **three**: The core Three.js library that provides all the 3D functionality
- **@react-three/fiber**: React renderer for Three.js, allowing us to use Three.js with React components
- **@react-three/drei**: Useful helper components for react-three-fiber

## Navigation:

After installing the dependencies, you can access the 3D visualization at:

```
/3d-critic-flow
```

## Controls:

- **Rotate**: Click and drag with the left mouse button
- **Zoom**: Use the scroll wheel
- **Pan**: Click and drag with the right mouse button

## Features:

- Ant characters representing each critic agent
- Thought bubbles appear when an ant is thinking
- Path animations show information flowing between ants
- Interactive 3D camera controls
- Same functionality as the 2D visualization but in an immersive 3D environment
