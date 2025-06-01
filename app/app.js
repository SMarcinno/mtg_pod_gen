
// Utility functions
const readPlayers = () => {
  try {
    return JSON.parse(localStorage.getItem('players')) || [];
  } catch {
    return [];
  }
};
const writePlayers = (players) => {
  localStorage.setItem('players', JSON.stringify(players));
};

// State
let allPlayers = readPlayers(); // Array of { name: string, pref: 'cedh'|'edh'|'neutral' }
let selected = new Set();       // Set of player names

// DOM elements
const playerInput = document.getElementById('player-name');
const addBtn = document.getElementById('add-btn');
const playersUl = document.getElementById('players-ul');
const selectAllBtn = document.getElementById('select-all-btn');
const deselectAllBtn = document.getElementById('deselect-all-btn');
const generateBtn = document.getElementById('generate-pods-btn');
const podsContainer = document.getElementById('pods-container');

const togglePlayersBtn = document.getElementById('toggle-players-btn');
const playerListWrapper = document.getElementById('player-list-wrapper');

// Shuffle (Fisher–Yates)
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Render players list with preference dropdown
function renderPlayers() {
  playersUl.innerHTML = '';

  allPlayers.forEach((playerObj) => {
    const { name, pref } = playerObj;
    const li = document.createElement('li');
    li.classList.toggle('selected', selected.has(name));

    // Container div for layout
    const innerDiv = document.createElement('div');
    innerDiv.style.display = 'flex';
    innerDiv.style.alignItems = 'center';
    innerDiv.style.justifyContent = 'space-between';
    innerDiv.style.width = '100%';

    // 1) Name span (click toggles selection)
    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.style.flex = '1';
    nameSpan.style.cursor = 'pointer';
    nameSpan.addEventListener('click', () => {
      if (selected.has(name)) {
        selected.delete(name);
      } else {
        selected.add(name);
      }
      renderPlayers();
    });

    // 2) Preference dropdown
    const prefSelect = document.createElement('select');
    prefSelect.innerHTML = `
      <option value="cedh"   ${pref === 'cedh' ? 'selected' : ''}>cedh</option>
      <option value="edh"    ${pref === 'edh' ? 'selected' : ''}>edh</option>
      <option value="neutral"${pref === 'neutral' ? 'selected' : ''}>neutral</option>
    `;
    prefSelect.style.margin = '0 0.5rem';
    prefSelect.addEventListener('change', () => {
      playerObj.pref = prefSelect.value;
      writePlayers(allPlayers);
    });

    // 3) Remove button
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '✕';
    removeBtn.className = 'remove-btn';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      allPlayers = allPlayers.filter((p) => p.name !== name);
      selected.delete(name);
      writePlayers(allPlayers);
      renderPlayers();
    });

    innerDiv.appendChild(nameSpan);
    innerDiv.appendChild(prefSelect);
    innerDiv.appendChild(removeBtn);
    li.appendChild(innerDiv);
    playersUl.appendChild(li);
  });
}

// Add new player (default pref = 'neutral')
addBtn.addEventListener('click', () => {
  const name = playerInput.value.trim();
  if (!name) return;
  if (!allPlayers.some((p) => p.name === name)) {
    allPlayers.push({ name, pref: 'neutral' });
    writePlayers(allPlayers);
    playerInput.value = '';
    renderPlayers();
  }
});

// Select all / deselect all
selectAllBtn.addEventListener('click', () => {
  allPlayers.forEach((p) => selected.add(p.name));
  renderPlayers();
});
deselectAllBtn.addEventListener('click', () => {
  selected.clear();
  renderPlayers();
});

// Generate pods with preference logic
generateBtn.addEventListener('click', () => {
  // 1) Filter only selected players
  const selectedObjs = allPlayers.filter((p) => selected.has(p.name));

  // 2) Separate by preference
  const cedhList = selectedObjs.filter((p) => p.pref === 'cedh');
  const edhList = selectedObjs.filter((p) => p.pref === 'edh');
  let neutralList = selectedObjs.filter((p) => p.pref === 'neutral');

  const pods = [];
  const cedhRemainder = [];

  // === Stage 1: Build cedh pods ===
  let cedhPool = shuffle(cedhList.slice());
  // Full 4-player cedh pods
  while (cedhPool.length >= 4) {
    pods.push(cedhPool.splice(0, 4));
  }
  // Exactly 3 cedh remain → one 3-player pod
  if (cedhPool.length === 3) {
    pods.push(cedhPool.splice(0, 3));
  }
  // 2 cedh remain → try to fill with 1 neutral
  if (cedhPool.length === 2) {
    if (neutralList.length >= 1) {
      const pod = cedhPool.splice(0, 2);
      pod.push(neutralList.pop());
      pods.push(pod);
    } else {
      cedhRemainder.push(...cedhPool.splice(0, 2));
    }
  }
  // 1 cedh remains → try to fill with 2 neutrals
  if (cedhPool.length === 1) {
    if (neutralList.length >= 2) {
      const pod = cedhPool.splice(0, 1);
      pod.push(neutralList.pop());
      pod.push(neutralList.pop());
      pods.push(pod);
    } else {
      cedhRemainder.push(...cedhPool.splice(0, 1));
    }
  }

  // === Stage 2: Build edh pods (including cedh remainders) ===
  let edhPool = shuffle(edhList.concat(cedhRemainder));
  const edhRemainder = [];
  // Full 4-player edh pods
  while (edhPool.length >= 4) {
    pods.push(edhPool.splice(0, 4));
  }
  // Exactly 3 remain → one 3-player pod
  if (edhPool.length === 3) {
    pods.push(edhPool.splice(0, 3));
  }
  // 2 remain → try to fill with 1 neutral
  if (edhPool.length === 2) {
    if (neutralList.length >= 1) {
      const pod = edhPool.splice(0, 2);
      pod.push(neutralList.pop());
      pods.push(pod);
    } else {
      edhRemainder.push(...edhPool.splice(0, 2));
    }
  }
  // 1 remains → try to fill with 2 neutrals
  if (edhPool.length === 1) {
    if (neutralList.length >= 2) {
      const pod = edhPool.splice(0, 1);
      pod.push(neutralList.pop());
      pod.push(neutralList.pop());
      pods.push(pod);
    } else {
      edhRemainder.push(...edhPool.splice(0, 1));
    }
  }

  // === Stage 3: Build pure neutral pods ===
  let neutralPool = shuffle(neutralList.slice());
  const neutralRemainder = [];
  while (neutralPool.length >= 4) {
    pods.push(neutralPool.splice(0, 4));
  }
  if (neutralPool.length === 3) {
    pods.push(neutralPool.splice(0, 3));
  }
  // 2 or 1 remain → keep as neutralRemainder
  if (neutralPool.length > 0) {
    neutralRemainder.push(...neutralPool.splice(0, neutralPool.length));
  }

  // === Stage 4: Handle any leftovers (edhRemainder + neutralRemainder) ===
  let leftover = edhRemainder.concat(neutralRemainder);
  if (leftover.length > 0) {
    leftover.forEach((player) => {
      // Find a pod with fewer than 4 members
      const target = pods.find((pod) => pod.length < 4);
      if (target) {
        target.push(player);
      } else {
        // No pod has space → create a new pod
        pods.push([player]);
      }
    });
  }

  // === Stage 5: Re-balance any pods of size 2 ===
  if (pods.length > 1) {
    const lastPod = pods[pods.length - 1];
    if (lastPod.length === 2) {
      for (let i = pods.length - 2; i >= 0; i--) {
        if (pods[i].length > 3) {
          lastPod.push(pods[i].pop());
          break;
        }
      }
    }
  }

  renderPods(pods);
})

// Render pods
function renderPods(pods) {
  podsContainer.innerHTML = '';
  pods.forEach((pod) => {
    const card = document.createElement('div');
    card.className = 'pod';

    const title = document.createElement('h3');
    const randomName = typeof getRandomPodName === 'function'
      ? getRandomPodName()
      : 'Pod';
    title.textContent = randomName;
    card.appendChild(title);

    const ul = document.createElement('ul');
    pod.forEach((p) => {
      const li = document.createElement('li');
      li.textContent = `${p.name} (${p.pref})`;
      ul.appendChild(li);
    });
    card.appendChild(ul);
    podsContainer.appendChild(card);
  });
}

// Toggle player list visibility
togglePlayersBtn.addEventListener('click', () => {
  playerListWrapper.classList.toggle('collapsed');
  if (playerListWrapper.classList.contains('collapsed')) {
    togglePlayersBtn.textContent = 'Spieler-Liste anzeigen';
  } else {
    togglePlayersBtn.textContent = 'Spieler-Liste verbergen';
  }
});

// Initial render
renderPlayers();
