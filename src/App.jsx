import styled from "styled-components";
import { useEffect, useState, useCallback, useMemo } from "react";

// Remove static dimensions and calculate based on screen size
const GAME_RATIO = 1.75; // Height:Width ratio (600:400 = 1.5)
const BIRD_HEIGHT = 52;
const BIRD_WIDTH = 50;
const GRAVITY = 0.5;  // Adjusted for more realistic gravity
const JUMP_FORCE = -8;  // Smaller jump for better control
const TERMINAL_VELOCITY = 12;  // Increased max fall speed
const OBJ_WIDTH = 52;
const OBJ_SPEED = 4;  // Slightly slower pipes for better gameplay
const OBJ_GAP = 200;

// Add new constant for rotation
const MAX_ROTATION = 45;  // Reduced max rotation for more natural look
const ROTATION_SPEED = 0.2;  // Faster rotation response

// Add bird character constants
const BIRD_CHARACTERS = [
  {
    id: 'yellow',
    name: 'Yellow Bird',
    image: '../public/images/yellowbird-upflap.png'
  },
  {
    id: 'red',
    name: 'Red Bird',
    image: '../public/images/yellowbird-upflap2.png'
  },
  // {
  //   id: 'blue',
  //   name: 'Blue Bird',
  //   image: './images/bluebird-upflap.png'
  // }
];

function App() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [gameState, setGameState] = useState({
    isStart: false,
    birdPos: 300,
    objHeight: 0,
    objPos: 0,
    score: 0,
    velocity: 0,
    rotation: 0
  });
  const [selectedBird, setSelectedBird] = useState(null);

  // Memoized dimension update function
  const updateDimensions = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    let gameWidth, gameHeight;
    
    if (screenHeight / screenWidth > GAME_RATIO) {
      gameWidth = Math.min(screenWidth * 0.95, 400);
      gameHeight = gameWidth * GAME_RATIO;
    } else {
      gameHeight = Math.min(screenHeight * 0.8, 600);
      gameWidth = gameHeight / GAME_RATIO;
    }
    
    setDimensions({
      width: Math.floor(gameWidth),
      height: Math.floor(gameHeight)
    });
  }, []);

  // Initialize dimensions
  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Reset game state
  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      isStart: false,
      birdPos: dimensions.height / 2,
      score: 0,
      velocity: 0,
      rotation: 0,
      objPos: dimensions.width
    }));
    setSelectedBird(null);
  }, [dimensions.height, dimensions.width]);

  // Physics and collision detection
  useEffect(() => {
    if (!gameState.isStart) return;

    let frameId;
    let lastTime = performance.now();
    const targetFPS = 60;  // Increased to 60 FPS for smoother physics

    const updatePhysics = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / (1000 / targetFPS);
      lastTime = currentTime;

      setGameState(prev => {
        // Collision detection
        const topObj = prev.birdPos >= 0 && prev.birdPos < prev.objHeight;
        const bottomObj = prev.birdPos <= dimensions.height &&
          prev.birdPos >= dimensions.height - (dimensions.height - OBJ_GAP - prev.objHeight) - BIRD_HEIGHT;

        if (
          prev.objPos >= OBJ_WIDTH &&
          prev.objPos <= OBJ_WIDTH + 80 &&
          (topObj || bottomObj)
        ) {
          resetGame();
          return prev;
        }

        // Physics update with improved gravity feel
        const gravityEffect = GRAVITY * deltaTime;
        const newVelocity = Math.min(prev.velocity + gravityEffect, TERMINAL_VELOCITY);
        
        // Improved rotation calculation
        const targetRotation = newVelocity > 0
          ? Math.min(newVelocity * 6, MAX_ROTATION)  // Faster rotation when falling
          : Math.max(newVelocity * 4, -MAX_ROTATION);  // Slower rotation when jumping
        
        const newRotation = prev.rotation + (targetRotation - prev.rotation) * ROTATION_SPEED;
        const newBirdPos = prev.birdPos + (newVelocity * deltaTime);

        if (newBirdPos > dimensions.height - BIRD_HEIGHT) {
          resetGame();
          return prev;
        }

        return {
          ...prev,
          velocity: newVelocity,
          rotation: newRotation,
          birdPos: Math.max(0, newBirdPos)  // Prevent bird from going above screen
        };
      });

      frameId = requestAnimationFrame(updatePhysics);
    };

    frameId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(frameId);
  }, [gameState.isStart, dimensions.height, resetGame]);

  // Update pipe movement to match new physics timing
  useEffect(() => {
    if (!gameState.isStart) return;

    let frameId;
    let lastTime = performance.now();
    const targetFPS = 60;

    const updatePipe = (currentTime) => {
      const deltaTime = (currentTime - lastTime) / (1000 / targetFPS);
      lastTime = currentTime;

      setGameState(prev => {
        if (prev.objPos >= -OBJ_WIDTH) {
          return { ...prev, objPos: prev.objPos - (OBJ_SPEED * deltaTime) };
        } else {
          const newObjHeight = Math.floor(Math.random() * (dimensions.height - OBJ_GAP));
          return {
            ...prev,
            objPos: dimensions.width,
            objHeight: newObjHeight,
            score: prev.score + 1
          };
        }
      });

      frameId = requestAnimationFrame(updatePipe);
    };

    frameId = requestAnimationFrame(updatePipe);
    return () => cancelAnimationFrame(frameId);
  }, [gameState.isStart, dimensions.width, dimensions.height]);

  // Memoized event handlers
  const handler = useCallback((e) => {
    e.stopPropagation();
    if (selectedBird && !gameState.isStart) {
      setGameState(prev => ({
        ...prev,
        isStart: true,
        birdPos: dimensions.height / 2,
        velocity: 0,
        rotation: 0
      }));
    } else if (selectedBird) {
      setGameState(prev => ({
        ...prev,
        velocity: JUMP_FORCE,
        rotation: -MAX_ROTATION
      }));
    }
  }, [selectedBird, gameState.isStart, dimensions.height]);

  const handleCharacterSelect = useCallback((bird) => {
    if (!gameState.isStart) {
      setSelectedBird(bird);
    }
  }, [gameState.isStart]);

  // Only render game when dimensions are calculated
  if (dimensions.width === 0) return null;

  return (
    <Home>
      <Background height={dimensions.height} width={dimensions.width} onClick={handler}>
        <Score>{gameState.score}</Score>
        {!selectedBird && (
          <CharacterSelection>
            <SelectionTitle>
              {gameState.score > 0 ? `Game Over! Score: ${gameState.score}` : 'Select Your Bird'}
            </SelectionTitle>
            <CharacterGrid>
              {BIRD_CHARACTERS.map((bird) => (
                <CharacterOption
                  key={bird.id}
                  onClick={() => handleCharacterSelect(bird)}
                >
                  <BirdPreview
                    src={bird.image}
                    alt={bird.name}
                    width={BIRD_WIDTH}
                    height={BIRD_HEIGHT}
                  />
                  <CharacterName>{bird.name}</CharacterName>
                </CharacterOption>
              ))}
            </CharacterGrid>
          </CharacterSelection>
        )}
        {selectedBird && !gameState.isStart && (
          <Startboard>Tap Bird To Start</Startboard>
        )}
        {selectedBird && (
          <>
            <Obj
              height={gameState.objHeight}
              width={OBJ_WIDTH}
              left={gameState.objPos}
              top={0}
              deg={180}
            />
            <Bird
              height={BIRD_HEIGHT}
              width={BIRD_WIDTH}
              top={gameState.birdPos}
              left={100}
              rotation={gameState.rotation}
              image={selectedBird.image}
              onClick={handler}
            />
            <Obj
              height={dimensions.height - OBJ_GAP - gameState.objHeight}
              width={OBJ_WIDTH}
              left={gameState.objPos}
              top={dimensions.height - (gameState.objHeight + (dimensions.height - OBJ_GAP - gameState.objHeight))}
              deg={0}
            />
          </>
        )}
      </Background>
    </Home>
  );
}

export default App;

const Home = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: 'Press Start 2P', cursive;
  background-color: #2c3e50;
`;
const Background = styled.div.attrs(props => ({
  style: {
    width: `${props.width}px`,
    height: `${props.height}px`,
    backgroundSize: `${props.width}px ${props.height}px`,
  },
}))`
  background-image: url("./images/background-day.png");
  background-repeat: no-repeat;
  position: relative;
  overflow: hidden;
  border: 2px solid black;
`;

const Bird = styled.div.attrs(props => ({
  style: {
    width: `${props.width}px`,
    height: `${props.height}px`,
    top: `${props.top}px`,
    left: `${props.left}px`,
    transform: `rotate(${props.rotation}deg)`,
    backgroundImage: `url(${props.image})`,
    backgroundSize: `${props.width}px ${props.height}px`,
  },
}))`
  position: absolute;
  background-repeat: no-repeat;
  transition: transform 0.1s ease-out;
  transform-origin: center center;
  cursor: pointer;
`;

const Obj = styled.div.attrs(props => ({
  style: {
    width: `${props.width}px`,
    height: `${props.height}px`,
    left: `${props.left}px`,
    top: `${props.top}px`,
    transform: `rotate(${props.deg}deg)`,
  },
}))`
  position: relative;
  background-image: url("./images/pipe-green.png");
`;

const Startboard = styled.div`
  position: relative;
  top: 49%;
  background-color: black;
  padding: 10px;
  width: 100px;
  left: 50%;
  margin-left: -50px;
  text-align: center;
  font-size: 20px;
  border-radius: 10px;
  color: #fff;
  font-weight: 600;
`;

const Score = styled.div`
  position: absolute;
  z-index: 1;
  top: 50px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 40px;
  color: white;
  text-shadow: 2px 2px 0px #000;
`;

// Add new styled components for character selection
const CharacterSelection = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 15px;
  text-align: center;
  z-index: 2;
  min-width: 80%;
`;

const SelectionTitle = styled.h2`
  color: white;
  font-family: 'Press Start 2P', cursive;
  font-size: 20px;
  margin-bottom: 20px;
  line-height: 1.4;
`;

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  justify-items: center;
`;

const CharacterOption = styled.div`
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.1);
  transition: transform 0.2s, background-color 0.2s;

  &:hover {
    transform: scale(1.1);
    background-color: rgba(255, 255, 255, 0.2);
  }
`;

const BirdPreview = styled.img.attrs(props => ({
  style: {
    width: `${props.width}px`,
    height: `${props.height}px`,
  },
}))`
  object-fit: contain;
`;

const CharacterName = styled.div`
  color: white;
  font-family: 'Press Start 2P', cursive;
  font-size: 12px;
  margin-top: 10px;
`;
