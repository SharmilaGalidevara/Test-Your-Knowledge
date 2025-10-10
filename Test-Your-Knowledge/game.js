// DOM Elements
const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');

// Game State
let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuestions = [];
let questions = [];
let playerInfo = null;

// Constants
const CORRECT_BONUS = 10;
let MAX_QUESTIONS = 0;

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get player info from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const playerParam = urlParams.get('player');
    
    if (playerParam) {
        try {
            const playerData = JSON.parse(decodeURIComponent(playerParam));
            playerInfo = {
                name: playerData.name || 'Guest',
                phone: playerData.phone || 'N/A'
            };
            // Save to localStorage for persistence
            localStorage.setItem('currentPlayer', JSON.stringify(playerInfo));
        } catch (e) {
            console.error('Error parsing player data:', e);
            playerInfo = { name: 'Guest', phone: 'N/A' };
        }
    } else {
        // Fallback to localStorage if no URL parameter
        try {
            const savedPlayer = localStorage.getItem('playerInfo');
            if (savedPlayer) {
                playerInfo = JSON.parse(savedPlayer);
            } else {
                playerInfo = { name: 'Guest', phone: 'N/A' };
            }
        } catch (e) {
            console.error('Error loading player info:', e);
            playerInfo = { name: 'Guest', phone: 'N/A' };
        }
    }
    
    // Remove any player name display from the game interface
    const playerNameElements = document.querySelectorAll('.player-name');
    playerNameElements.forEach(el => el.remove());
    
    loadQuestions();
});

// Questions data (included directly as fallback)
const defaultQuestions = [
    {
        "question": "Question 1: Who are You?",
        "choice1": "This body",
        "choice2": "Soul",
        "choice3": "Human Being",
        "choice4": "Just a person",
        "answer": 2
      },
      {
        "question": "Question 2: What is the nature of the soul?",
        "choice1": "It is temporary and fades away",
        "choice2": "It's just a part of the body",
        "choice3": "It is eternal and never dies",
        "choice4": "It doesn't really exist",
        "answer": 3
      },
      {
        "question": "Question 3: Why do we experience pain and suffering in life?",
        "choice1": "It's a part of life, just like happiness",
        "choice2": "It's due to our past actions (karma)",
        "choice3": "It's caused by other people's actions",
        "choice4": "It's simply random and unavoidable",
        "answer": 2
      },
      {
        "question": "Question 4: What is the essence of the Bhagavad Gita's teachings?",
        "choice1": "To renounce the world and live in isolation",
        "choice2": "To seek knowledge and wisdom for personal growth",
        "choice3": "To act without attachment to the results of our actions",
        "choice4": "To worship God through rituals and ceremonies",
        "answer": 3
      },
      {
        "question": "Question 5: What happens when we lose connection with our spiritual self?",
        "choice1": "We become more focused on material desires and temporary pleasures",
        "choice2": "We start to understand life's true purpose",
        "choice3": "We experience immediate peace and fulfillment",
        "choice4": "We gain clarity about the nature of the soul",
        "answer": 1
      },
      {
        "question": "Question 6: What is true happiness?",
        "choice1": "Experiencing pleasure and joy in the material world",
        "choice2": "Attaining wealth and status",
        "choice3": "The peace and bliss that comes from connecting with the Divine",
        "choice4": "Finding success in all areas of life",
        "answer": 3
      },
      {
        "question": "Question 7: What does Lord Krishna teach Arjuna about detachment in the Bhagavad Gita?",
        "choice1": "Detachment means to give up all material possessions",
        "choice2": "Detachment means to stop caring about anything in life",
        "choice3": "Detachment means performing one's duty without attachment to the results",
        "choice4": "Detachment means withdrawing from all action to focus solely on meditation",
        "answer": 3
      },
      {
        "question": "Question 8: What happens after we die?",
        "choice1": "Nothing, life ends",
        "choice2": "We meet our loved ones in another world",
        "choice3": "We become part of the universe",
        "choice4": "Our soul moves on to another body",
        "answer": 4
      },
      {
        "question": "Question 9: What is the nature of the material world?",
        "choice1": "It is temporary and ever-changing",
        "choice2": "It brings us towards spiritual growth",
        "choice3": "It is real and eternal, created by God",
        "choice4": "It is a place of suffering and should be avoided entirely",
        "answer": 1
      },
      {
        "question": "Question 10: What quality is most important on the spiritual path?",
        "choice1": "Popularity",
        "choice2": "Ambition",
        "choice3": "Patience",
        "choice4": "Physical strength",
        "answer": 3
      }
];

// Load questions
function loadQuestions() {
    // Use the default questions that are already defined
    questions = [...defaultQuestions];
    
    // Set MAX_QUESTIONS to the number of available questions, but no more than 10
    MAX_QUESTIONS = Math.min(questions.length, 10);
    
    // Start the game
    startGame();
}

function startGame() {
    if (!questions || questions.length === 0) {
        console.error('No questions available to start the game');
        return;
    }
    
    // Get player info from localStorage
    try {
        const playerData = localStorage.getItem('currentPlayer');
        if (playerData) {
            playerInfo = JSON.parse(playerData);
            console.log('Player info loaded:', playerInfo);
        } else {
            console.warn('No player info found in localStorage');
            playerInfo = { name: 'Guest', phone: 'N/A' };
        }
    } catch (e) {
        console.error('Error loading player info:', e);
        playerInfo = { name: 'Guest', phone: 'N/A' };
    }
    
    questionCounter = 0;
    score = 0;
    availableQuestions = [...questions];
    getNewQuestion();
    game.classList.remove('hidden');
    loader.classList.add('hidden');
};

getNewQuestion = () => {
    // Check if we've reached the maximum number of questions or no more questions available
    if (questionCounter >= MAX_QUESTIONS || availableQuestions.length === 0) {
        localStorage.setItem('mostRecentScore', score);
        // Save the score and go to the end page
        saveScore();
        return window.location.assign('end.html');
    }
    
    // Update question counter and display
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    //Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;

    // Fixed order: always take the first remaining question
    const questionIndex = 0;
    currentQuestion = availableQuestions[questionIndex];
    question.innerHTML = currentQuestion.question;

    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerHTML = currentQuestion['choice' + number];
    });

    availableQuestions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        if (!acceptingAnswers) return;

        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];

        const classToApply =
            selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }

        selectedChoice.parentElement.classList.add(classToApply);

        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
    });
});

// Save the current score to local storage
function saveScore() {
    // Just save the score, let end.js handle the rest
    localStorage.setItem('mostRecentScore', score);
    
    // Navigate to end screen with player info
    if (playerInfo) {
        const playerData = encodeURIComponent(JSON.stringify(playerInfo));
        window.location.href = `end.html?player=${playerData}`;
    } else {
        window.location.href = 'end.html';
    }
}

incrementScore = (num) => {
    score += num;
    scoreText.innerText = score;
};