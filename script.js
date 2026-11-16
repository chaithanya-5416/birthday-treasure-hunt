
// ======================================
// BIRTHDAY TREASURE HUNT
// PART 1: GAME SETUP
// ======================================

const SISTER_NAME = "Aaradhya";
const YOUR_NAME = "Chaithanya Akki";
const VIDEO_URL = "assets/video/birthday.mp4";

const BIRTHDAY_MESSAGE = `
Happy 10th Birthday! ❤️

I wish I could be there with you today.

Even though we are far away, you are always
close to my heart.

Keep smiling, keep playing, keep learning
and keep being your wonderful self!

I hope this little adventure made you happy.

You are my little star, today and always!

Lots and lots of love,
Your Chaithanya Akki ❤️
`;

// ======================================
// LEVEL DETAILS
// ======================================

const levels = [
  {
    name: "The Enchanted Forest",
    emoji: "🌳",
    type: "question",
    title: "A Little Riddle!",
    question: "What has hands but cannot clap?",
    answers: ["A clock", "A monkey", "A doll"],
    correct: 0,
    hint: "You can see it on a wall. It tells the time!",
    success: "Amazing! You solved the first riddle!"
  },
  {
    name: "The Crystal Cave",
    emoji: "💎",
    type: "memory",
    title: "Match the Magic Pairs!",
    success: "Wow! Your memory is amazing!"
  },
  {
    name: "The Puzzle Palace",
    emoji: "🏰",
    type: "mini",
    title: "Three Little Puzzles!",
    success: "You are a puzzle champion!"
  },
  {
    name: "The Pirate's Secret",
    emoji: "🏴‍☠️",
    type: "mini",
    title: "The Pirate's Challenges!",
    success: "The pirate is impressed!"
  },
  {
    name: "The Rainbow Island",
    emoji: "🌈",
    type: "mini",
    title: "Rainbow Challenges!",
    success: "You found the rainbow magic!"
  },
  {
    name: "The Final Guardian",
    emoji: "🐉",
    type: "mini",
    title: "Three Final Challenges!",
    success: "You are a true treasure hunter!"
  }
];

// ======================================
// GAME PROGRESS
// ======================================

const SAVE_KEY = "birthdayTreasureProgress";

let progress = loadProgress();
let currentLevel = 0;
let soundEnabled = false;
let audioContext = null;

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));

    if (saved && Array.isArray(saved.completed)) {
      return {
        completed: [...new Set(
          saved.completed.filter(
            n => Number.isInteger(n) && n >= 0 && n < levels.length
          )
        )]
      };
    }
  } catch (error) {
    console.log("Starting a new adventure!");
  }

  return { completed: [] };
}

function saveProgress() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
}

function collectedStars() {
  return progress.completed.length;
}

// ======================================
// SCREEN CONTROL
// ======================================

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.add("hidden");
  });

  document.getElementById(id).classList.remove("hidden");

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ======================================
// START GAME AND MAP
// ======================================

function startGame() {
  showMap();
}

function showMap() {
  updateMap();
  showScreen("mapScreen");
}

function updateMap() {
  document.getElementById("starCount").textContent =
    collectedStars();

  const grid = document.getElementById("levelGrid");
  grid.innerHTML = "";

  levels.forEach((level, index) => {
    const completed = progress.completed.includes(index);

    const unlocked =
      completed ||
      index === 0 ||
      progress.completed.includes(index - 1);

    const card = document.createElement("button");

    card.className =
      "level-card " +
      (completed ? "completed " : "") +
      (!unlocked ? "locked" : "");

    card.innerHTML = `
      <span class="emoji">${level.emoji}</span>
      <span>Level ${index + 1}</span>
      <div>${level.name}</div>
      <div>${completed ? "⭐ Done!" : unlocked ? "▶ Play" : "🔒 Locked"}</div>
    `;

    card.disabled = !unlocked;
    card.onclick = () => openLevel(index);

    grid.appendChild(card);
  });

  if (collectedStars() === 6) {
    const treasure = document.createElement("div");
    treasure.className = "tag";
    treasure.textContent = "🎁 All stars collected! Treasure unlocked!";
    grid.appendChild(treasure);
  }
}

// ======================================
// OPEN A LEVEL
// ======================================

function openLevel(index) {
  if (
    index > 0 &&
    !progress.completed.includes(index - 1)
  ) {
    return;
  }

  if (progress.completed.includes(index)) {
    alert("You have already completed this level! ⭐");
    return;
  }

  currentLevel = index;

  const level = levels[index];

  document.getElementById("levelNumber").textContent =
    `LEVEL ${index + 1} - ${level.name}`;

  document.getElementById("levelStars").textContent =
    `⭐ ${collectedStars()}/6`;

  showScreen("gameScreen");

  const content = document.getElementById("gameContent");

  content.innerHTML = `
    <div style="font-size:65px">${level.emoji}</div>
    <h1>${level.title}</h1>
  `;

  if (level.type === "question") {
    renderQuestion(level);
  } else if (level.type === "memory") {
    renderMemory();
  } else if (level.type === "mini") {
    startMiniGames();
  }
}

// ======================================
// QUESTION GAME
// ======================================

function renderQuestion(level) {
  const content = document.getElementById("gameContent");

  content.innerHTML += `
    <div class="question">${level.question}</div>
    <div id="answerOptions"></div>
    <div id="feedback" class="feedback"></div>

    <button class="secondary-btn" onclick="showHint()">
      💡 Give me a hint
    </button>

    <div id="hintArea"></div>
  `;

  const options = document.getElementById("answerOptions");

  level.answers.forEach((answer, index) => {
    const button = document.createElement("button");

    button.className = "answer-btn";
    button.textContent = answer;

    button.onclick = () => {
      const feedback = document.getElementById("feedback");

      if (index === level.correct) {
        feedback.textContent = "🎉 Correct! Amazing!";
        feedback.style.color = "green";

        playSound(true);
        setTimeout(() => completeLevel(), 900);
      } else {
        feedback.textContent = "Oops! Try again. You can do it! 😊";
        feedback.style.color = "#d66b65";

        playSound(false);
      }
    };

    options.appendChild(button);
  });
}

// ======================================
// HINT SYSTEM
// ======================================

function showHint() {
  const level = levels[currentLevel];
  const area = document.getElementById("hintArea");

  if (!area || !level.hint) return;

  area.innerHTML = `
    <div class="hint">
      💡 Hint: ${level.hint}
    </div>
  `;
}

// ======================================
// MEMORY MATCHING GAME
// ======================================

let memoryCards = [];
let selectedCards = [];
let matchedPairs = 0;
let memoryBusy = false;

function renderMemory() {
  const content = document.getElementById("gameContent");

  content.innerHTML += `
    <p>Find two matching pictures!</p>
    <p id="memoryCount">Pairs found: 0/4</p>
    <div class="memory-grid" id="memoryGrid"></div>
    <div id="memoryFeedback" class="feedback"></div>
  `;

  memoryCards = [
    "🐱", "🐶", "🌈", "⭐",
    "🐱", "🐶", "🌈", "⭐"
  ];

  memoryCards.sort(() => Math.random() - 0.5);

  selectedCards = [];
  matchedPairs = 0;
  memoryBusy = false;

  const grid = document.getElementById("memoryGrid");

  memoryCards.forEach((emoji, index) => {
    const card = document.createElement("button");

    card.className = "memory-card";
    card.textContent = "❓";
    card.dataset.emoji = emoji;
    card.dataset.index = index;

    card.onclick = () => flipCard(card);

    grid.appendChild(card);
  });
}

function flipCard(card) {
  if (
    memoryBusy ||
    card.classList.contains("matched") ||
    selectedCards.includes(card)
  ) {
    return;
  }

  card.textContent = card.dataset.emoji;
  selectedCards.push(card);

  if (selectedCards.length === 2) {
    memoryBusy = true;

    const first = selectedCards[0];
    const second = selectedCards[1];

    if (first.dataset.emoji === second.dataset.emoji) {
      first.classList.add("matched");
      second.classList.add("matched");

      matchedPairs++;

      document.getElementById("memoryCount").textContent =
        `Pairs found: ${matchedPairs}/4`;

      selectedCards = [];
      memoryBusy = false;

      playSound(true);

      if (matchedPairs === 4) {
        setTimeout(() => completeLevel(), 700);
      }
    } else {
      playSound(false);

      setTimeout(() => {
        first.textContent = "❓";
        second.textContent = "❓";

        selectedCards = [];
        memoryBusy = false;
      }, 800);
    }
  }
}

// ======================================
// PART 2: MINI-GAMES FOR LEVELS 3–6
// ======================================

const miniGames = {
  2: [
    {
      type: "input",
      title: "Game 1: Mixed-Up Word",
      question: "Put these letters in the right order: TAC",
      answer: "CAT",
      hint: "It is a cute animal that says MEOW!"
    },
    {
      type: "input",
      title: "Game 2: Missing Letter",
      question: "Complete this word: C _ T",
      answer: "A",
      hint: "The missing letter comes after C."
    },
    {
      type: "choice",
      title: "Game 3: Find the Odd One",
      question: "Which one is NOT an animal?",
      options: ["CAT", "DOG", "APPLE"],
      answer: "APPLE"
    }
  ],

  3: [
    {
      type: "choice",
      title: "Game 1: Number Pattern",
      question: "2, 4, 6, 8, ___",
      options: ["9", "10", "12"],
      answer: "10",
      hint: "Add 2 each time!"
    },
    {
      type: "input",
      title: "Game 2: Little Maths",
      question: "What is 5 + 3?",
      answer: "8",
      hint: "Count 5 and then 3 more!"
    },
    {
      type: "choice",
      title: "Game 3: Bigger Number",
      question: "Which number is bigger?",
      options: ["12", "21"],
      answer: "21"
    }
  ],

  4: [
    {
      type: "stars",
      title: "Game 1: Find the Stars",
      question: "Tap all 5 hidden stars!",
      stars: 5
    },
    {
      type: "sequence",
      title: "Game 2: Remember the Colours",
      question: "Tap these colours in order: 🔴 🔵 🟡",
      sequence: ["RED", "BLUE", "YELLOW"],
      options: ["RED", "BLUE", "YELLOW"]
    },
    {
      type: "choice",
      title: "Game 3: Odd Emoji",
      question: "Which one is different?",
      options: ["🍎", "🍎", "🍌", "🍎"],
      answer: "🍌"
    }
  ],

  5: [
    {
      type: "choice",
      title: "Game 1: Night Sky",
      question: "What shines in the sky at night?",
      options: ["A fish", "A star", "A flower"],
      answer: "A star",
      hint: "Look up at the night sky!"
    },
    {
      type: "choice",
      title: "Game 2: Animal Sounds",
      question: "Which animal says MEOW?",
      options: ["Dog 🐶", "Cat 🐱", "Cow 🐮"],
      answer: "Cat 🐱"
    },
    {
      type: "choice",
      title: "Game 3: Birthday Girl",
      question: "Whose birthday are we celebrating?",
      options: [
        SISTER_NAME,
        "A princess",
        "A teddy bear"
      ],
      answer: SISTER_NAME
    }
  ]
};

// ======================================
// MINI-GAME PROGRESS
// ======================================

let miniGameIndex = 0;
let sequenceIndex = 0;
let starsFound = 0;
let miniGameLocked = false;

// ======================================
// START MINI-GAMES
// ======================================

function startMiniGames() {
  miniGameIndex = 0;
  sequenceIndex = 0;
  starsFound = 0;
  miniGameLocked = false;

  renderMiniGame();
}

// ======================================
// SHOW A MINI-GAME
// ======================================

function renderMiniGame() {
  const gameList = miniGames[currentLevel];
  const game = gameList[miniGameIndex];

  const content = document.getElementById("gameContent");

  content.innerHTML = `
    <div style="font-size:22px;margin:10px">
      Challenge ${miniGameIndex + 1} of 3
    </div>

    <h2>${game.title}</h2>

    <p class="question">${game.question}</p>

    <div id="miniGameArea"></div>

    <div id="miniFeedback" class="feedback"></div>

    <div id="miniHintArea"></div>

    <button class="secondary-btn" onclick="showMiniHint()">
      💡 Need a hint?
    </button>
  `;

  miniGameLocked = false;

  if (game.type === "input") {
    renderMiniInput(game);
  }

  if (game.type === "choice") {
    renderMiniChoices(game);
  }

  if (game.type === "stars") {
    renderMiniStars(game);
  }

  if (game.type === "sequence") {
    renderMiniSequence(game);
  }
}

// ======================================
// MINI-GAME: TEXT ANSWER
// ======================================


function renderMiniInput(game) {
  const area = document.getElementById("miniGameArea");

  area.innerHTML = `
    <input
      type="text"
      id="miniAnswer"
      class="game-input"
      placeholder="Type your answer here..."
      autocomplete="off"
      autocapitalize="characters"
    />

    <button class="primary-btn" onclick="checkMiniInput()">
      CHECK ANSWER
    </button>
  `;

  const input = document.getElementById("miniAnswer");

  input.disabled = false;
  input.value = "";

  input.addEventListener("input", function () {
    console.log("Typed:", input.value);
  });
}



function checkMiniInput() {
  if (miniGameLocked) return;

  const game = miniGames[currentLevel][miniGameIndex];

  const answer = document.getElementById("miniAnswer")
    .value.trim().toUpperCase();

  const correctAnswers = [game.answer.toUpperCase()];

  // Accept both A and CAT for the missing-letter puzzle
  if (currentLevel === 2 && miniGameIndex === 1) {
    correctAnswers.push("CAT");
  }

  if (correctAnswers.includes(answer)) {
    miniGamePassed();
  } else {
    miniGameWrong();
  }
}


// ======================================
// MINI-GAME: MULTIPLE CHOICE
// ======================================

function renderMiniChoices(game) {
  const area = document.getElementById("miniGameArea");

  game.options.forEach(option => {
    const button = document.createElement("button");

    button.className = "answer-btn";
    button.textContent = option;

    button.onclick = () => {
      if (miniGameLocked) return;

      if (option === game.answer) {
        miniGamePassed();
      } else {
        miniGameWrong();
      }
    };

    area.appendChild(button);
  });
}

// ======================================
// MINI-GAME: FIND FIVE STARS
// ======================================

function renderMiniStars(game) {
  const area = document.getElementById("miniGameArea");

  starsFound = 0;

  const objects = [
    "🍎", "⭐", "🎈", "🌸",
    "⭐", "🦋", "⭐", "🍓",
    "⭐", "🌻", "⭐", "🐱"
  ];

  area.innerHTML = `
    <p id="miniStarCount">Stars found: 0/5</p>
    <div class="hidden-grid" id="miniStarGrid"></div>
  `;

  const grid = document.getElementById("miniStarGrid");

  objects.forEach(object => {
    const button = document.createElement("button");

    button.className = "hidden-item";
    button.textContent = "❔";

    button.onclick = () => {
      if (miniGameLocked || button.classList.contains("found")) {
        return;
      }

      button.classList.add("found");
      button.textContent = object;

      if (object === "⭐") {
        starsFound++;

        document.getElementById("miniStarCount").textContent =
          `Stars found: ${starsFound}/5`;

        playSound(true);

        if (starsFound === 5) {
          miniGamePassed();
        }
      } else {
        button.style.opacity = "0.5";
        playSound(false);
      }
    };

    grid.appendChild(button);
  });
}

// ======================================
// MINI-GAME: COLOUR SEQUENCE
// ======================================

function renderMiniSequence(game) {
  const area = document.getElementById("miniGameArea");

  sequenceIndex = 0;

  area.innerHTML = `
    <p id="sequenceProgress">Colour 1 of 3</p>
    <div id="sequenceButtons"></div>
  `;

  const buttons = document.getElementById("sequenceButtons");

  game.options.forEach(colour => {
    const button = document.createElement("button");

    button.className = "answer-btn";
    button.textContent = colour;

    button.onclick = () => {
      if (miniGameLocked) return;

      const expected = game.sequence[sequenceIndex];

      if (colour === expected) {
        sequenceIndex++;

        playSound(true);

        if (sequenceIndex === game.sequence.length) {
          miniGamePassed();
        } else {
          document.getElementById("sequenceProgress").textContent =
            `Colour ${sequenceIndex + 1} of 3`;
        }
      } else {
        sequenceIndex = 0;

        document.getElementById("sequenceProgress").textContent =
          "Oops! Start again from RED ❤️";

        playSound(false);
      }
    };

    buttons.appendChild(button);
  });
}

// ======================================
// MINI-GAME: HINT
// ======================================

function showMiniHint() {
  const game = miniGames[currentLevel][miniGameIndex];

  const area = document.getElementById("miniHintArea");

  if (game.hint) {
    area.innerHTML = `
      <div class="hint">💡 Hint: ${game.hint}</div>
    `;
  } else {
    area.innerHTML = `
      <div class="hint">💡 Take your time. You can do it!</div>
    `;
  }
}

// ======================================
// CORRECT ANSWER
// ======================================

function miniGamePassed() {
  if (miniGameLocked) return;

  miniGameLocked = true;

  const feedback = document.getElementById("miniFeedback");

  feedback.textContent = "🎉 Correct! Well done!";
  feedback.style.color = "green";

  playSound(true);

  const area = document.getElementById("miniGameArea");

  area.querySelectorAll("button, input").forEach(element => {
    element.disabled = true;
  });

  setTimeout(() => {
    miniGameIndex++;

    if (miniGameIndex < miniGames[currentLevel].length) {
      renderMiniGame();
    } else {
      completeLevel();
    }
  }, 900);
}

// ======================================
// WRONG ANSWER
// ======================================

function miniGameWrong() {
  const feedback = document.getElementById("miniFeedback");

  feedback.textContent = "Oops! Try again. You can do it! 😊";
  feedback.style.color = "#d66b65";

  playSound(false);
}

// ======================================
// PART 3: COMPLETE LEVEL
// ======================================

function completeLevel() {
  if (progress.completed.includes(currentLevel)) return;

  progress.completed.push(currentLevel);

  saveProgress();

  document.getElementById("successMessage").textContent =
    levels[currentLevel].success;

  showScreen("successScreen");

  playSound(true);
}

function continueGame() {
  if (collectedStars() === 6) {
    showScreen("treasureScreen");
  } else {
    showMap();
  }
}

// ======================================
// FINAL TREASURE
// ======================================

function openFinalGift() {
  if (collectedStars() !== 6) return;

  document.getElementById("birthdayLetter").textContent =
    BIRTHDAY_MESSAGE;

  const videoArea = document.getElementById("videoArea");

  if (VIDEO_URL.trim()) {
    const video = document.createElement("video");

    video.src = VIDEO_URL;
    video.controls = true;
    video.playsInline = true;
    video.style.width = "100%";
    video.style.borderRadius = "18px";

    videoArea.innerHTML = "";
    videoArea.appendChild(video);
  } else {
    videoArea.innerHTML = `
      <div class="hint">
        🎥 Your special birthday video will appear here!
      </div>
    `;
  }

  showScreen("finalScreen");
  launchConfetti();
}

// ======================================
// RESET GAME
// ======================================

function resetGame() {
  const answer = confirm(
    "Do you want to start the adventure again? Your saved stars will be lost."
  );

  if (!answer) return;

  progress = { completed: [] };

  saveProgress();

  showMap();
}

// ======================================
// SOUND EFFECTS
// ======================================

function toggleMusic() {
  soundEnabled = !soundEnabled;

  document.getElementById("musicBtn").textContent =
    soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";

  if (soundEnabled) {
    playSound(true);
  }
}

function playSound(success) {
  if (!soundEnabled) return;

  try {
    audioContext =
      audioContext ||
      new (window.AudioContext || window.webkitAudioContext)();

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.frequency.value = success ? 660 : 220;
    oscillator.type = "sine";

    gain.gain.setValueAtTime(0.12, audioContext.currentTime);

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.25
    );

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.25);

  } catch (error) {
    console.log("Sound is not available.");
  }
}

// ======================================
// CELEBRATION CONFETTI
// ======================================

function launchConfetti() {
  const emojis = ["🎉", "⭐", "🎈", "💖", "✨", "🎊"];

  for (let i = 0; i < 30; i++) {
    const item = document.createElement("div");

    item.textContent =
      emojis[Math.floor(Math.random() * emojis.length)];

    item.style.position = "fixed";
    item.style.left = Math.random() * 100 + "vw";
    item.style.top = "-30px";
    item.style.fontSize = "25px";
    item.style.zIndex = "10";
    item.style.pointerEvents = "none";

    document.body.appendChild(item);

    const duration = 2500 + Math.random() * 2000;

    item.animate(
      [
        {
          transform: "translateY(0) rotate(0deg)",
          opacity: 1
        },
        {
          transform: `translateY(${window.innerHeight + 100}px) rotate(500deg)`,
          opacity: 0
        }
      ],
      {
        duration: duration,
        easing: "ease-in"
      }
    );

    setTimeout(() => item.remove(), duration);
  }
}

// ======================================
// PERSONALISE WELCOME SCREEN
// ======================================

document.querySelector(".subtitle").textContent =
  `Hello, ${SISTER_NAME}! 👋`;

document.querySelector(".guide").textContent =
  `"Hi ${SISTER_NAME}! I'm your adventure buddy! 🐰"`;
