(async () => {
    // === CONFIGURATION HUMAINE ===
    // Un peu plus lent pour les textes avec beaucoup de 'x' et 'z' (lettres plus difficiles d'accès et moins fréquentes, donc mémoire musculaire plus faible).
    const TARGET_WPM = 70;

    // On choisit le nombre de fautes pour TOUT l'exercice
    // 0 = parfait, 1 à 3 = humain
    const errorOptions = [0, 1, 2, 3];
    const totalErrorsNeeded = errorOptions[Math.floor(Math.random() * errorOptions.length)];

    const inputArea = document.getElementById('type');
    const hiddenInput = document.getElementById('type_text');
    if (!inputArea || !hiddenInput) return;

    const targetText = hiddenInput.value.replace(/\\n/g, '\n');
    const totalChars = targetText.length;

    const errorIndices = new Set();
    if (totalErrorsNeeded > 0) {
        while (errorIndices.size < totalErrorsNeeded) {
            let randomIndex = Math.floor(Math.random() * (totalChars - 20)) + 10;
            if (targetText[randomIndex] !== ' ' && targetText[randomIndex] !== '¶' && targetText[randomIndex] !== '\n') {
                errorIndices.add(randomIndex);
            }
        }
    }

    console.log(`[BOT] Mode : ${totalErrorsNeeded === 0 ? "Parfait" : totalErrorsNeeded + " fautes prévues"}.`);

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
            const wrongChar = "sqdfghj"[Math.floor(Math.random() * 7)];
            await sendKey(wrongChar);
            console.warn(`[BOT] Faute volontaire : '${wrongChar}' au lieu de '${char}'`);
            await sleep(randomNormal(350, 80));
            await sendKey('Backspace');
            await sleep(randomNormal(200, 40));
        }

        if (char === '¶' || char === '\n') {
            await sendKey('Enter');
        } else {
            await sendKey(char);
        }

        const msPerChar = 60000 / (TARGET_WPM * 5);
        let delay = randomNormal(msPerChar - 55, 15);

        if (/[A-Z]/.test(char)) delay += 100;
        if (char === ' ') delay += 40;

        await sleep(Math.max(15, delay));
    }

    console.log("[BOT] Exercice terminé.");
})();
