// Utility functions
const readPlayers = () => JSON.parse(localStorage.getItem('players') || '[]');
const writePlayers = (players) => localStorage.setItem('players', JSON.stringify(players));

// State
let allPlayers = readPlayers();
let selected = new Set();

// DOM elements
const playerInput = document.getElementById('player-name');
const addBtn = document.getElementById('add-btn');
const playersUl = document.getElementById('players-ul');
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');
const generateBtn = document.getElementById('generate-pods-btn');
const podsContainer = document.getElementById('pods-container');

// Render players list
function renderPlayers() {
    playersUl.innerHTML = '';
    allPlayers.forEach(name => {
        const li = document.createElement('li');
        li.textContent = name;
        li.classList.toggle('selected', selected.has(name));

        li.addEventListener('click', () => {
            if (selected.has(name)) {
                selected.delete(name);
            } else {
                selected.add(name);
            }
            renderPlayers();
        });

        const removeBtn = document.createElement('button');
        removeBtn.textContent = '✕';
        removeBtn.className = 'remove-btn';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            allPlayers = allPlayers.filter(p => p !== name);
            selected.delete(name);
            writePlayers(allPlayers);
            renderPlayers();
        });

        li.appendChild(removeBtn);
        playersUl.appendChild(li);
    });
}

// Add player
addBtn.addEventListener('click', () => {
    const name = playerInput.value.trim();
    if (name && !allPlayers.includes(name)) {
        allPlayers.push(name);
        writePlayers(allPlayers);
        playerInput.value = '';
        renderPlayers();
    }
});

// Select all / deselect all
selectAllBtn.addEventListener('click', () => {
    allPlayers.forEach(name => selected.add(name));
    renderPlayers();
});

deselectAllBtn.addEventListener('click', () => {
    selected.clear();
    renderPlayers();
});

// Fisher–Yates shuffle
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Generate pods
generateBtn.addEventListener('click', () => {
    const tonight = shuffle(Array.from(selected));   // random order
    const pods = [];

    while (tonight.length > 0) {
        /* Special case: 6 players → two pods of 3 + 3 */
        if (tonight.length === 6) {
            pods.push(tonight.splice(0, 3));
            pods.push(tonight.splice(0, 3));
            break;
        }

        /* Normal preference: groups of 4, then 3 */
        if (tonight.length >= 4) {
            pods.push(tonight.splice(0, 4));
        } else if (tonight.length === 3) {
            pods.push(tonight.splice(0, 3));
        } else {           // length is 1 or 2
            pods[pods.length - 1].push(...tonight.splice(0));   // merge
        }
    }

    /* Re-balance: if the last pod ended up with 2, steal one player
       from an earlier 4-player pod so it becomes 3 + 3.  */
    if (pods.length > 1 && pods[pods.length - 1].length === 2) {
        for (let i = pods.length - 2; i >= 0; i--) {
            if (pods[i].length > 3) {
                pods[pods.length - 1].push(pods[i].pop());
                break;
            }
        }
    }

    renderPods(pods);
});

function renderPods(pods) {
    podsContainer.innerHTML = '';
    pods.forEach((pod, idx) => {
        const card = document.createElement('div');
        card.className = 'pod';

        // Zufälliger MTG-Style-Pod-Name statt "Pod 1", "Pod 2", ...
        const title = document.createElement('h3');
        const randomName = getRandomPodName(); // Funktion aus pod-names.js
        title.textContent = randomName;
        card.appendChild(title);

        const ul = document.createElement('ul');
        pod.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p;
            ul.appendChild(li);
        });
        card.appendChild(ul);
        podsContainer.appendChild(card);
    });
}


// Toggle-Button und Wrapper holen
const togglePlayersBtn = document.getElementById('toggle-players-btn');
const playerListWrapper = document.getElementById('player-list-wrapper');

// Anfangszustand: Liste ist ausgeklappt. Beim Klick Klasse toggeln.
togglePlayersBtn.addEventListener('click', () => {
    playerListWrapper.classList.toggle('collapsed');

    // Button-Text anpassen
    if (playerListWrapper.classList.contains('collapsed')) {
        togglePlayersBtn.textContent = 'Spieler-Liste anzeigen';
    } else {
        togglePlayersBtn.textContent = 'Spieler-Liste verbergen';
    }
});


// On load
renderPlayers();
