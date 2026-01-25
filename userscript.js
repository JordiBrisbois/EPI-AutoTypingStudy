// ==UserScript==
// @name         TypingStudy Auto-Bot v2.3
// @namespace    http://tampermonkey.net/
// @version      2.3.0
// @description  Bot intelligent pour TypingStudy avec UI, Stats, Mode Auto et Kill Switch
// @author       Jordi Brisbois
// @match        https://*.typingstudy.com/*/lesson/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/userscript.user.js
// @downloadURL  https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/userscript.user.js
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
        ERROR_RATES: [0, 1, 2],

        // Délai avant de passer à la leçon suivante (en ms)
        AUTO_NAV_DELAY: 4000,

        // Raccourcis clavier
        START_KEY: 's',        // Alt + S : Démarrer
        TOGGLE_AUTO_KEY: 'a',  // Alt + A : Toggle mode auto

        // Interface utilisateur
        SHOW_UI: true,         // Afficher le bouton de contrôle
        DEBUG_MODE: false,     // Logs détaillés (false en production)

        // Calibration (compensation WPM du site)
        BASE_PENALTY: 1.23,
        ERROR_PENALTY_FACTOR: 0.015
    };

    // ═══════════════════════════════════════════════════════════════════════
    // SYSTÈME DE LOGS
    // ═══════════════════════════════════════════════════════════════════════

    const Logger = {
        info: (msg, style = 'color: #00bcd4;') => console.log(`%c${msg}`, style),
        success: (msg) => console.log(`%c✅ ${msg}`, 'color: #4caf50; font-weight: bold;'),
        warn: (msg) => console.log(`%c⚠️ ${msg}`, 'color: #ff9800; font-weight: bold;'),
        error: (msg) => console.log(`%c❌ ${msg}`, 'color: #f44336; font-weight: bold;'),
        debug: (msg) => CONFIG.DEBUG_MODE && console.log(`%c🔍 ${msg}`, 'color: #9c27b0;'),
        stats: (msg) => console.log(`%c📊 ${msg}`, 'color: #ffeb3b; font-weight: bold;')
    };

    // ═══════════════════════════════════════════════════════════════════════
    // CONSTANTES DE PROXIMITÉ CLAVIER (optimisées)
    // ═══════════════════════════════════════════════════════════════════════

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

    // ═══════════════════════════════════════════════════════════════════════
    // VARIABLES D'ÉTAT GLOBALES
    // ═══════════════════════════════════════════════════════════════════════

    let stopRequested = false;
    let botRunning = false;
    let navigationTimeout = null;
    let uiButton = null;

    // ═══════════════════════════════════════════════════════════════════════
    // SYSTÈME DE STATISTIQUES
    // ═══════════════════════════════════════════════════════════════════════

    const Stats = {
        get: () => {
            try {
                return JSON.parse(sessionStorage.getItem('bot_stats') || '{"exercises":0,"totalTime":0,"totalChars":0}');
            } catch {
                return { exercises: 0, totalTime: 0, totalChars: 0 };
            }
        },
        save: (stats) => {
            sessionStorage.setItem('bot_stats', JSON.stringify(stats));
        },
        increment: (time, chars) => {
            const current = Stats.get();
            Stats.save({
                exercises: current.exercises + 1,
                totalTime: current.totalTime + time,
                totalChars: current.totalChars + chars
            });
        },
        display: () => {
            const stats = Stats.get();
            if (stats.exercises > 0) {
                const avgTime = (stats.totalTime / stats.exercises / 1000).toFixed(1);
                const avgWPM = Math.round((stats.totalChars / 5) / (stats.totalTime / 60000));
                Logger.stats(`Session : ${stats.exercises} exercices • Temps moyen : ${avgTime}s • WPM moyen : ${avgWPM}`);
            }
        },
        reset: () => {
            sessionStorage.removeItem('bot_stats');
            Logger.info('Statistiques réinitialisées');
        }
    };

    function goToNextLesson() {
        const links = Array.from(document.querySelectorAll('a'));

        const nextLink = links.find(el => {
            const text = el.innerText.toLowerCase();
            return (text.includes('click here') || text.includes('cliquez ici')) &&
                el.href.includes('/lesson/');
        });

        if (nextLink) {
            Logger.success(`Navigation vers : ${nextLink.href}`);
            nextLink.click();
        } else {
            Logger.error('Lien vers la leçon suivante introuvable');
            sessionStorage.removeItem('BOT_AUTO_ACTIVE');
            updateUIButton();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INTERFACE UTILISATEUR (UI)
    // ═══════════════════════════════════════════════════════════════════════

    function createUI() {
        if (!CONFIG.SHOW_UI || uiButton) return;

        // Trouver et vider le conteneur des boutons sociaux
        const socialIcons = document.getElementById('social-icons');

        let container;
        if (socialIcons) {
            // Remplacer les icônes sociales par notre interface
            socialIcons.innerHTML = '';
            container = socialIcons;
            container.style.cssText = `
                display: flex;
                gap: 5px;
                align-items: center;
            `;
        } else {
            // Fallback : créer notre propre conteneur si social-icons n'existe pas
            container = document.createElement('div');
            container.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                z-index: 99999;
                display: flex;
                gap: 5px;
                font-family: Arial, sans-serif;
            `;
            document.body.appendChild(container);
        }

        // Style commun pour tous les boutons
        const buttonStyle = `
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 50%;
            font-size: 16px;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
        `;

        // Bouton Auto Toggle
        uiButton = document.createElement('button');
        uiButton.textContent = '🤖';
        uiButton.style.cssText = buttonStyle;
        updateUIButton();
        uiButton.onclick = toggleAutoMode;
        uiButton.onmouseenter = function () {
            this.style.transform = 'scale(1.1)';
            const isActive = sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true';
            this.title = isActive ? 'Mode Auto: ON\n(Clic ou Alt+A pour désactiver)' : 'Mode Auto: OFF\n(Clic ou Alt+A pour activer)';
        };
        uiButton.onmouseleave = function () {
            this.style.transform = 'scale(1)';
        };
        container.appendChild(uiButton);

        // Bouton Stats
        const statsBtn = document.createElement('button');
        statsBtn.textContent = '📊';
        statsBtn.style.cssText = buttonStyle + 'background: #9c27b0; color: white;';
        statsBtn.title = 'Statistiques de session\n(Cliquez pour voir)';
        statsBtn.onclick = showStatsModal;
        statsBtn.onmouseenter = function () {
            this.style.transform = 'scale(1.1)';
            this.style.background = '#7b1fa2';
        };
        statsBtn.onmouseleave = function () {
            this.style.transform = 'scale(1)';
            this.style.background = '#9c27b0';
        };
        container.appendChild(statsBtn);

        // Bouton Aide
        const helpBtn = document.createElement('button');
        helpBtn.textContent = '❓';
        helpBtn.style.cssText = buttonStyle + 'background: #2196f3; color: white;';
        helpBtn.title = 'Alt+A: Toggle Auto (démarre + auto)\nAlt+S: Start (1 fois seulement)\nESC: Arrêt total\n\n(Cliquez pour plus d\'infos)';
        helpBtn.onclick = showHelpModal;
        helpBtn.onmouseenter = function () {
            this.style.transform = 'scale(1.1)';
            this.style.background = '#1976d2';
        };
        helpBtn.onmouseleave = function () {
            this.style.transform = 'scale(1)';
            this.style.background = '#2196f3';
        };
        container.appendChild(helpBtn);
    }

    function updateUIButton() {
        if (!uiButton) return;
        const isActive = sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true';
        uiButton.style.background = isActive ? '#4caf50' : '#f44336';
        uiButton.style.color = 'white';
    }

    function showStatsModal() {
        const stats = Stats.get();

        // Créer la modal
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
            z-index: 999999;
            min-width: 300px;
            font-family: Arial, sans-serif;
        `;

        if (stats.exercises === 0) {
            modal.innerHTML = `
                <h2 style="margin: 0 0 15px 0; color: #333;">📊 Statistiques</h2>
                <p style="color: #666;">Aucune donnée pour le moment.</p>
                <p style="color: #999; font-size: 12px;">Complétez des exercices pour voir vos stats !</p>
                <button id="closeStatsBtn" style="margin-top: 15px; padding: 10px 20px; background: #2196f3; color: white; border: none; border-radius: 5px; cursor: pointer;">Fermer</button>
            `;
        } else {
            const avgTime = (stats.totalTime / stats.exercises / 1000).toFixed(1);
            const avgWPM = Math.round((stats.totalChars / 5) / (stats.totalTime / 60000));
            const totalMinutes = (stats.totalTime / 60000).toFixed(1);

            modal.innerHTML = `
                <h2 style="margin: 0 0 20px 0; color: #333; text-align: center;">📊 Statistiques de Session</h2>
                
                <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #666;">🎯 Exercices complétés :</span>
                        <strong style="color: #2196f3; font-size: 18px;">${stats.exercises}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #666;">⚡ WPM moyen :</span>
                        <strong style="color: #4caf50; font-size: 18px;">${avgWPM}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: #666;">⏱️ Temps moyen/exercice :</span>
                        <strong style="color: #ff9800; font-size: 18px;">${avgTime}s</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #666;">🕐 Temps total :</span>
                        <strong style="color: #9c27b0; font-size: 18px;">${totalMinutes} min</strong>
                    </div>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button id="closeStatsBtn" style="flex: 1; padding: 10px; background: #2196f3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Fermer</button>
                    <button id="resetStatsBtn" style="flex: 1; padding: 10px; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Réinitialiser</button>
                </div>
            `;
        }

        // Overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999998;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        // Event listeners
        const closeBtn = document.getElementById('closeStatsBtn');
        const resetBtn = document.getElementById('resetStatsBtn');

        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };

        closeBtn.onclick = closeModal;
        overlay.onclick = closeModal;

        if (resetBtn) {
            resetBtn.onclick = () => {
                if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les statistiques ?')) {
                    Stats.reset();
                    closeModal();
                    showStatsModal(); // Réafficher avec stats à 0
                }
            };
        }
    }

    function showHelpModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
            z-index: 999999;
            max-width: 500px;
            font-family: Arial, sans-serif;
        `;

        modal.innerHTML = `
            <h2 style="margin: 0 0 20px 0; color: #333;">❓ Guide d'Utilisation</h2>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #2196f3;">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">🔄 Mode Auto (Alt+A ou bouton)</h3>
                <ul style="margin: 5px 0; padding-left: 20px; color: #333;">
                    <li><strong>Active le mode automatique</strong></li>
                    <li>Démarre l'exercice en cours</li>
                    <li>Passe automatiquement à l'exercice suivant</li>
                    <li>Continue jusqu'à ce que vous l'arrêtiez (ESC)</li>
                </ul>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">💡 Parfait pour enchaîner plusieurs leçons sans intervention</p>
            </div>
            
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ff9800;">
                <h3 style="margin: 0 0 10px 0; color: #f57c00;">⚡ Démarrage Simple (Alt+S)</h3>
                <ul style="margin: 5px 0; padding-left: 20px; color: #333;">
                    <li><strong>Démarre UNIQUEMENT l'exercice actuel</strong></li>
                    <li>N'active PAS le mode auto</li>
                    <li>S'arrête à la fin de cet exercice</li>
                </ul>
                <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">💡 Parfait pour faire un seul exercice rapidement</p>
            </div>
            
            <div style="background: #ffebee; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f44336;">
                <h3 style="margin: 0 0 10px 0; color: #d32f2f;">🛑 Kill Switch (ESC)</h3>
                <ul style="margin: 5px 0; padding-left: 20px; color: #333;">
                    <li>Arrête immédiatement la frappe</li>
                    <li>Désactive le mode auto</li>
                    <li>Annule la navigation vers l'exercice suivant</li>
                </ul>
            </div>
            
            <button id="closeHelpBtn" style="width: 100%; padding: 12px; background: #2196f3; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 14px;">Compris !</button>
        `;

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999998;
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);

        const closeModal = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
        };

        document.getElementById('closeHelpBtn').onclick = closeModal;
        overlay.onclick = closeModal;
    }

    function toggleAutoMode() {
        const isActive = sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true';
        if (isActive) {
            sessionStorage.removeItem('BOT_AUTO_ACTIVE');
            Logger.info('Mode Auto désactivé');
            if (navigationTimeout) {
                clearTimeout(navigationTimeout);
                navigationTimeout = null;
            }
        } else {
            sessionStorage.setItem('BOT_AUTO_ACTIVE', 'true');
            Logger.success('Mode Auto activé');
            if (!botRunning && document.getElementById('type')) {
                startBot();
            }
        }
        updateUIButton();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // GESTION DES ÉVÉNEMENTS CLAVIER
    // ═══════════════════════════════════════════════════════════════════════

    document.addEventListener('keydown', (e) => {
        // Kill Switch: ESCAPE
        if (e.key === 'Escape') {
            stopRequested = true;
            botRunning = false;
            sessionStorage.removeItem('BOT_AUTO_ACTIVE');

            if (navigationTimeout) {
                clearTimeout(navigationTimeout);
                navigationTimeout = null;
                Logger.warn('Navigation annulée par Kill Switch');
            }

            Logger.error('Kill Switch activé : Arrêt complet du bot');
            updateUIButton();
        }

        // Démarrage manuel: Alt + S
        if (e.altKey && e.key === CONFIG.START_KEY) {
            if (!botRunning) {
                Logger.info('Démarrage manuel (Alt+S)');
                sessionStorage.removeItem('BOT_AUTO_ACTIVE'); // S'assure de NE PAS être en mode auto
                updateUIButton();
                startBot();
            }
        }

        // Toggle Auto: Alt + A
        if (e.altKey && e.key === CONFIG.TOGGLE_AUTO_KEY) {
            e.preventDefault();
            toggleAutoMode();
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // DÉTECTION ET NAVIGATION AUTOMATIQUE
    // ═══════════════════════════════════════════════════════════════════════

    window.addEventListener('load', () => {
        createUI();

        // Check immédiat au chargement + observation
        const lessonComplete = checkLessonComplete();
        const autoActive = sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true';

        // Si la leçon est déjà finie au chargement (rare mais possible via cache/back)
        if (lessonComplete) return;

        // Sinon on lance l'observateur pour la fin à venir
        waitForNextLink();

        if (autoActive && document.getElementById('type')) {
            Logger.info('Mode Auto détecté : Démarrage dans 2s...');
            setTimeout(() => {
                if (!stopRequested) startBot();
            }, 2000);
        } else {
            Logger.info('Bot prêt. Appuyez sur Alt+S pour démarrer ou Alt+A pour activer le mode auto.');
        }
    });

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITAIRES & REGEX (Optimisé)
    // ═══════════════════════════════════════════════════════════════════════

    const REGEX_LOWER = /[a-z]/i;
    const REGEX_UPPER = /[A-Z]/;
    const REGEX_DIGIT = /[0-9]/;

    function getWrongChar(char) {
        if (REGEX_LOWER.test(char)) {
            const lower = char.toLowerCase();
            const prox = KEYBOARD_PROXIMITY[lower] || SIMILAR_CHARS;
            let wrong = prox[Math.floor(Math.random() * prox.length)];
            return char === char.toUpperCase() ? wrong.toUpperCase() : wrong;
        } else if (REGEX_DIGIT.test(char)) {
            const prox = DIGIT_PROXIMITY[char] || ['1', '2'];
            return prox[Math.floor(Math.random() * prox.length)];
        }
        return SIMILAR_CHARS[Math.floor(Math.random() * SIMILAR_CHARS.length)];
    }

    function getTypingDelay(char, targetWpm) {
        const baseDelayMs = 60000 / (targetWpm * 5);
        let delay = Math.abs(randomNormal(baseDelayMs, baseDelayMs * 0.15));
        if (REGEX_UPPER.test(char) || char === ' ') {
            delay += Math.abs(randomNormal(5, 2));
        }
        return Math.max(delay, 10);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DÉTECTION FINE (MutationObserver)
    // ═══════════════════════════════════════════════════════════════════════

    function waitForNextLink() {
        Logger.info('Observation de la fin de leçon...');

        // 1. Check immédiat
        if (checkLessonComplete()) return;

        // 2. Observer pour changements futurs
        const observer = new MutationObserver((mutations, obs) => {
            if (checkLessonComplete()) {
                obs.disconnect(); // On arrête d'observer une fois trouvé
            }
            if (stopRequested) obs.disconnect();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Sécurité : Arrêt auto de l'observer après 20s
        setTimeout(() => observer.disconnect(), 20000);
    }

    function checkLessonComplete() {
        // Recherche ciblée sur les messages de succès (beaucoup plus léger que innerText global)
        // On cherche des div/p qui pourraient contenir le message
        const candidates = document.querySelectorAll('div, p, span, h2, h3');

        for (const el of candidates) {
            // Optimisation : on ne lit textContent que si l'élément est visiblement court
            if (el.childNodes.length > 5) continue;

            const txt = el.textContent || '';
            if ((txt.includes('Lesson part complete') ||
                txt.includes('Partie leçon terminée') ||
                (txt.includes('Click here') && txt.includes('lesson'))) &&
                el.offsetParent !== null // Vérifie visibilité
            ) {
                handleLessonComplete();
                return true;
            }
        }
        return false;
    }

    function handleLessonComplete() {
        const autoActive = sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true';
        if (autoActive) {
            Logger.warn(`Leçon terminée. Navigation dans ${CONFIG.AUTO_NAV_DELAY / 1000}s...`);
            if (navigationTimeout) clearTimeout(navigationTimeout);
            navigationTimeout = setTimeout(() => {
                if (!stopRequested && sessionStorage.getItem('BOT_AUTO_ACTIVE') === 'true') {
                    goToNextLesson();
                }
            }, CONFIG.AUTO_NAV_DELAY);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MOTEUR DU BOT (OPTIMISÉ)
    // ═══════════════════════════════════════════════════════════════════════

    async function startBot() {
        if (botRunning) return;
        botRunning = true;
        stopRequested = false;

        const DESIRED_WPM = Math.floor(Math.random() * (CONFIG.MAX_WPM - CONFIG.MIN_WPM + 1)) + CONFIG.MIN_WPM;
        const NUM_ERRORS = CONFIG.ERROR_RATES[Math.floor(Math.random() * CONFIG.ERROR_RATES.length)];

        const totalCompensation = CONFIG.BASE_PENALTY + (NUM_ERRORS * CONFIG.ERROR_PENALTY_FACTOR);
        const TARGET_WPM = Math.round(DESIRED_WPM * totalCompensation);

        Logger.info(`🚀 DÉMARRAGE : ${DESIRED_WPM} WPM visé → ${TARGET_WPM} WPM interne | ${NUM_ERRORS} erreur(s)`, 'color: #00ff41; font-size: 14px; font-weight: bold;');

        const inputArea = document.getElementById('type');
        const hiddenInput = document.getElementById('type_text');

        if (!inputArea || !hiddenInput) {
            Logger.error('Champs de saisie introuvables');
            botRunning = false;
            return;
        }

        const targetText = hiddenInput.value.replace(/\\n/g, '\n').replace(/¶/g, ' ');
        const totalChars = targetText.length;
        const startTime = Date.now();

        Logger.debug(`Texte : ${totalChars} caractères`);

        // Génération des positions d'erreurs
        const errorIndices = new Set();
        const SAFE_ZONE = 10;
        if (NUM_ERRORS > 0 && totalChars > SAFE_ZONE * 2) {
            while (errorIndices.size < NUM_ERRORS) {
                const idx = Math.floor(Math.random() * (totalChars - SAFE_ZONE * 2)) + SAFE_ZONE;
                if (targetText[idx] !== ' ' && targetText[idx] !== '\n') {
                    errorIndices.add(idx);
                }
            }
            Logger.debug(`Positions d'erreurs : [${Array.from(errorIndices).sort((a, b) => a - b).join(', ')}]`);
        }

        inputArea.focus();
        inputArea.value = '';
        await sleep(100);

        // Boucle de frappe
        for (let i = 0; i < targetText.length; i++) {
            if (stopRequested) {
                Logger.warn('Frappe interrompue par l\'utilisateur');
                break;
            }

            const char = targetText[i];

            if (errorIndices.has(i)) {
                const wrongChar = getWrongChar(char);
                Logger.debug(`Erreur : '${char}' → '${wrongChar}'`);

                await sendKey(inputArea, wrongChar === '\n' ? 'Enter' : wrongChar);
                await sleep(getTypingDelay(wrongChar, TARGET_WPM));
                continue; // Pas de correction
            }

            await sendKey(inputArea, char === '\n' ? 'Enter' : char);
            await sleep(getTypingDelay(char, TARGET_WPM));
        }

        botRunning = false;

        if (!stopRequested) {
            const totalTime = Date.now() - startTime;
            const actualWPM = Math.round((totalChars / 5) / (totalTime / 60000));
            const expectedSiteWPM = Math.round(actualWPM / totalCompensation);

            Stats.increment(totalTime, totalChars);

            Logger.success('Frappe terminée !');
            Logger.stats(`${actualWPM} WPM réels • ${(totalTime / 1000).toFixed(1)}s • ~${expectedSiteWPM} WPM attendu sur le site`);

            waitForNextLink();
        }
    }

    function randomNormal(mean, stdDev) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return mean + (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) * stdDev;
    }

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    async function sendKey(element, char) {
        let key = char;
        let code = 'Key' + char.toUpperCase();
        let keyCode = char.charCodeAt(0);

        if (char === 'Enter') { key = 'Enter'; code = 'Enter'; keyCode = 13; }
        if (char === ' ') { key = ' '; code = 'Space'; keyCode = 32; }

        const eventObj = {
            key, code, keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            view: window
        };

        element.dispatchEvent(new KeyboardEvent('keydown', eventObj));
        element.dispatchEvent(new KeyboardEvent('keypress', { ...eventObj, charCode: keyCode }));

        let inputType = 'insertText';
        let data = char;
        if (key === 'Enter') { inputType = 'insertLineBreak'; data = null; }

        element.dispatchEvent(new InputEvent('input', {
            inputType, data,
            bubbles: true,
            cancelable: true
        }));

        element.dispatchEvent(new KeyboardEvent('keyup', eventObj));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALISATION
    // ═══════════════════════════════════════════════════════════════════════

    Logger.info('🤖 TypingStudy Auto-Bot v2.3 chargé');
    Logger.debug('Configuration : ' + JSON.stringify(CONFIG));

})();