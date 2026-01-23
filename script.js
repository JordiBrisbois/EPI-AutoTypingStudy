(async () => {
    // === CONFIGURATION ===
    const TARGET_WPM = 60;
    const ERROR_RATE = 0.01;

    const inputArea = document.getElementById('type');
    const hiddenInput = document.getElementById('type_text');

    if (!inputArea || !hiddenInput) {
        console.error("Could not find input elements.");
        return;
    }

    const targetText = hiddenInput.value;
    const wordCount = targetText.trim().split(/\s+/).length;
    const targetTimeMs = (wordCount / TARGET_WPM) * 60000;
    const AVG_DELAY = targetTimeMs / targetText.length;

    const randomNormal = (mean, stdDev) => {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return mean + (num * stdDev);
    };

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    inputArea.focus();
    inputArea.value = "";

    for (let i = 0; i < targetText.length; i++) {
        let char = targetText[i];
        let nextChar = targetText[i + 1];

        let isEnter = false;
        let charCode = 0;
        let keyCode = 0;
        let code = '';
        let key = '';

        if (char === '¶' || char === '\n') {
            isEnter = true;
            char = '\n';
        } else if (char === '\\' && nextChar === 'n') {
            isEnter = true;
            char = '\n';
            i++;
        }

        if (isEnter) {
            key = 'Enter';
            code = 'Enter';
            keyCode = 13;
            charCode = 13;
        } else {
            key = char;
            charCode = char.charCodeAt(0);

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
                keyCode = char.charCodeAt(0);
                code = 'Quote';
            }
        }

        const commonOpts = {
            bubbles: true,
            cancelable: true,
            view: window
        };

        const downEvent = new KeyboardEvent('keydown', {
            ...commonOpts,
            key: key,
            code: code,
            keyCode: keyCode,
            which: keyCode,
            charCode: 0
        });
        inputArea.dispatchEvent(downEvent);

        if (key.length === 1 || key === 'Enter') {
            const pressEvent = new KeyboardEvent('keypress', {
                ...commonOpts,
                key: key,
                code: code,
                keyCode: charCode,
                which: charCode,
                charCode: charCode
            });
            inputArea.dispatchEvent(pressEvent);
        }

        const inputEvent = new InputEvent('input', {
            ...commonOpts,
            data: isEnter ? null : char,
            inputType: isEnter ? 'insertLineBreak' : 'insertText'
        });
        inputArea.dispatchEvent(inputEvent);

        await sleep(randomNormal(50, 15));

        const upEvent = new KeyboardEvent('keyup', {
            ...commonOpts,
            key: key,
            code: code,
            keyCode: keyCode,
            which: keyCode,
            charCode: 0
        });
        inputArea.dispatchEvent(upEvent);

        let delay = randomNormal(AVG_DELAY - 50, 30);

        if (isEnter) delay += 100;
        if (char === ' ') delay += 20;

        if (delay < 10) delay = 10;

        await sleep(delay);
    }
})();
