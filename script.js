let score = {
    wins: 0,
    losses: 0,
    ties: 0
};

let autoPlayInterval = null;
let isAutoPlaying = false;

const moves = ['rock', 'paper', 'scissors'];
const moveEmojis = {
    rock: '🪨',
    paper: '📄',
    scissors: '✂️'
};

function playGame(playerMove) {
    const computerMove = pickComputerMove();
    const result = determineWinner(playerMove, computerMove);
    
    updateScore(result);
    displayResult(playerMove, computerMove, result);
}

function pickComputerMove() {
    const randomNumber = Math.random();
    if (randomNumber < 1/3) {
        return 'rock';
    } else if (randomNumber < 2/3) {
        return 'paper';
    } else {
        return 'scissors';
    }
}

function determineWinner(playerMove, computerMove) {
    if (playerMove === computerMove) {
        return 'tie';
    } else if (
        (playerMove === 'rock' && computerMove === 'scissors') ||
        (playerMove === 'paper' && computerMove === 'rock') ||
        (playerMove === 'scissors' && computerMove === 'paper')
    ) {
        return 'win';
    } else {
        return 'lose';
    }
}

function updateScore(result) {
    if (result === 'win') {
        score.wins++;
    } else if (result === 'lose') {
        score.losses++;
    } else {
        score.ties++;
    }
}

function displayResult(playerMove, computerMove, result) {
    const choicesElement = document.getElementById('choices');
    const resultElement = document.getElementById('result');
    const scoreElement = document.getElementById('score');
    
    choicesElement.innerHTML = `You ${moveEmojis[playerMove]} - ${moveEmojis[computerMove]} Computer`;
    
    if (result === 'win') {
        resultElement.innerHTML = 'You win!🎉';
        resultElement.style.color = '#4caf50';
    } else if (result === 'lose') {
        resultElement.innerHTML = 'You lose!😞';
        resultElement.style.color = '#f44336';
    } else {
        resultElement.innerHTML = 'Tie game!🤝';
        resultElement.style.color = '#ff9800';
    }
    
    scoreElement.innerHTML = `Wins: ${score.wins}, Losses: ${score.losses}, Ties: ${score.ties}`;
}

function resetScore() {
    score.wins = 0;
    score.losses = 0;
    score.ties = 0;
    
    document.getElementById('choices').innerHTML = '';
    document.getElementById('result').innerHTML = 'Pick your move!';
    document.getElementById('result').style.color = 'white';
    document.getElementById('score').innerHTML = 'Wins: 0, Losses: 0, Ties: 0';
}

function toggleAutoPlay() {
    const autoPlayBtn = document.getElementById('autoPlayBtn');
    
    if (isAutoPlaying) {
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
        autoPlayBtn.innerHTML = 'Auto Play';
        autoPlayBtn.classList.remove('auto-play-active');
    } else {
        autoPlayInterval = setInterval(() => {
            const randomMove = moves[Math.floor(Math.random() * 3)];
            playGame(randomMove);
        }, 1000);
        isAutoPlaying = true;
        autoPlayBtn.innerHTML = 'Stop Auto Play';
        autoPlayBtn.classList.add('auto-play-active');
    }
}
