# EPI-AutoTypingStudy

Script de frappe automatisé pour [TypingStudy.com](https://www.typingstudy.com/). Simule le comportement de frappe humain à ~70 WPM.

## Utilisation

### 1. Copier le script
Ouvrez [script.js](./script.js) et copiez tout le contenu.

### 2. Ouvrir les outils de développement
Naviguez vers la page de leçon de dactylographie sur TypingStudy.com.

- **Google Chrome / Microsoft Edge**: Appuyez sur `F12` ou `Ctrl + Shift + I`. Cliquez sur l'onglet **Console**.
- **Mozilla Firefox**: Appuyez sur `F12` ou `Ctrl + Shift + K`. Cliquez sur l'onglet **Console**.

### 3. Autoriser le collage (Important !)
Les navigateurs modernes bloquent souvent le collage dans la console pour des raisons de sécurité.

- **Chrome/Edge**: Si vous voyez un avertissement, tapez `allow pasting` et appuyez sur Entrée. Puis collez à nouveau le script.
- **Firefox**: Si vous voyez un avertissement, tapez `allow pasting` (ou suivez l'instruction spécifique à l'écran) et appuyez sur Entrée.

### 4. Exécuter le script
1. Collez le code copié dans la zone de la console.
2. Appuyez sur **Entrée**.
3. Le script commencera automatiquement à taper le texte de la leçon.

## Fonctionnalités
- **Frappe réaliste**: Moyenne ~70 WPM avec des délais aléatoires.
- **Comportement humain**: Simule les événements de touche appropriés (`keydown`, `keypress`, `input`, `keyup`) et les temps de maintien des touches.
- **Taux d'erreur**: Actuellement défini à 1% d'erreurs.

## Méthode Rapide (Avancé)
Au lieu de copier-coller le code à chaque fois, vous pouvez exécuter cette commande dans la console pour charger la dernière version directement depuis GitHub :

```javascript
fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js').then(r => r.text()).then(eval);
```

