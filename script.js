(async () => {
    // === CONFIGURATION ===
    const TARGET_WPM = 70;
    const ERROR_RATE = 0.00; // 0% errors for now, can be increased for realism

    // Selectors
    const inputArea = document.getElementById('type');
    const hiddenInput = document.getElementById('type_text');

    if (!inputArea || !hiddenInput) {
        console.error("Could not find input elements. Make sure you are on the lesson page.");
        return;
    }

    const targetText = hiddenInput.value;

    // Math for WPM
    // Standard word is 5 characters.
    // 70 WPM = 350 CPM = 5.83 chars/sec
    // 171ms per character average
    const CHARS_PER_WORD = 5;
    const MS_PER_MIN = 60000;
    const AVG_DELAY = MS_PER_MIN / (TARGET_WPM * CHARS_PER_WORD);

    // Helper: Gaussian-like random number for realistic variance
    const randomNormal = (mean, stdDev) => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return mean + (num * stdDev);
    };

    // Helper: Sleep
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    // Reset
    inputArea.focus();
    inputArea.value = "";

    console.log(`Starting automation at ~${TARGET_WPM} WPM...`);

    for (let i = 0; i < targetText.length; i++) {
        let char = targetText[i];
        let nextChar = targetText[i + 1];

        let isEnter = false;
        let charCode = 0;
        let keyCode = 0;
        let code = '';
        let key = '';

        // Handle parsing of newlines/special chars
        if (char === '¶' || char === '\n') {
            isEnter = true;
            char = '\n';
        } else if (char === '\\' && nextChar === 'n') {
            isEnter = true;
            char = '\n';
            i++; // skip 'n'
        }

        // Determine event properties
        if (isEnter) {
            key = 'Enter';
            code = 'Enter';
            keyCode = 13;
            charCode = 13;
        } else {
            key = char;
            charCode = char.charCodeAt(0);

            // For KeyDown: keyCode is usually uppercase ASCII for letters
            if (/[a-z]/.test(char)) {
                keyCode = char.toUpperCase().charCodeAt(0);
                code = `Key${char.toUpperCase()}`;
            } else if (/[A-Z]/.test(char)) {
                keyCode = char.charCodeAt(0);
                code = `Key${char}`;
            } else if (/[0-9]/.test(char)) {
                keyCode = char.charCodeAt(0);
                code = `Digit${char}`;
            } else if (char === ' ') {
                keyCode = 32;
                code = 'Space';
            } else {
                // Symbols - rough approximation, usually fine
                keyCode = char.charCodeAt(0);
                code = 'Quote'; // Fallback
            }
        }

        const commonOpts = {
            bubbles: true,
            cancelable: true,
            view: window
        };

        // 1. KEYDOWN
        const downEvent = new KeyboardEvent('keydown', {
            ...commonOpts,
            key: key,
            code: code,
            keyCode: keyCode,
            which: keyCode,
            charCode: 0 // charCode is 0 for keydown
        });
        inputArea.dispatchEvent(downEvent);

        // 2. KEYPRESS (Deprecated but often used)
        // Only fired for printable characters and Enter (usually)
        if (key.length === 1 || key === 'Enter') {
            const pressEvent = new KeyboardEvent('keypress', {
                ...commonOpts,
                key: key,
                code: code,
                keyCode: charCode, // keypress uses charCode logic often in 'which' or 'keyCode' legacy
                which: charCode,
                charCode: charCode
            });
            inputArea.dispatchEvent(pressEvent);
        }

        // 3. ACTUAL INPUT (Visual update)
        // If site doesn't handle it via events opacity, we force it.
        // It's safer to ensure value is updated for the "Input" event to make sense.
        // Check if value already has it (site handler).
        const expectedVal = inputArea.value + char;
        // We wait a tiny bit to see if site handler worked? No, that messes up timing.
        // We'll just dispatch InputEvent. If text is missing, script might fail, 
        // but 'insertText' InputEvent implies the text was inserted.

        // Dispatch Input Event (modern handlers)
        const inputEvent = new InputEvent('input', {
            ...commonOpts,
            data: isEnter ? null : char,
            inputType: isEnter ? 'insertLineBreak' : 'insertText'
        });
        inputArea.dispatchEvent(inputEvent);

        // Simulate Hold Time (Key down -> Key up)
        await sleep(randomNormal(50, 15)); // ~50ms hold

        // 4. KEYUP
        const upEvent = new KeyboardEvent('keyup', {
            ...commonOpts,
            key: key,
            code: code,
            keyCode: keyCode, // same as keydown
            which: keyCode,
            charCode: 0
        });
        inputArea.dispatchEvent(upEvent);

        // Delay between characters (Inter-key latency)
        // We want total time per char to avg around AVG_DELAY.
        // We already spent ~50ms holding.
        // Remaining ~120ms.
        let delay = randomNormal(AVG_DELAY - 50, 30);

        // Adjustments
        if (isEnter) delay += 100; // Pause after line break
        if (char === ' ') delay += 20; // Slight pause after word

        // Ensure non-negative
        if (delay < 10) delay = 10;

        await sleep(delay);
    }

    console.log("Automation complete.");
})();
