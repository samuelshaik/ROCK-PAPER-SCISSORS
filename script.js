
'use strict'; // Enable strict mode for better error catching


// GAME CONFIGURATION AND CONSTANTS

const GAME_CONFIG = {
    moves: ['rock', 'paper', 'scissors'],
    emojis: {
        rock: '🪨',
        paper: '📄',
        scissors: '✂️'
    },
    autoPlaySpeed: 1500, 
    maxHistoryItems: 10,
    animations: {
        resultDelay: 200,
        buttonFeedback: 150
    }
};

// Game state object - centralizes all game data
const gameState = {
    score: {
        wins: 0,
        losses: 0,
        ties: 0
    },
    streak: {
        current: 0,
        type: '', // 'win' or 'lose'
    },
    history: [],
    autoPlay: {
        isActive: false,
        intervalId: null
    },
    ui: {
        showingHistory: false
    }
};


function playGame(playerMove) {
    try {
        // 1. Validate input
        if (!isValidMove(playerMove)) {
            throw new Error(`Invalid move: ${playerMove}`);
        }
        
        // 2. Generate computer move and determine winner
        const computerMove = generateComputerMove();
        const result = determineGameWinner(playerMove, computerMove);
        
        // 3. Update game state
        updateGameStatistics(result);
        addGameToHistory(playerMove, computerMove, result);
        
        // 4. Update user interface
        displayGameResult(playerMove, computerMove, result);
        
        // 5. Log for debugging (remove in production)
        logGameRound(playerMove, computerMove, result);
        
    } catch (error) {
        console.error('Error in playGame:', error);
        showErrorMessage('Something went wrong. Please try again!');
    }
}


function isValidMove(move) {
    return typeof move === 'string' && GAME_CONFIG.moves.includes(move.toLowerCase());
}


function generateComputerMove() {
    const randomIndex = Math.floor(Math.random() * GAME_CONFIG.moves.length);
    return GAME_CONFIG.moves[randomIndex];
}


function determineGameWinner(playerMove, computerMove) {
    // Check for tie first (most common case to handle early)
    if (playerMove === computerMove) {
        return 'tie';
    }
    
    // Define winning combinations using an object for clarity
    const winningCombinations = {
        rock: 'scissors',     // Rock crushes Scissors
        paper: 'rock',        // Paper covers Rock
        scissors: 'paper'     // Scissors cuts Paper
    };
    
    // Return win/lose based on the winning combinations
    return winningCombinations[playerMove] === computerMove ? 'win' : 'lose';
}


function updateGameStatistics(result) {
    // Update main score
    updateMainScore(result);
    
    // Update win/lose streaks
    updateStreakData(result);
}


function updateMainScore(result) {
    switch(result) {
        case 'win':
            gameState.score.wins++;
            break;
        case 'lose':
            gameState.score.losses++;
            break;
        case 'tie':
            gameState.score.ties++;
            break;
        default:
            console.warn('Unexpected result type:', result);
    }
}


function updateStreakData(result) {
    // Ties don't affect streaks
    if (result === 'tie') {
        return;
    }
    
    // If this result continues the current streak
    if (result === gameState.streak.type) {
        gameState.streak.current++;
    } else {
        // New streak begins
        gameState.streak.type = result;
        gameState.streak.current = 1;
    }
}


function addGameToHistory(playerMove, computerMove, result) {
    const gameRecord = {
        id: Date.now(), // Simple unique ID
        playerMove: playerMove,
        computerMove: computerMove,
        result: result,
        timestamp: new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    };
    
    // Add to beginning of array (most recent first)
    gameState.history.unshift(gameRecord);
    
    // Keep only the most recent games
    if (gameState.history.length > GAME_CONFIG.maxHistoryItems) {
        gameState.history = gameState.history.slice(0, GAME_CONFIG.maxHistoryItems);
    }
}


function displayGameResult(playerMove, computerMove, result) {
    updateMovesDisplay(playerMove, computerMove);
    updateResultDisplay(result);
    updateScoreDisplay();
    updateStreakDisplay();
}


function updateMovesDisplay(playerMove, computerMove) {
    const choicesElement = document.getElementById('choices');
    
    if (!choicesElement) {
        console.error('Choices element not found');
        return;
    }
    
    choicesElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 20px;">
            <span style="color: var(--accent-color); font-weight: 600;">
                You: ${GAME_CONFIG.emojis[playerMove]}
            </span>
            <span style="color: var(--text-secondary); font-size: 1.2rem;">VS</span>
            <span style="color: var(--accent-secondary); font-weight: 600;">
                Computer: ${GAME_CONFIG.emojis[computerMove]}
            </span>
        </div>
    `;
}

function updateResultDisplay(result) {
    const resultElement = document.getElementById('result');
    
    if (!resultElement) {
        console.error('Result element not found');
        return;
    }
    
    // Define result messages and styles
    const resultConfig = {
        win: {
            message: 'You Win! 🎉',
            color: 'var(--success-color)',
            animation: 'win-animation'
        },
        lose: {
            message: 'You Lose! 😔',
            color: 'var(--error-color)',
            animation: 'lose-animation'
        },
        tie: {
            message: 'It\'s a Tie! 🤝',
            color: 'var(--warning-color)',
            animation: 'tie-animation'
        }
    };
    
    const config = resultConfig[result];
    if (!config) {
        console.error('Invalid result for display:', result);
        return;
    }
    
    // Update content and styling
    resultElement.innerHTML = config.message;
    resultElement.style.color = config.color;
    
    // Add animation class with cleanup
    resultElement.className = `result ${config.animation}`;
    
    // Remove animation class after animation completes
    setTimeout(() => {
        resultElement.className = 'result';
    }, 600);
}


function updateScoreDisplay() {
    const scoreElement = document.getElementById('score');
    
    if (!scoreElement) {
        console.error('Score element not found');
        return;
    }
    
    const { wins, losses, ties } = gameState.score;
    const totalGames = wins + losses + ties;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;
    
    scoreElement.innerHTML = `
        Wins: ${wins} | Losses: ${losses} | Ties: ${ties}
        <br><small style="color: var(--text-secondary);">
            Win Rate: ${winRate}% (${totalGames} games)
        </small>
    `;
}

function updateStreakDisplay() {
    const streakElement = document.getElementById('winStreak');
    
    if (!streakElement) {
        console.error('Win streak element not found');
        return;
    }
    
    // Only show streaks of 2 or more
    if (gameState.streak.current >= 2) {
        const isWinStreak = gameState.streak.type === 'win';
        const streakText = isWinStreak ? 'Win Streak' : 'Losing Streak';
        const emoji = isWinStreak ? '🔥' : '💔';
        const cssClass = isWinStreak ? 'streak-positive' : 'streak-negative';
        
        streakElement.innerHTML = `${emoji} ${gameState.streak.current} ${streakText}!`;
        streakElement.className = `win-streak ${cssClass}`;
    } else {
        streakElement.innerHTML = '';
        streakElement.className = 'win-streak';
    }
}


function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (!historyList) {
        console.error('History list element not found');
        return;
    }
    
    if (gameState.history.length === 0) {
        historyList.innerHTML = '<div style="color: var(--text-secondary); font-style: italic;">No games played yet</div>';
        return;
    }
    
    const historyHTML = gameState.history.map(game => `
        <div class="history-item">
            <span class="history-moves">
                ${GAME_CONFIG.emojis[game.playerMove]} vs ${GAME_CONFIG.emojis[game.computerMove]}
            </span>
            <span class="history-result ${game.result}">
                ${game.result}
            </span>
        </div>
    `).join('');
    
    historyList.innerHTML = historyHTML;
}


function resetScore() {
    try {
        // Stop auto-play if active
        if (gameState.autoPlay.isActive) {
            toggleAutoPlay();
        }
        
        // Reset all game state
        gameState.score = { wins: 0, losses: 0, ties: 0 };
        gameState.streak = { current: 0, type: '' };
        gameState.history = [];
        
        // Reset UI displays
        resetUIDisplays();
        
        // Provide user feedback
        showTemporaryMessage('Game reset successfully! 🎮');
        
    } catch (error) {
        console.error('Error resetting game:', error);
        showErrorMessage('Failed to reset game. Please refresh the page.');
    }
}

/**
 * Resets all UI elements to their initial state
 */
function resetUIDisplays() {
    const elements = {
        choices: 'Ready to play? Choose your move!',
        result: 'May the best player win! 🎮',
        winStreak: ''
    };
    
    Object.entries(elements).forEach(([id, content]) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = content;
            if (id === 'result') {
                element.style.color = 'var(--text-primary)';
                element.className = 'result';
            }
        }
    });
    
    updateScoreDisplay();
    
    if (gameState.ui.showingHistory) {
        updateHistoryDisplay();
    }
}


function toggleAutoPlay() {
    try {
        const autoPlayBtn = document.getElementById('autoPlayBtn');
        
        if (!autoPlayBtn) {
            throw new Error('Auto-play button not found');
        }
        
        if (gameState.autoPlay.isActive) {
            stopAutoPlay(autoPlayBtn);
        } else {
            startAutoPlay(autoPlayBtn);
        }
        
    } catch (error) {
        console.error('Error toggling auto-play:', error);
        showErrorMessage('Auto-play feature unavailable.');
    }
}

function startAutoPlay(button) {
    gameState.autoPlay.intervalId = setInterval(() => {
        const randomMove = GAME_CONFIG.moves[Math.floor(Math.random() * GAME_CONFIG.moves.length)];
        playGame(randomMove);
    }, GAME_CONFIG.autoPlaySpeed);
    
    gameState.autoPlay.isActive = true;
    button.innerHTML = '<span class="button-icon">⏸️</span>Stop Auto Play';
    button.classList.add('auto-play-active');
    
    // Disable manual move buttons during auto-play
    toggleMoveButtons(false);
}


function stopAutoPlay(button) {
    clearInterval(gameState.autoPlay.intervalId);
    gameState.autoPlay.isActive = false;
    gameState.autoPlay.intervalId = null;
    
    button.innerHTML = '<span class="button-icon">🤖</span>Auto Play';
    button.classList.remove('auto-play-active');
    
    // Re-enable manual move buttons
    toggleMoveButtons(true);
}

function toggleMoveButtons(enabled) {
    const moveButtons = document.querySelectorAll('.move-button');
    moveButtons.forEach(button => {
        button.disabled = !enabled;
        button.style.opacity = enabled ? '1' : '0.6';
        button.style.pointerEvents = enabled ? 'auto' : 'none';
    });
}

/**
 * Toggles the game history display on and off
 */
function toggleHistory() {
    try {
        const historyElement = document.getElementById('gameHistory');
        const historyBtn = document.getElementById('historyBtn');
        
        if (!historyElement || !historyBtn) {
            throw new Error('History elements not found');
        }
        
        gameState.ui.showingHistory = !gameState.ui.showingHistory;
        
        if (gameState.ui.showingHistory) {
            historyElement.style.display = 'block';
            historyBtn.innerHTML = '<span class="button-icon">📊</span>Hide History';
            updateHistoryDisplay();
        } else {
            historyElement.style.display = 'none';
            historyBtn.innerHTML = '<span class="button-icon">📊</span>Show History';
        }
        
    } catch (error) {
        console.error('Error toggling history:', error);
        showErrorMessage('History feature unavailable.');
    }
}


// KEYBOARD CONTROL SYSTEM



function handleKeyboardInput(event) {
    // Don't interfere with auto-play
    if (gameState.autoPlay.isActive) {
        // Allow ESC to stop auto-play
        if (event.key === 'Escape') {
            toggleAutoPlay();
        }
        return;
    }
    
    const key = event.key.toLowerCase();
    
    switch(key) {
        case 'r':
            event.preventDefault();
            playGame('rock');
            provideFeedback('rock');
            break;
            
        case 'p':
            event.preventDefault();
            playGame('paper');
            provideFeedback('paper');
            break;
            
        case 's':
            event.preventDefault();
            playGame('scissors');
            provideFeedback('scissors');
            break;
            
        case ' ': // Spacebar for random move
            event.preventDefault();
            const randomMove = GAME_CONFIG.moves[Math.floor(Math.random() * GAME_CONFIG.moves.length)];
            playGame(randomMove);
            provideFeedback(randomMove, true);
            break;
            
        case 'h':
            event.preventDefault();
            toggleHistory();
            break;
            
        case 'escape':
            if (gameState.autoPlay.isActive) {
                toggleAutoPlay();
            }
            break;
    }
}


function provideFeedback(move, isRandom = false) {
    const button = document.querySelector(`[data-move="${move}"]`);
    if (button) {
        button.classList.add('loading');
        setTimeout(() => {
            button.classList.remove('loading');
        }, GAME_CONFIG.animations.buttonFeedback);
    }
    
    if (isRandom) {
        showTemporaryMessage(`Random choice: ${move.toUpperCase()}! 🎲`);
    }
}

// USER FEEDBACK AND ERROR HANDLING
function showTemporaryMessage(message, duration = 2000) {
    const resultElement = document.getElementById('result');
    if (!resultElement) return;
    
    const originalContent = resultElement.innerHTML;
    const originalColor = resultElement.style.color;
    
    resultElement.innerHTML = message;
    resultElement.style.color = 'var(--accent-color)';
    
    setTimeout(() => {
        resultElement.innerHTML = originalContent;
        resultElement.style.color = originalColor;
    }, duration);
}


function showErrorMessage(message) {
    const resultElement = document.getElementById('result');
    if (!resultElement) {
        alert(message); // Fallback to alert
        return;
    }
    
    resultElement.innerHTML = `❌ ${message}`;
    resultElement.style.color = 'var(--error-color)';
    
    setTimeout(() => {
        resultElement.innerHTML = 'Choose your move to continue';
        resultElement.style.color = 'var(--text-primary)';
    }, 3000);
}

function logGameRound(playerMove, computerMove, result) {
    if (typeof console !== 'undefined' && console.log) {
        console.log(`🎮 Round: ${playerMove} vs ${computerMove} = ${result}`);
        console.log(`📊 Score: W:${gameState.score.wins} L:${gameState.score.losses} T:${gameState.score.ties}`);
    }
}


// EVENT LISTENERS AND INITIALIZATION

function initializeGame() {
    console.log('🎮 Rock Paper Scissors Game - Professional Version');
    console.log('💡 Controls: R(Rock), P(Paper), S(Scissors), Space(Random), H(History)');
    
    try {
        // Set up move button event listeners
        setupMoveButtonListeners();
        
        // Set up action button event listeners
        setupActionButtonListeners();
        
        // Set up keyboard controls
        document.addEventListener('keydown', handleKeyboardInput);
        
        // Initialize UI displays
        updateScoreDisplay();
        
        console.log('✅ Game initialized successfully!');
        
    } catch (error) {
        console.error('❌ Failed to initialize game:', error);
        showErrorMessage('Game failed to load. Please refresh the page.');
    }
}


function setupMoveButtonListeners() {
    const moveButtons = document.querySelectorAll('.move-button');
    
    moveButtons.forEach(button => {
        const move = button.getAttribute('data-move');
        if (move) {
            button.addEventListener('click', () => playGame(move));
        }
    });
}


function setupActionButtonListeners() {
    const buttonMappings = {
        'resetBtn': resetScore,
        'autoPlayBtn': toggleAutoPlay,
        'historyBtn': toggleHistory
    };
    
    Object.entries(buttonMappings).forEach(([id, handler]) => {
        const button = document.getElementById(id);
        if (button) {
            button.addEventListener('click', handler);
        } else {
            console.warn(`Button with id '${id}' not found`);
        }
    });
}

/**
 * Handles page cleanup when user leaves
 */
function cleanupGame() {
    if (gameState.autoPlay.isActive) {
        clearInterval(gameState.autoPlay.intervalId);
    }
}


// INITIALIZATION AND CLEANUP


// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', initializeGame);

// Cleanup when page unloads
window.addEventListener('beforeunload', cleanupGame);
