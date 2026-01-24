# 📌 Guide Bookmarklet - TypingStudy Bot

## 🚀 Installation Rapide (1 minute)

### Étape 1 : Créer le favori

1. **Affichez votre barre de favoris** :
   - **Chrome/Edge** : `Ctrl + Shift + B` (Windows) ou `Cmd + Shift + B` (Mac)
   - **Firefox** : `Ctrl + Shift + B` (Windows) ou `Cmd + Shift + B` (Mac)

2. **Ajoutez un nouveau favori** :
   - Clic droit sur la barre de favoris
   - Sélectionnez "Ajouter une page" ou "Nouveau favori"

3. **Remplissez les champs** :
   - **Nom** : `🤖 TypingStudy Bot` (ou ce que vous voulez)
   - **URL/Adresse** : Copiez-collez le code ci-dessous

---

## 📋 Codes Bookmarklet

### Version Standard (60 WPM, 0-3 erreurs)

```javascript
javascript:(function(){window.BOT_WPM=60;window.BOT_ERRORS=[0,1,2,3];fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js').then(r=>r.text()).then(eval);})();
```

### Version Rapide (80 WPM, 0-1 erreurs)

```javascript
javascript:(function(){window.BOT_WPM=80;window.BOT_ERRORS=[0,1];fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js').then(r=>r.text()).then(eval);})();
```

### Version Performance (100 WPM, 0 erreur)

```javascript
javascript:(function(){window.BOT_WPM=100;window.BOT_ERRORS=0;fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js').then(r=>r.text()).then(eval);})();
```

### Version Lente (40 WPM, 2-4 erreurs)

```javascript
javascript:(function(){window.BOT_WPM=40;window.BOT_ERRORS=[2,3,4];fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js').then(r=>r.text()).then(eval);})();
```

---

## 🎯 Utilisation

1. **Allez sur TypingStudy.com** et choisissez un exercice
2. **Cliquez sur le bookmarklet** dans votre barre de favoris
3. **Le bot démarre automatiquement** !

---

## ⚙️ Personnalisation

Pour créer votre propre bookmarklet avec des paramètres personnalisés, modifiez ces valeurs :

```javascript
javascript:(function(){
  window.BOT_WPM=60;           // ← Changez ici (20-150)
  window.BOT_ERRORS=[0,1,2];   // ← Changez ici (nombre ou tableau)
  fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js').then(r=>r.text()).then(eval);
})();
```

### Exemples de Configurations

| Objectif | WPM | Erreurs |
|----------|-----|---------|
| Débutant naturel | `40` | `[2,3,4,5]` |
| Intermédiaire | `60` | `[1,2,3]` |
| Avancé | `80` | `[0,1]` |
| Expert | `100` | `0` |
| Aléatoire réaliste | `Math.floor(Math.random()*20)+50` | `[0,1,2,3]` |

---

## 🔧 Dépannage

### Le bookmarklet ne fonctionne pas

1. **Vérifiez l'URL** : Elle doit commencer par `javascript:`
2. **Pas d'espaces** : Copiez le code d'un seul bloc
3. **Testez dans la console** : Si ça marche en console mais pas en bookmarklet, c'est un problème de navigateur

### Chrome/Edge bloque le bookmarklet

Certaines versions récentes peuvent bloquer les bookmarklets JavaScript. Solution :

1. Ouvrez la console (`F12`)
2. Collez directement le code (sans le `javascript:` au début)

### Firefox ne conserve pas le bookmarklet

Firefox peut supprimer le `javascript:` au début. Vérifiez et rajoutez-le si nécessaire.

---

## 💡 Astuces

### Créer plusieurs bookmarklets

Créez différents favoris pour différentes situations :

- `🐢 Bot Lent (40 WPM)` → Pour les textes difficiles
- `⚡ Bot Normal (60 WPM)` → Utilisation quotidienne
- `🚀 Bot Rapide (80 WPM)` → Pour impressionner
- `💯 Bot Max (100 WPM)` → Performance pure

### Organiser vos bookmarklets

Créez un **dossier "Bots"** dans vos favoris pour les regrouper :

```
📁 Favoris
  └─ 📁 Bots
      ├─ 🐢 TypingStudy Lent
      ├─ ⚡ TypingStudy Normal
      ├─ 🚀 TypingStudy Rapide
      └─ 💯 TypingStudy Max
```

---

## 🔗 Liens Utiles

- **Repo GitHub** : [EPI-AutoTypingStudy](https://github.com/JordiBrisbois/EPI-AutoTypingStudy)
- **Issues** : [Signaler un bug](https://github.com/JordiBrisbois/EPI-AutoTypingStudy/issues)
- **Script source** : [script.js](https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js)

---

**Bon typing ! ⌨️✨**
