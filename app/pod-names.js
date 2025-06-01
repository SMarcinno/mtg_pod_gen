// pod-names.js

/**
 * Eine Liste mit (witzigen) MTG-Style-Namen für Pods.
 * Bei Bedarf kannst du hier einfach weitere Einträge hinzufügen.
 */
const podNames = [
    "Lightning Legion",
    "Goblin Grenadiers",
    "Ethereal Enchanters",
    "Mystic Marauders",
    "Arcane Acolytes",
    "Shadow Syndicate",
    "Eldritch Echoes",
    "Fury of Faerie",
    "Rune Runners",
    "Vortex Vanguard",
    "Celestial Conclave",
    "Dragon Drakeguard",
    "Spectral Sentinels",
    "Phantom Phalanx",
    "Grove Guardians",
    "Soulbinders",
    "Gilded Griffins",
    "Vineweaver Coven",
    "Grim Grimoire",
    "Storm Heralds",
    "Blade of Bolas",
    "Nightmare Nymphs",
    "Chronicle Champions",
    "Verdant Vengeance",
    "Ashen Arbiter",
    "Scorned Serpents",
    "Titanic Tribunes",
    "Ebon Eruption",
    "Halcyon Heralds",
    "Duskwatch Dragoons"
  ];
  
  /**
   * Liefert einen zufälligen Namen aus podNames zurück.
   */
  function getRandomPodName() {
    const idx = Math.floor(Math.random() * podNames.length);
    return podNames[idx];
  }
  