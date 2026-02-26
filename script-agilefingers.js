// AgileFingers Auto Typing Bot (clean)
// Usage:
//   window.targetWPM = 70; // fixe
//   window.targetLowWPM = 70; window.targetHighWPM = 80; // plage aleatoire
//   window.speedCompensation = 1.11; // optionnel, 1 = desactive
//   // paste this script
// Stop:
//   window.AF_BOT_STOP = true;

(async function () {
  'use strict';

  if (window.AF_BOT_IS_RUNNING) {
    console.log('[AF BOT] Deja en cours.');
    return;
  }

  window.AF_BOT_IS_RUNNING = true;
  window.AF_BOT_STOP = false;

  const lowWPM = Number(window.targetLowWPM);
  const highWPM = Number(window.targetHighWPM);
  const hasRange = Number.isFinite(lowWPM) && Number.isFinite(highWPM) && lowWPM > 0 && highWPM > 0;
  const minWPM = hasRange ? Math.min(lowWPM, highWPM) : null;
  const maxWPM = hasRange ? Math.max(lowWPM, highWPM) : null;
  const targetWPM = hasRange
    ? (minWPM + Math.random() * (maxWPM - minWPM))
    : Number(window.targetWPM ?? 60);
  const safeTargetWPM = Number.isFinite(targetWPM) && targetWPM > 0 ? targetWPM : 60;
  const speedCompensation = Number(window.speedCompensation ?? 1);
  const safeCompensation = Number.isFinite(speedCompensation) && speedCompensation > 0 ? speedCompensation : 1;
  const effectiveWPM = safeTargetWPM * safeCompensation;
  const baseDelay = 60000 / (effectiveWPM * 5);
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function isSummaryPage() {
    return (window.location.pathname || '').includes('/sommaire');
  }

  async function waitFor(getter, timeoutMs = 10000, stepMs = 80) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const value = getter();
      if (value) return value;
      await sleep(stepMs);
    }
    return null;
  }

  function randomDelay(char) {
    let d = baseDelay * (0.85 + Math.random() * 0.3);
    if (char === ' ') d += 8;
    if (/[A-ZÀ-ÖØ-Þ]/.test(char)) d += 6;
    return Math.max(12, d);
  }

  function getFirstLetter() {
    const el = document.querySelector('.first-letter');
    if (!el) return null;
    const t = (el.textContent || '').replace(/\u00a0/g, ' ');
    return t ? t[0] : null;
  }

  function keyInfo(char) {
    if (char === '\n') return { key: 'Enter', code: 'Enter', keyCode: 13 };
    if (char === ' ') return { key: ' ', code: 'Space', keyCode: 32 };
    if (/^[a-z]$/i.test(char)) return { key: char, code: `Key${char.toUpperCase()}`, keyCode: char.toUpperCase().charCodeAt(0) };
    if (/^[0-9]$/.test(char)) return { key: char, code: `Digit${char}`, keyCode: char.charCodeAt(0) };

    const p = {
      '.': { key: '.', code: 'Period', keyCode: 190 },
      ',': { key: ',', code: 'Comma', keyCode: 188 },
      ';': { key: ';', code: 'Semicolon', keyCode: 186 },
      ':': { key: ':', code: 'Semicolon', keyCode: 186, shiftKey: true },
      "'": { key: "'", code: 'Quote', keyCode: 222 },
      '"': { key: '"', code: 'Quote', keyCode: 222, shiftKey: true },
      '-': { key: '-', code: 'Minus', keyCode: 189 },
      '_': { key: '_', code: 'Minus', keyCode: 189, shiftKey: true },
      '!': { key: '!', code: 'Digit1', keyCode: 49, shiftKey: true },
      '?': { key: '?', code: 'Slash', keyCode: 191, shiftKey: true },
      '/': { key: '/', code: 'Slash', keyCode: 191 },
      '(': { key: '(', code: 'Digit9', keyCode: 57, shiftKey: true },
      ')': { key: ')', code: 'Digit0', keyCode: 48, shiftKey: true }
    };
    return p[char] || { key: char, code: 'Unidentified', keyCode: char.charCodeAt(0) || 0 };
  }

  function sendChar(input, char) {
    const { key, code, keyCode, shiftKey } = keyInfo(char);
    const e = { bubbles: true, cancelable: true, key, code, keyCode, which: keyCode, shiftKey: Boolean(shiftKey) };
    input.dispatchEvent(new KeyboardEvent('keydown', e));
    input.dispatchEvent(new KeyboardEvent('keypress', { ...e, charCode: keyCode }));
    input.value += char;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: char }));
    input.dispatchEvent(new KeyboardEvent('keyup', e));
  }

  function forceInsert(input, char) {
    input.value += char;
    input.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: char }));
  }

  try {
    const startBtn = document.getElementById('goToTypingExercise');
    if (startBtn && startBtn.offsetParent !== null) {
      startBtn.click();
      await sleep(350);
    }

    const input = await waitFor(() => {
      const el = document.querySelector('.inserted-text');
      return el && el.offsetParent !== null ? el : null;
    });
    if (!input) throw new Error("Input '.inserted-text' introuvable.");

    input.focus();
    input.value = '';
    await sleep(100);

    let typed = 0;
    const t0 = Date.now();

    const first = getFirstLetter();
    if (first) {
      console.log(`[AF BOT] Start (reactif) | target=${Math.round(safeTargetWPM)} WPM | effective=${Math.round(effectiveWPM)} WPM`);
      let last = null;
      let stuck = 0;

      while (!window.AF_BOT_STOP && !isSummaryPage()) {
        const current = getFirstLetter();
        if (!current) {
          await sleep(40);
          continue;
        }

        sendChar(input, current);
        typed += 1;
        await sleep(12);

        if (current === last && getFirstLetter() === current) {
          stuck += 1;
          if (stuck >= 4) {
            forceInsert(input, current);
            typed += 1;
            stuck = 0;
          }
        } else {
          stuck = 0;
        }
        last = current;

        if (typed % 200 === 0) {
          const sec = (Date.now() - t0) / 1000;
          const wpm = Math.round((typed / 5) / (sec / 60));
          console.log(`[AF BOT] ${typed} chars | ~${wpm} WPM`);
        }

        await sleep(randomDelay(current));
      }
    } else {
      const source = document.querySelector('#textForTypingContent');
      if (!source) throw new Error("Contenu '#textForTypingContent' introuvable.");
      const text = (source.innerText || '').replace(/\r/g, '').replace(/\u00a0/g, ' ').trim();
      if (!text) throw new Error('Texte cible vide.');

      console.log(`[AF BOT] Start (texte) | target=${Math.round(safeTargetWPM)} WPM | effective=${Math.round(effectiveWPM)} WPM | chars=${text.length}`);
      for (let i = 0; i < text.length; i++) {
        if (window.AF_BOT_STOP || isSummaryPage()) break;
        sendChar(input, text[i]);
        typed += 1;
        if ((i + 1) % 200 === 0 || i === text.length - 1) {
          const sec = (Date.now() - t0) / 1000;
          const wpm = Math.round(((i + 1) / 5) / (sec / 60));
          const pct = (((i + 1) / text.length) * 100).toFixed(1);
          console.log(`[AF BOT] ${pct}% | ${i + 1}/${text.length} | ~${wpm} WPM`);
        }
        await sleep(randomDelay(text[i]));
      }
    }

    const totalSec = (Date.now() - t0) / 1000;
    const realWPM = totalSec > 0 ? Math.round((typed / 5) / (totalSec / 60)) : 0;
    if (isSummaryPage()) console.log('[AF BOT] Exercice termine, page resume detectee.');
    if (window.AF_BOT_STOP) console.log('[AF BOT] Arret demande.');
    console.log(`[AF BOT] Termine | ${totalSec.toFixed(1)}s | ~${realWPM} WPM`);
  } catch (err) {
    console.error('[AF BOT] Erreur:', err);
  } finally {
    window.AF_BOT_IS_RUNNING = false;
  }
})();
