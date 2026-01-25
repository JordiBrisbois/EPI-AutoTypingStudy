// ═══════════════════════════════════════════════════════════════════════
// TypingStudy Bot v2.3.0
// Auteur: Jordi Brisbois
// GitHub: https://github.com/JordiBrisbois/EPI-AutoTypingStudy
// License: MIT
// ═══════════════════════════════════════════════════════════════════════

(async function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // VÉRIFICATION DU VERROU ET INITIALISATION
  // ═══════════════════════════════════════════════════════════════════

  if (window.BOT_IS_RUNNING) {
    console.log('%c⚠️ Le bot est déjà en cours d\'exécution!', 'color: #ff9800; font-size: 14px; font-weight: bold;');
    return;
  }

  window.BOT_IS_RUNNING = true;
  console.log('%c🤖 Démarrage du Bot TypingStudy v2.3.0', 'color: #00ff41; font-size: 16px; font-weight: bold; text-shadow: 0 0 5px #00ff41;');

  // ═══════════════════════════════════════════════════════════════════
  // CONSTANTES ET VARIABLES GLOBALES
  // ═══════════════════════════════════════════════════════════════════
  const BASE_PENALTY = 1.23; // Calibré après plusieurs tests : compensation précise
  const ERROR_PENALTY_FACTOR = 0.015; // Chaque erreur ajoute ~1.5% de pénalité

  let NUM_ERRORS = 0;
  let totalChars = 0;
  let startTime = 0;

  try {
    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURATION DYNAMIQUE
    // ═══════════════════════════════════════════════════════════════════

    const DESIRED_WPM = window.BOT_WPM || 60;
    const errorSource = (typeof window.BOT_ERRORS !== 'undefined') ? window.BOT_ERRORS : [0, 1, 2, 3];
    NUM_ERRORS = Array.isArray(errorSource)
      ? errorSource[Math.floor(Math.random() * errorSource.length)]
      : errorSource;

    const totalCompensation = BASE_PENALTY + (NUM_ERRORS * ERROR_PENALTY_FACTOR);
    const TARGET_WPM = Math.round(DESIRED_WPM * totalCompensation);

    console.log(`%c⚙️  Configuration : ${DESIRED_WPM} WPM visé → ${TARGET_WPM} WPM interne (×${totalCompensation.toFixed(2)}) • ${NUM_ERRORS} erreur(s)`, 'color: #00d4ff; font-weight: bold; font-size: 13px;');

    // ═══════════════════════════════════════════════════════════════════
    // RÉCUPÉRATION DES ÉLÉMENTS DOM
    // ═══════════════════════════════════════════════════════════════════

    const inputArea = document.getElementById('type');
    const hiddenInput = document.getElementById('type_text');

    if (!inputArea || !hiddenInput) {
      throw new Error('❌ Éléments DOM (#type ou #type_text) introuvables');
    }

    // Prétraitement du texte
    const targetText = hiddenInput.value
      .replace(/\\n/g, '\n')
      .replace(/¶/g, ' ');

    totalChars = targetText.length;

    console.log(`%c📝 Texte chargé : ${totalChars} caractères`, 'color: #ffeb3b; font-weight: bold;');

    // ═══════════════════════════════════════════════════════════════════
    // UTILITAIRES MATHÉMATIQUES
    // ═══════════════════════════════════════════════════════════════════

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function randomNormal(mean, stdDev) {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      const z0 = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return mean + z0 * stdDev;
    }

    // ═══════════════════════════════════════════════════════════════════
    // GÉNÉRATION DES POSITIONS D'ERREURS
    // ═══════════════════════════════════════════════════════════════════

    const errorIndices = new Set();
    const SAFE_ZONE = 10;

    if (NUM_ERRORS > 0 && totalChars > SAFE_ZONE * 2) {
      const maxErrors = Math.min(NUM_ERRORS, totalChars - SAFE_ZONE * 2);

      while (errorIndices.size < maxErrors) {
        const randomIndex = Math.floor(Math.random() * (totalChars - SAFE_ZONE * 2)) + SAFE_ZONE;
        const char = targetText[randomIndex];

        if (char !== ' ' && char !== '\n') {
          errorIndices.add(randomIndex);
        }
      }

      const sortedErrors = Array.from(errorIndices).sort((a, b) => a - b);
      console.log(`%c🎯 Positions d'erreurs : [${sortedErrors.join(', ')}]`, 'color: #ff6b6b; font-weight: bold;');
    }

    // ═══════════════════════════════════════════════════════════════════
    // FONCTION DE SIMULATION D'ÉVÉNEMENT CLAVIER
    // ═══════════════════════════════════════════════════════════════════

    async function sendKey(char) {
      let key = char;
      let keyCode = char.charCodeAt(0);
      let code = 'Quote';

      if (char === 'Backspace') {
        key = 'Backspace';
        keyCode = 8;
        code = 'Backspace';
      } else if (char === ' ') {
        keyCode = 32;
        code = 'Space';
      } else if (char === '\n') {
        key = 'Enter';
        keyCode = 13;
        code = 'Enter';
      } else if (/[a-z]/i.test(char)) {
        code = `Key${char.toUpperCase()}`;
      }

      const eventOptions = {
        bubbles: true,
        cancelable: true,
        view: window,
        key,
        code,
        keyCode,
        which: keyCode
      };

      inputArea.dispatchEvent(new KeyboardEvent('keydown', eventOptions));

      if (char !== 'Backspace') {
        inputArea.dispatchEvent(new KeyboardEvent('keypress', {
          ...eventOptions,
          charCode: keyCode
        }));
      }

      let inputType = 'insertText';
      let data = char;

      if (key === 'Enter') {
        inputType = 'insertLineBreak';
        data = null;
      } else if (key === 'Backspace') {
        inputType = 'deleteContentBackward';
        data = null;
      }

      inputArea.dispatchEvent(new InputEvent('input', {
        bubbles: true,
        cancelable: true,
        inputType,
        data
      }));

      inputArea.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
    }

    // ═══════════════════════════════════════════════════════════════════
    // CALCUL DU DÉLAI AVEC VARIATION HUMAINE
    // ═══════════════════════════════════════════════════════════════════

    function getTypingDelay(char) {
      const baseDelayMs = 60000 / (TARGET_WPM * 5);
      let delay = Math.abs(randomNormal(baseDelayMs, baseDelayMs * 0.15));

      if (/[A-Z]/.test(char)) {
        delay += Math.abs(randomNormal(5, 2));
      }

      if (char === ' ') {
        delay += Math.abs(randomNormal(5, 2));
      }

      return Math.max(delay, 10);
    }

    // ═══════════════════════════════════════════════════════════════════
    // INITIALISATION DE LA ZONE DE SAISIE
    // ═══════════════════════════════════════════════════════════════════

    inputArea.focus();
    inputArea.value = '';
    await sleep(100);

    // ═══════════════════════════════════════════════════════════════════
    // BOUCLE PRINCIPALE DE FRAPPE
    // ═══════════════════════════════════════════════════════════════════

    console.log('%c⌨️  Début de la frappe...', 'color: #4caf50; font-weight: bold; font-size: 13px;');
    startTime = Date.now();

    for (let i = 0; i < targetText.length; i++) {
      const char = targetText[i];

      if (errorIndices.has(i)) {
        let wrongChar;

        if (/[a-z]/i.test(char)) {
          const keyboardProximity = {
            'a': ['z', 'q', 's'], 'b': ['v', 'n', 'g', 'h'], 'c': ['x', 'v', 'd', 'f'],
            'd': ['s', 'f', 'e', 'r', 'c', 'x'], 'e': ['w', 'r', 'd', 's'],
            'f': ['d', 'g', 'r', 't', 'v', 'c'], 'g': ['f', 'h', 't', 'y', 'b', 'v'],
            'h': ['g', 'j', 'y', 'u', 'n', 'b'], 'i': ['u', 'o', 'k', 'j'],
            'j': ['h', 'k', 'u', 'i', 'm', 'n'], 'k': ['j', 'l', 'i', 'o', 'm'],
            'l': ['k', 'o', 'p'], 'm': ['n', 'j', 'k'], 'n': ['b', 'm', 'h', 'j'],
            'o': ['i', 'p', 'l', 'k'], 'p': ['o', 'l'], 'q': ['w', 'a', 's'],
            'r': ['e', 't', 'f', 'd'], 's': ['a', 'd', 'w', 'e', 'z', 'x'],
            't': ['r', 'y', 'g', 'f'], 'u': ['y', 'i', 'j', 'h'],
            'v': ['c', 'b', 'f', 'g'], 'w': ['q', 'e', 's', 'a'],
            'x': ['z', 'c', 's', 'd'], 'y': ['t', 'u', 'h', 'g'], 'z': ['a', 's', 'x']
          };

          const lowerChar = char.toLowerCase();
          const proximityKeys = keyboardProximity[lowerChar] || ['a', 'e', 'i', 'o', 'u'];
          wrongChar = proximityKeys[Math.floor(Math.random() * proximityKeys.length)];

          if (char === char.toUpperCase()) {
            wrongChar = wrongChar.toUpperCase();
          }
        } else if (/[0-9]/.test(char)) {
          const digitProximity = {
            '0': ['9', 'p'], '1': ['2', 'q'], '2': ['1', '3', 'w'],
            '3': ['2', '4', 'e'], '4': ['3', '5', 'r'], '5': ['4', '6', 't'],
            '6': ['5', '7', 'y'], '7': ['6', '8', 'u'], '8': ['7', '9', 'i'],
            '9': ['8', '0', 'o']
          };
          const proximityKeys = digitProximity[char] || ['1', '2', '3'];
          wrongChar = proximityKeys[Math.floor(Math.random() * proximityKeys.length)];
        } else {
          const similarChars = ['a', 'e', 'i', 'o', 'u', 's', 't', 'n'];
          wrongChar = similarChars[Math.floor(Math.random() * similarChars.length)];
        }

        console.log(`%c❌ Position ${i} : Substitution '${char}' → '${wrongChar}' (non corrigée)`, 'color: #ff9800;');

        if (wrongChar === '\n') {
          await sendKey('\n');
        } else {
          await sendKey(wrongChar);
        }

        const delay = getTypingDelay(wrongChar);
        await sleep(delay);

        continue;
      }

      if (char === '\n') {
        await sendKey('\n');
      } else {
        await sendKey(char);
      }

      const delay = getTypingDelay(char);
      await sleep(delay);

      if ((i + 1) % 100 === 0 || i === targetText.length - 1) {
        const progress = ((i + 1) / totalChars * 100).toFixed(1);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`%c📊 ${progress}% • ${i + 1}/${totalChars} chars • ${elapsed}s`, 'color: #00bcd4;');
      }
    }

    // ═══════════════════════════════════════════════════════════════════
    // STATISTIQUES FINALES
    // ═══════════════════════════════════════════════════════════════════

    const totalTime = (Date.now() - startTime) / 1000;
    const actualWPM = Math.round((totalChars / 5) / (totalTime / 60));
    const compensation = BASE_PENALTY + (NUM_ERRORS * ERROR_PENALTY_FACTOR);
    const expectedSiteWPM = Math.round(actualWPM / compensation);

    console.log('%c✅ Frappe terminée avec succès!', 'color: #00ff41; font-size: 16px; font-weight: bold; text-shadow: 0 0 5px #00ff41;');
    console.log(`%c📈 Stats : ${actualWPM} WPM réels • ${totalTime.toFixed(1)}s • ${NUM_ERRORS} erreur(s)`, 'color: #ffeb3b; font-weight: bold; font-size: 13px;');
    console.log(`%c🎯 WPM attendu sur le site : ~${expectedSiteWPM} WPM`, 'color: #00d4ff; font-weight: bold;');

  } catch (error) {
    console.error('%c❌ Erreur critique du bot:', 'color: #f44336; font-weight: bold;', error);
    console.error(error.stack);
  } finally {
    window.BOT_IS_RUNNING = false;
    console.log('%c🔓 Bot déverrouillé et prêt', 'color: #9c27b0; font-weight: bold;');
  }

})();