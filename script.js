(async () => {
    // --- SÉCURITÉ ANTI-DOUBLE LANCEMENT ---
    if (window.BOT_IS_RUNNING) {
        console.error("%c[BOT] Erreur : Un bot est déjà en cours d'exécution !", "color: red; font-weight: bold;");
        return;
    }
    window.BOT_IS_RUNNING = true;

    try {
        // === CONFIGURATION (Priorité aux variables globales, sinon Valeurs par Défaut) ===
        const TARGET_WPM = window.BOT_WPM || 60;

        // Définition de la source pour les erreurs (variable passée ou tableau par défaut)
        const errorSource = (typeof window.BOT_ERRORS !== 'undefined') ? window.BOT_ERRORS : [0, 1, 2, 3];
        
        // Calcul du nombre final de fautes pour cet exercice
        const totalErrorsNeeded = Array.isArray(errorSource) 
            ? errorSource[Math.floor(Math.random() * errorSource.length)] 
            : errorSource;

        const inputArea = document.getElementById('type');
        const hiddenInput = document.getElementById('type_text');
        
        if (!inputArea || !hiddenInput) {
            window.BOT_IS_RUNNING = false;
            return;
        }

        // Nettoyage du texte (conversion des \n textuels en vrais sauts de ligne)
        const targetText = hiddenInput.value.replace(/\\n/g, '\n');
        const totalChars = targetText.length;

        // --- PRÉPARATION DES ERREURS ---
        const errorIndices = new Set();
        if (totalErrorsNeeded > 0) {
            while (errorIndices.size < Math.min(totalErrorsNeeded, totalChars - 10)) {
                let randomIndex = Math.floor(Math.random() * (totalChars - 20)) + 10;
                if (targetText[randomIndex] !== ' ' && targetText[randomIndex] !== '¶' && targetText[randomIndex] !== '\n') {
                    errorIndices.add(randomIndex);
                }
            }
        }

        console.log(`%c[BOT] Config : ${TARGET_WPM} WPM | Erreurs : ${totalErrorsNeeded}`, "color: #00d4ff; font-weight: bold;");

        const sleep = (ms) => new Promise(r => setTimeout(r, ms));
        const randomNormal = (mean, stdDev) => {
            let u = 0, v = 0;
            while (u === 0) u = Math.random();
            while (v === 0) v = Math.random();
            return mean + (Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev);
        };

        async function sendKey(char) {
            let key = char;
            let keyCode = (char === 'Enter' || char === '¶' || char === '\n') ? 13 : char.charCodeAt(0);
            let code = (/[a-z]/i.test(char) ? `Key${char.toUpperCase()}` : 'Quote');

            if (char === ' ') { keyCode = 32; code = 'Space'; }
            if (char === 'Enter' || char === '¶' || char === '\n') { key = 'Enter'; keyCode = 13; code = 'Enter'; }
            if (char === 'Backspace') { key = 'Backspace'; keyCode = 8; code = 'Backspace'; }

            const opts = { bubbles: true, cancelable: true, view: window };
            inputArea.dispatchEvent(new KeyboardEvent('keydown', { ...opts, key, code, keyCode, which: keyCode }));

            if (char !== 'Backspace') {
                inputArea.dispatchEvent(new KeyboardEvent('keypress', { ...opts, key, code, keyCode, which: keyCode, charCode: keyCode }));
            }

            let inputType = (key === 'Enter') ? 'insertLineBreak' : (key === 'Backspace' ? 'deleteContentBackward' : 'insertText');
            inputArea.dispatchEvent(new InputEvent('input', { ...opts, data: (key === 'Enter' || key === 'Backspace') ? null : char, inputType }));

            await sleep(randomNormal(50, 10)); // Temps de pression de touche
            inputArea.dispatchEvent(new KeyboardEvent('keyup', { ...opts, key, code, keyCode, which: keyCode }));
        }

        // --- EXÉCUTION ---
        inputArea.focus();
        inputArea.value = "";

        for (let i = 0; i < targetText.length; i++) {
            const char = targetText[i];

            // Simulation d'une erreur
            if (errorIndices.has(i)) {
                const wrongChar = "asdfghjkl"[Math.floor(Math.random() * 9)];
                await sendKey(wrongChar);
                console.warn(`[BOT] Erreur simulée : '${wrongChar}'`);
                await sleep(randomNormal(300, 50));
                await sendKey('Backspace');
                await sleep(randomNormal(150, 30));
            }

            // Frappe du caractère correct
            if (char === '¶' || char === '\n') {
                await sendKey('Enter');
            } else {
                await sendKey(char);
            }

            // Calcul du délai entre les touches
            const msPerChar = 60000 / (TARGET_WPM * 5);
            let delay = randomNormal(msPerChar - 50, 15);

            if (/[A-Z]/.test(char)) delay += 100; // Ralentissement pour les majuscules
            if (char === ' ') delay += 30;         // Petit temps mort sur l'espace

            await sleep(Math.max(10, delay));
        }

        console.log("%c[BOT] Terminé !", "color: #00ff00; font-weight: bold;");

    } catch (e) {
        console.error("[BOT] Erreur :", e);
    } finally {
        window.BOT_IS_RUNNING = false;
    }
})();
