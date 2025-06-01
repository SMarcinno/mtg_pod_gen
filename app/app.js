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
  
  // State: Array von { name: string, pref: 'cedh'|'edh'|'neutral' }
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
  
  // Zyklische Reihenfolge für Präferenz-Button
  const PREFS = ['edh', 'cedh', 'neutral'];
  function nextPref(current) {
    const idx = PREFS.indexOf(current);
    return PREFS[(idx + 1) % PREFS.length];
  }
  
  // Render players list: jetzt mit Pref-Button statt Dropdown
  function renderPlayers() {
    playersUl.innerHTML = '';
  
    allPlayers.forEach((playerObj) => {
      const { name, pref } = playerObj;
      const li = document.createElement('li');
      li.classList.toggle('selected', selected.has(name));
  
      // Container flex für Name + Pref-Button + Remove-Button
      const innerDiv = document.createElement('div');
      innerDiv.style.display = 'flex';
      innerDiv.style.alignItems = 'center';
      innerDiv.style.justifyContent = 'space-between';
      innerDiv.style.width = '100%';
  
      // 1) Name span (kann ausgewählt werden)
      const nameSpan = document.createElement('span');
      nameSpan.textContent = name;
      nameSpan.addEventListener('click', () => {
        if (selected.has(name)) selected.delete(name);
        else selected.add(name);
        renderPlayers();
      });
  
      // 2) Präferenz-Button (zyklisch edh → cedh → neutral)
      const prefBtn = document.createElement('button');
      prefBtn.className = `pref-btn ${pref}`;
      prefBtn.textContent = pref;
      prefBtn.addEventListener('click', () => {
        // Zyklus umschalten
        playerObj.pref = nextPref(playerObj.pref);
        writePlayers(allPlayers);
        renderPlayers(); // neu rendern, damit Farb- und Textänderung sichtbar wird
      });
  
      // 3) Entfernen-Button
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
      innerDiv.appendChild(prefBtn);
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
  
  // Generate pods mit Präferenz-Logik
  generateBtn.addEventListener('click', () => {
    // 1) Nur ausgewählte Spieler
    const selectedObjs = allPlayers.filter((p) => selected.has(p.name));
  
    // 2) Aufteilen in cedh / edh / neutral
    const cedhList = selectedObjs.filter((p) => p.pref === 'cedh');
    const edhList = selectedObjs.filter((p) => p.pref === 'edh');
    let neutralList = selectedObjs.filter((p) => p.pref === 'neutral');
  
    const pods = [];
    const cedhRemainder = [];
  
    // === Stage 1: Cedh-Pods (cedhList) ===
    let cedhPool = shuffle(cedhList.slice());
    while (cedhPool.length >= 4) {
      pods.push(cedhPool.splice(0, 4));
    }
    if (cedhPool.length === 3) {
      pods.push(cedhPool.splice(0, 3));
    }
    if (cedhPool.length === 2) {
      if (neutralList.length >= 1) {
        const pod = cedhPool.splice(0, 2);
        pod.push(neutralList.pop());
        pods.push(pod);
      } else {
        cedhRemainder.push(...cedhPool.splice(0, 2));
      }
    }
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
  
    // === Stage 2: Edh-Pods (edhList + cedhRemainder) ===
    let edhPool = shuffle(edhList.concat(cedhRemainder));
    const edhRemainder = [];
    while (edhPool.length >= 4) {
      pods.push(edhPool.splice(0, 4));
    }
    if (edhPool.length === 3) {
      pods.push(edhPool.splice(0, 3));
    }
    if (edhPool.length === 2) {
      if (neutralList.length >= 1) {
        const pod = edhPool.splice(0, 2);
        pod.push(neutralList.pop());
        pods.push(pod);
      } else {
        edhRemainder.push(...edhPool.splice(0, 2));
      }
    }
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
  
    // === Stage 3: Pure Neutral-Pods ===
    let neutralPool = shuffle(neutralList.slice());
    const neutralRemainder = [];
    while (neutralPool.length >= 4) {
      pods.push(neutralPool.splice(0, 4));
    }
    if (neutralPool.length === 3) {
      pods.push(neutralPool.splice(0, 3));
    }
    if (neutralPool.length > 0) {
      neutralRemainder.push(...neutralPool.splice(0, neutralPool.length));
    }
  
    // === Stage 4: Leftovers (edhRemainder + neutralRemainder) ===
    let leftover = edhRemainder.concat(neutralRemainder);
    if (leftover.length > 0) {
      leftover.forEach((player) => {
        const target = pods.find((pod) => pod.length < 4);
        if (target) {
          target.push(player);
        } else {
          pods.push([player]);
        }
      });
    }
  
    // === Stage 5: Re-Balancing (kein 2er-Pod) ===
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
  });
  
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
    togglePlayersBtn.textContent = playerListWrapper.classList.contains('collapsed')
      ? 'Spieler-Liste'
      : 'Spieler-Liste';
  });

// Toggle-Button und Wrapper holen
const toggleAddBtn = document.getElementById('toggle-add-btn');
const addPlayerWrapper = document.getElementById('add-player-wrapper');

// Initialer Button-Text (im HTML schon gesetzt)
// Beim Klick toggeln wir die Klasse und passen den Button-Text an
toggleAddBtn.addEventListener('click', () => {
  addPlayerWrapper.classList.toggle('collapsed-add');
  if (addPlayerWrapper.classList.contains('collapsed-add')) {
    toggleAddBtn.textContent = 'Spieler hinzufügen';
  } else {
    toggleAddBtn.textContent = 'Spieler hinzufügen';
  }
});

  // Initial render
  renderPlayers();
  
  