import { useEffect, useState, useCallback } from "react";

// Remove static dimensions and calculate based on screen size
const GAME_RATIO = 1.75; // Height:Width ratio (600:400 = 1.5)
const BIRD_HEIGHT = 55;  // Fixed height
const BIRD_WIDTH = 70;   // Width for the flying bird container
const GRAVITY = 0.5;  // Adjusted for more realistic gravity
const JUMP_FORCE = -8;  // Smaller jump for better control
const TERMINAL_VELOCITY = 12;  // Increased max fall speed
const OBJ_WIDTH = 52;
const OBJ_SPEED = 4;  // Slightly slower pipes for better gameplay
const OBJ_GAP = 200;

// Add new constant for rotation
const MAX_ROTATION = 45;  // Reduced max rotation for more natural look
const ROTATION_SPEED = 0.2;  // Faster rotation response

// Updated bird characters with unlock thresholds
const BIRD_CHARACTERS = [
  {
    id: 'tarushi1',
    name: 'Pookie',
    image: './images/Pookie.webp',
    unlockScore: 0,
    description: 'Your starter Tarushi! Help her fly higher!'
  },
  {
    id: 'tarushi2',
    name: 'Autistic Bachcha',
    image: './images/Autistic.webp',
    unlockScore: 1,
    description: 'Score 1 to unlock this adorable version!'
  },
  {
    id: 'tarushi3',
    name: 'Chhotu Babi',
    image: './images/Baby.webp',
    unlockScore: 2,
    description: 'Score 2 to unlock this adorable version!'
  },
  {
    id: 'tarushi4',
    name: 'Bakchod Billa',
    image: './images/Bakchod.webp',
    unlockScore: 3,
    description: 'Score 3 to unlock this adorable version!'
  },
  {
    id: 'tarushi5',
    name: 'Balle Balle Shawa Shawa',
    image: './images/Balle.webp',
    unlockScore: 4,
    description: 'Score 4 to unlock this adorable version!'
  },
  {
    id: 'tarushi6',
    name: 'Clingy Bear',
    image: './images/Clingy.webp',
    unlockScore: 5,
    description: 'Score 5 to unlock this adorable version!'
  },
  {
    id: 'tarushi7',
    name: 'YIPEEEEEEE',
    image: './images/Excited.webp',
    unlockScore: 6,
    description: 'Score 6 to unlock this adorable version!'
  },
  {
    id: 'tarushi8',
    name: 'Hehehehehe',
    image: './images/Giggle.webp',
    unlockScore: 7,
    description: 'Score 7 to unlock this adorable version!'
  },
  {
    id: 'tarushi9',
    name: 'Goofy Bachcha',
    image: './images/Goofy.webp',
    unlockScore: 8,
    description: 'Score 8 to unlock this adorable version!'
  },
  {
    id: 'tarushi10',
    name: 'Resting bitch ass face',
    image: './images/Gusha.webp',
    unlockScore: 9,
    description: 'Score 9 to unlock this adorable version!'
  },
  {
    id: 'tarushi11',
    name: 'Gusshaaaa',
    image: './images/Hangry.webp',
    unlockScore: 10,
    description: 'Score 10 to unlock this adorable version!'
  },
  {
    id: 'tarushi12',
    name: 'Shawtyyyy',
    image: './images/Hawty.webp',
    unlockScore: 11,
    description: 'Score 11 to unlock this adorable version!'
  },
  {
    id: 'tarushi13',
    name: 'I signed up for thiss craz girl',
    image: './images/LostKid.webp',
    unlockScore: 12,
    description: 'Score 12 to unlock this adorable version!'
  },
  {
    id: 'tarushi14',
    name: 'Sad Bachcha',
    image: './images/Missie.webp',
    unlockScore: 13,
    description: 'Score 13 to unlock this adorable version!'
  },
  {
    id: 'tarushi15',
    name: 'Allah Hu Akbar',
    image: './images/Namaz.webp',
    unlockScore: 14,
    description: 'Score 14 to unlock this adorable version!'
  },
  {
    id: 'tarushi16',
    name: 'My girllllll',
    image: './images/PrettayWoman.webp',
    unlockScore: 15,
    description: 'Score 15 to unlock this adorable version!'
  },
  {
    id: 'tarushi17',
    name: 'Hawtieeee',
    image: './images/Semxy.webp',
    unlockScore: 16,
    description: 'Score 16 to unlock this adorable version!'
  },
  {
    id: 'tarushi18',
    name: 'Konichiwaaa (Anime girliee)',
    image: './images/SemxyAnimeGirl.webp',
    unlockScore: 17,
    description: 'Score 17 to unlock this adorable version!'
  },
  {
    id: 'tarushi19',
    name: 'Strawberry Lassi',
    image: './images/Strawberry Lassi.webp',
    unlockScore: 18,
    description: 'Score 18 to unlock this adorable version!'
  },
  {
    id: 'tarushi20',
    name: 'My Sunflowerrrrr',
    image: './images/Sunflower.webp',
    unlockScore: 19,
    description: 'Score 19 to unlock this adorable version!'
  },
  {
    id: 'tarushi21',
    name: 'Naa MAANEEEEE??',
    image: './images/Superman.webp',
    unlockScore: 20,
    description: 'Score 20 to unlock this adorable version!'
  },
  {
    id: 'tarushi22',
    name: 'Traditional Girliee',
    image: './images/Traditional.webp',
    unlockScore: 21,
    description: 'Score 21 to unlock this adorable version!'
  },
  // Add more characters here with increasing unlockScore values
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
  const [highScore, setHighScore] = useState(0);
  const [showAllCharacters, setShowAllCharacters] = useState(true);  // New state for toggle

  // Load high score from session storage on mount
  useEffect(() => {
    const savedHighScore = sessionStorage.getItem('flappyTarushiHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);

  // Update high score when current score exceeds it
  useEffect(() => {
    if (gameState.score > highScore) {
      setHighScore(gameState.score);
      sessionStorage.setItem('flappyTarushiHighScore', gameState.score.toString());
    }
  }, [gameState.score, highScore]);

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

  // Get unlocked characters based on high score or show all if toggle is on
  const unlockedCharacters = showAllCharacters 
    ? BIRD_CHARACTERS 
    : BIRD_CHARACTERS.filter(bird => bird.unlockScore <= highScore);

  // Get next unlock info only if not showing all characters
  const getNextUnlockInfo = () => {
    const nextCharacter = BIRD_CHARACTERS.find(bird => bird.unlockScore > highScore);
    if (nextCharacter) {
      const pointsNeeded = nextCharacter.unlockScore - highScore;
      return `Score +${pointsNeeded} to unlock next Tarushi! or \n Get her to kiss the game developer (+${pointsNeeded} points)😘`;
    }
    return "You've unlocked all Tarushis! Time to kiss the developer 😘";
  };

  // Only render game when dimensions are calculated
  if (dimensions.width === 0) return null;

  return (
    <div className="h-screen flex justify-center items-center font-[Press_Start_2P] bg-[#2c3e50]">
      <div 
        className="relative overflow-hidden border-2 border-black cursor-pointer"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          backgroundImage: 'url("./images/background-day.webp")',
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${dimensions.width}px ${dimensions.height}px`
        }}
        onClick={handler}
      >
        <div className="absolute z-10 top-[50px] left-0 right-0 text-center text-4xl text-white text-shadow">
          {gameState.score}
        </div>

        {!selectedBird && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 p-5 rounded-2xl text-center z-20 min-w-[80%] max-h-[80vh]">
            <h2 className="text-white text-xl mb-3 leading-relaxed">
              {gameState.score > 0 ? `Game Over! Score: ${gameState.score}` : 'Flappy Tarushi'}
            </h2>
            <p className="text-yellow-300 text-xs mb-4">
              {getNextUnlockInfo()}
            </p>
            <p className="text-white text-xs mb-4">
              High Score: {highScore}
            </p>
            <div className="overflow-y-auto max-h-[50vh] pr-2 custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 justify-items-center pb-4">
                {unlockedCharacters.map((bird) => (
                  <div
                    key={bird.id}
                    className="cursor-pointer p-4 rounded-xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:from-white/20 hover:to-white/10 border border-white/10 w-full"
                    onClick={() => handleCharacterSelect(bird)}
                  >
                    <div className="bg-gradient-to-b from-purple-500/20 to-pink-500/20 rounded-lg p-2 mb-2">
                      <img
                        src={bird.image}
                        alt={bird.name}
                        className="object-contain mx-auto hover:rotate-12 transition-transform duration-300"
                        style={{
                          width: 'auto',
                          height: `${BIRD_HEIGHT}px`
                        }}
                      />
                    </div>
                    <div className="text-white text-xs mt-2 font-semibold">
                      {bird.name}
                    </div>
                    <div className="text-yellow-300 text-[8px] mt-1 opacity-80">
                      {bird.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedBird && !gameState.isStart && (
          <div className="absolute top-[49%] left-1/2 -ml-[100px] bg-black p-2.5 w-[200px] text-center text-sm rounded-lg text-white font-semibold">
            {Math.random() < 0.5 
              ? "Score +1 to unlock next Tarushi!"
              : "Get Tarushi to kiss the game developer!"}
          </div>
        )}

        {selectedBird && (
          <>
            <div
              className="relative"
              style={{
                width: `${OBJ_WIDTH}px`,
                height: `${gameState.objHeight}px`,
                left: `${gameState.objPos}px`,
                top: '0px',
                transform: `rotate(180deg)`,
                backgroundImage: 'url("./images/pipe-green.webp")'
              }}
            />
            <div
              className="absolute cursor-pointer transition-transform duration-100 ease-out"
              style={{
                width: `${BIRD_WIDTH}px`,
                height: `${BIRD_HEIGHT}px`,
                top: `${gameState.birdPos}px`,
                left: '100px',
                transform: `rotate(${gameState.rotation}deg)`,
                backgroundImage: `url(${selectedBird.image})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                transformOrigin: 'center center'
              }}
              onClick={handler}
            />
            <div
              className="relative"
              style={{
                width: `${OBJ_WIDTH}px`,
                height: `${dimensions.height - OBJ_GAP - gameState.objHeight}px`,
                left: `${gameState.objPos}px`,
                top: `${dimensions.height - (gameState.objHeight + (dimensions.height - OBJ_GAP - gameState.objHeight))}px`,
                backgroundImage: 'url("./images/pipe-green.webp")'
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
