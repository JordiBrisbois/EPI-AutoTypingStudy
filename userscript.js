// ==UserScript==
// @name         TypingStudy Auto-Bot
// @namespace    http://tampermonkey.net/
// @version      2.1.1
// @description  Bot intelligent pour TypingStudy avec mode auto, kill switch et simulation humaine
// @author       Jordi Brisbois
// @match        https://typingstudy.com/*
// @match        https://www.typingstudy.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // ═══════════════════════════════════════════════════════════════════════
    // CONFIGURATION UTILISATEUR
    // ═══════════════════════════════════════════════════════════════════════

    const CONFIG = {
        // Intervalle de WPM (choisi aléatoirement au début de chaque leçon)
        MIN_WPM: 61,
        MAX_WPM: 68,

        // Sources d'erreurs (0 = pas d'erreur, 1 = 1 erreur, etc.)
        // Le bot choisira une valeur au hasard dans cette liste
        ERROR_RATES: [0, 1, 2],

        // Délai avant de passer à la leçon suivante (en ms)
        AUTO_NAV_DELAY: 4000, // 4 secondes pour pouvoir utiliser le Kill Switch

        // Raccourci pour démarrer (Alt + S)
        START_KEY: 's'
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTES ET OPTIMISATIONS
    // ═══════════════════════════════════════════════════════════════════════

    // Définition des objets de proximité hors de la boucle pour performance
    const KEYBOARD_PROXIMITY = {
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

    const DIGIT_PROXIMITY = {
        '0': ['9', 'p'], '1': ['2', 'q'], '2': ['1', '3', 'w'],
        '3': ['2', '4', 'e'], '4': ['3', '5', 'r'], '5': ['4', '6', 't'],
        '6': ['5', '7', 'y'], '7': ['6', '8', 'u'], '8': ['7', '9', 'i'],
        '9': ['8', '0', 'o']
    };

    const SIMILAR_CHARS = ['a', 'e', 'i', 'o', 'u', 's', 't', 'n'];

    // Variables d'état
    let stopRequested = false;
    let botRunning = false;
    let navigationTimeout = null;

    // ═══════════════════════════════════════════════════════════════════════
    // GESTION DU KILL SWITCH ET DES ÉVÉNEMENTS
    // ═══════════════════════════════════════════════════════════════════════

    document.addEventListener('keydown', (e) => {
        // Kill Switch: ESCAPE
        if (e.key === 'Escape') {
            stopRequested = true;
            botRunning = false;
            sessionStorage.removeItem('BOT_AUTO_ACTIVE'); // Désactive le mode auto

            // Annulation de toute navigation prévue
            if (navigationTimeout) {
                clearTimeout(navigationTimeout);
                navigationTimeout = null;
                console.log('%c🚫 Navigation annulée par Kill Switch !', 'color: red; font-weight: bold;');
            }

            console.log('%c🛑 ARRÊT D\'URGENCE DEMANDÉ (KILL SWITCH) 🛑', 'color: white; background: red; font-size: 20px; padding: 10px;');
        }

        // Démarrage manuel: Alt + S
        if (e.altKey && e.key === CONFIG.START_KEY) {
            if (!botRunning) {
                console.log("Démarrage manuel...");
                sessionStorage.setItem('BOT_AUTO_ACTIVE', 'true'); // Active le mode auto
                startBot();
            }
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // LOGIQUE "AUTO MODE" ET NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════

    window.addEventListener('load', () => {
        // Vérifier si un message de fin de leçon est présent
        const lessonComplete = isLessonComplete();
        const autoActive = sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true';

        if (lessonComplete) {
            if (autoActive) {
                console.log(`%c🏁 Leçon terminée. Passage à la suivante dans ${CONFIG.AUTO_NAV_DELAY / 1000}s... (Appuyez sur Echap pour annuler)`, 'color: #ff9800; font-weight: bold;');

                // On stocke l'ID du timeout pour pouvoir l'annuler
                navigationTimeout = setTimeout(() => {
                    if (!stopRequested && sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true') {
                        goToNextLesson();
                    } else {
                        console.log("Navigation annulée.");
                    }
                }, CONFIG.AUTO_NAV_DELAY);
            }
            return;
        }

        // Si on n'est pas à la fin et que le mode auto est actif, on lance le bot après un court délai
        if (autoActive && document.getElementById('type')) {
            console.log("Mode Auto détecté : Démarrage du bot dans 2 secondes...");
            setTimeout(() => {
                if (!stopRequested) startBot();
            }, 2000);
        } else {
            console.log("%c🤖 Bot prêt. Appuyez sur Alt + S pour démarrer.", 'color: #00bcd4');
        }
    });

    function isLessonComplete() {
        const bodyText = document.body.innerText;
        return bodyText.includes('Lesson part complete') ||
            bodyText.includes('Partie leçon terminée') ||
            bodyText.includes('Leçon terminée');
    }

    function goToNextLesson() {
        // Cherche le lien "Next" ou "Suivante" ou le lien dans le conteneur de message
        // Stratégie 1: Chercher un lien dans le div qui contient le texte de succès
        const links = Array.from(document.querySelectorAll('a'));

        let nextLink = links.find(el => {
            const text = el.innerText.toLowerCase();
            return text.includes('click here') ||
                text.includes('cliquez ici') ||
                text.includes('next lesson') ||
                text.includes('leçon suivante');
        });

        if (nextLink) {
            console.log("Lien suivant trouvé : ", nextLink.href);
            nextLink.click();
        } else {
            console.log("❌ Impossible de trouver le lien vers la leçon suivante.");
            sessionStorage.removeItem('BOT_AUTO_ACTIVE'); // Sécurité
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MOTEUR DU BOT (COPIÉ ET OPTIMISÉ)
    // ═══════════════════════════════════════════════════════════════════════

    async function startBot() {
        if (botRunning) return;
        botRunning = true;
        stopRequested = false;

        // Configuration aléatoire pour cette session
        const DESIRED_WPM = Math.floor(Math.random() * (CONFIG.MAX_WPM - CONFIG.MIN_WPM + 1)) + CONFIG.MIN_WPM;
        const NUM_ERRORS = CONFIG.ERROR_RATES[Math.floor(Math.random() * CONFIG.ERROR_RATES.length)];

        // Constantes physiques
        const BASE_PENALTY = 1.23;
        const ERROR_PENALTY_FACTOR = 0.015;
        const totalCompensation = BASE_PENALTY + (NUM_ERRORS * ERROR_PENALTY_FACTOR);
        const TARGET_WPM = Math.round(DESIRED_WPM * totalCompensation);

        console.log(`%c🚀 DÉMARRAGE BOT (Session Tampermonkey)`, 'color: #00ff41; font-size: 16px; font-weight: bold;');
        console.log(`%c⚙️  Cible : ${DESIRED_WPM} WPM (Interne: ${TARGET_WPM}) | Erreurs : ${NUM_ERRORS}`, 'color: #00d4ff');

        const inputArea = document.getElementById('type');
        const hiddenInput = document.getElementById('type_text');

        if (!inputArea || !hiddenInput) {
            console.error('Champs de saisie introuvables.');
            botRunning = false;
            return;
        }

        const targetText = hiddenInput.value.replace(/\\n/g, '\n').replace(/¶/g, ' ');
        const totalChars = targetText.length;
        const startTime = Date.now();

        // Génération des erreurs
        const errorIndices = new Set();
        const SAFE_ZONE = 10;
        if (NUM_ERRORS > 0 && totalChars > SAFE_ZONE * 2) {
            while (errorIndices.size < NUM_ERRORS) {
                const idx = Math.floor(Math.random() * (totalChars - SAFE_ZONE * 2)) + SAFE_ZONE;
                if (targetText[idx] !== ' ' && targetText[idx] !== '\n') {
                    errorIndices.add(idx);
                }
            }
        }

        inputArea.focus();
        inputArea.value = '';
        await sleep(100);

        // Boucle de frappe
        for (let i = 0; i < targetText.length; i++) {
            if (stopRequested) {
                console.log("🚫 Boucle de frappe interrompue.");
                break;
            }

            const char = targetText[i];

            if (errorIndices.has(i)) {
                // Simulation d'erreur
                let wrongChar = getWrongChar(char);
                console.log(`%c❌ Erreur simulée : '${char}' → '${wrongChar}'`, 'color: orange');

                await sendKey(inputArea, wrongChar === '\n' ? 'Enter' : wrongChar);
                await sleep(getTypingDelay(wrongChar, TARGET_WPM));

                // Pas de correction (selon demande), on continue
                // Note: Si le site bloque quand c'est faux, le bot continuera quand même 
                // mais le texte sera décalé. Le script original ne gérait pas le "blocage".
            } else {
                await sendKey(inputArea, char === '\n' ? 'Enter' : char);
            }

            await sleep(getTypingDelay(char, TARGET_WPM));
        }

        botRunning = false;
        if (!stopRequested) {
            console.log("✅ Frappe terminée.");
            // La détection de fin de leçon (listener 'load') se chargera de la suite
            // ou on peut mettre un timeout ici pour vérifier l'apparition du lien
            waitForNextLink();
        }
    }

    async function waitForNextLink() {
        // On attend que le message de fin apparaisse sans recharger la page
        // (Certains sites font de l'AJAX au lieu de recharger)
        let attempts = 0;
        const checkInterval = setInterval(() => {
            if (stopRequested) {
                clearInterval(checkInterval);
                return;
            }
            if (isLessonComplete()) {
                clearInterval(checkInterval);
                const autoActive = sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true';
                if (autoActive) {
                    console.log(`%c🏁 Leçon terminée (AJAX). Suivante dans ${CONFIG.AUTO_NAV_DELAY / 1000}s...`, 'color: #ff9800');

                    if (navigationTimeout) clearTimeout(navigationTimeout);
                    navigationTimeout = setTimeout(() => {
                        if (!stopRequested && sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true') {
                            goToNextLesson();
                        }
                    }, CONFIG.AUTO_NAV_DELAY);
                }
            }
            attempts++;
            if (attempts > 20) clearInterval(checkInterval); // Arrêt après 10s
        }, 500);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITAIRES
    // ═══════════════════════════════════════════════════════════════════════

    function getWrongChar(char) {
        if (/[a-z]/i.test(char)) {
            const lower = char.toLowerCase();
            const prox = KEYBOARD_PROXIMITY[lower] || SIMILAR_CHARS;
            let wrong = prox[Math.floor(Math.random() * prox.length)];
            return char === char.toUpperCase() ? wrong.toUpperCase() : wrong;
        } else if (/[0-9]/.test(char)) {
            const prox = DIGIT_PROXIMITY[char] || ['1', '2'];
            return prox[Math.floor(Math.random() * prox.length)];
        }
        return SIMILAR_CHARS[Math.floor(Math.random() * SIMILAR_CHARS.length)];
    }

    function getTypingDelay(char, targetWpm) {
        const baseDelayMs = 60000 / (targetWpm * 5);
        let delay = Math.abs(randomNormal(baseDelayMs, baseDelayMs * 0.15));
        if (/[A-Z]/.test(char) || char === ' ') delay += Math.abs(randomNormal(5, 2));
        return Math.max(delay, 10);
    }

    function randomNormal(mean, stdDev) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return mean + (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) * stdDev;
    }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    async function sendKey(element, char) {
        // Mapping simplifié pour la simulation
        let key = char;
        let code = 'Key' + char.toUpperCase();
        let keyCode = char.charCodeAt(0);

        if (char === 'Enter') { key = 'Enter'; code = 'Enter'; keyCode = 13; }
        if (char === ' ') { key = ' '; code = 'Space'; keyCode = 32; }

        const eventObj = { key, code, keyCode, which: keyCode, bubbles: true, cancelable: true, view: window };

        element.dispatchEvent(new KeyboardEvent('keydown', eventObj));
        element.dispatchEvent(new KeyboardEvent('keypress', { ...eventObj, charCode: keyCode }));

        // Input event
        let inputType = 'insertText';
        let data = char;
        if (key === 'Enter') { inputType = 'insertLineBreak'; data = null; }

        element.dispatchEvent(new InputEvent('input', { inputType, data, bubbles: true, cancelable: true }));
        element.dispatchEvent(new KeyboardEvent('keyup', eventObj));
    }

})();