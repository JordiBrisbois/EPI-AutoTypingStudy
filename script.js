(async () => {

    if (window.BOT_IS_RUNNING) {
        console.error("%c[BOT] Erreur : Un bot est déjà en cours d'exécution !", "color: red; font-weight: bold;");
        return;
    }
    window.BOT_IS_RUNNING = true;

    try {
        // === CONFIGURATION ===
        // Vitesse de frappe visée en Mots Par Minute (WPM).
        // Une vitesse de 60-70 est moyenne/bonne. Pour des textes complexes (beaucoup de symboles, x, z...), réduisez cette valeur.
        const TARGET_WPM = window.BOT_WPM || 60;

        // Nombre d'erreurs autorisées pour l'exercice entier.
        // Peut être un nombre fixe (ex: 3) ou un tableau [0, 1] pour varier aléatoirement.
        const errorSource = (typeof window.BOT_ERRORS !== 'undefined') ? window.BOT_ERRORS : [0, 1, 2, 3];

        const totalErrorsNeeded = Array.isArray(errorSource)
            ? errorSource[Math.floor(Math.random() * errorSource.length)]
            : errorSource;

        const inputArea = document.getElementById('type');
        const hiddenInput = document.getElementById('type_text');

        if (!inputArea || !hiddenInput) {
            window.BOT_IS_RUNNING = false;
            return;
        }


        const targetText = hiddenInput.value.replace(/\\n/g, '\n');
        const totalChars = targetText.length;


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

            await sleep(randomNormal(50, 10));
            inputArea.dispatchEvent(new KeyboardEvent('keyup', { ...opts, key, code, keyCode, which: keyCode }));
        }


        inputArea.focus();
        inputArea.value = "";

        for (let i = 0; i < targetText.length; i++) {
            const char = targetText[i];


            if (errorIndices.has(i)) {
                const wrongChar = "asdfghjkl"[Math.floor(Math.random() * 9)];
                await sendKey(wrongChar);
                console.warn(`[BOT] Erreur simulée : '${wrongChar}'`);
                await sleep(randomNormal(300, 50));
                await sendKey('Backspace');
                await sleep(randomNormal(150, 30));
            }


            if (char === '¶' || char === '\n') {
                await sendKey('Enter');
            } else {
                await sendKey(char);
            }


            const msPerChar = 60000 / (TARGET_WPM * 5);
            let delay = randomNormal(msPerChar - 50, 15);

            if (/[A-Z]/.test(char)) delay += 100;
            if (char === ' ') delay += 30;

            await sleep(Math.max(10, delay));
        }

        console.log("%c[BOT] Terminé !", "color: #00ff00; font-weight: bold;");

    } catch (e) {
        console.error("[BOT] Erreur :", e);
    } finally {
        window.BOT_IS_RUNNING = false;
    }
})();
