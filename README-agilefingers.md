# Script AgileFingers - Guide rapide

Ce script lance une frappe automatique sur AgileFingers depuis un bookmarklet.

## Prerequis

- Avoir le script disponible dans ce depot: `script-agilefingers.js`
- Etre sur une page de lecon/test AgileFingers

## Utilisation

1. Creez un nouveau favori (bookmark) dans votre navigateur.
2. Collez un des bookmarklets ci-dessous dans le champ URL.
3. Ouvrez AgileFingers puis cliquez sur le favori pour lancer le script.

## Bookmarklet - WPM fixe

```javascript
javascript:(function(){window.targetWPM=70;window.speedCompensation=1.11;fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/refs/heads/master/script-agilefingers.js').then(r=>r.text()).then(code=>Function(code)());})();
```

## Bookmarklet - plage min/max

```javascript
javascript:(function(){window.targetLowWPM=70;window.targetHighWPM=80;window.speedCompensation=1.11;fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/refs/heads/master/script-agilefingers.js').then(r=>r.text()).then(code=>Function(code)());})();
```

## Arret du script

Dans la console du navigateur:

```javascript
window.AF_BOT_STOP = true;
```
