# ⌨️ EPI-AutoTypingStudy

Script de frappe automatisé intelligent pour [TypingStudy.com](https://www.typingstudy.com/).  
Ce bot simule une frappe humaine réaliste avec des variations de vitesse, des erreurs aléatoires et des corrections automatiques.

---

## ✨ Fonctionnalités
- **Frappe "Humaine"** : Délais aléatoires basés sur une distribution normale.
- **Gestion des Erreurs** : Capable de faire des fautes et de les corriger immédiatement avec `Backspace`.
- **Anti-Double Launch** : Empêche l'exécution de plusieurs scripts simultanément.
- **Séquences d'échappement** : Gère proprement les retours à la ligne (`\n`) injectés par le site.
- **Configurable** : Vitesse et taux d'erreur modifiables sans toucher au code source.

---

## 🚀 Méthodes d'utilisation

### 1. La méthode "Bookmarklet" (La plus rapide ⚡)
Lancez le bot en un seul clic sans ouvrir la console !

1. Affichez votre barre de favoris (`Ctrl + Shift + B`).
2. Faites un clic droit sur la barre > **Ajouter une page** (ou un favori).
3. **Nom** : `🤖 Bot Typing`
4. **URL / Adresse** : Copiez-collez le bloc ci-dessous :
   ```javascript
   javascript:(function(){ window.BOT_WPM = 60; window.BOT_ERRORS = [0, 1, 2, 3]; fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js').then(r => r.text()).then(eval); })();
   ```

### 2. La méthode Console (Personnalisation 🛠️)
Utile pour ajuster les paramètres précisément avant un exercice spécifique.

1. Allez sur une leçon sur [TypingStudy](https://www.typingstudy.com/).
2. Ouvrez la console (`F12` ou `Ctrl + Shift + I`).
3. (Si nécessaire) Tapez `allow pasting` et appuyez sur Entrée.
4. Collez et modifiez ce code :

```javascript
// --- CONFIGURATION OPTIONNELLE ---
window.BOT_WPM = 75;         // Vitesse (mots par minute)
window.BOT_ERRORS = [0, 1, 2, 3];  // Choisit aléatoirement 0, 1, 2 ou 3 fautes

// --- EXECUTION ---
fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js')
    .then(r => r.text())
    .then(eval);
```

---

## ⚙️ Paramètres disponibles

Si vous ne définissez pas de variables globales avant l'exécution, le script utilise ces valeurs par défaut :

| Variable | Valeur par défaut | Description |
| :--- | :--- | :--- |
| `window.BOT_WPM` | `60` | Vitesse cible (Words Per Minute). |
| `window.BOT_ERRORS` | `[0, 1, 2, 3]` | Un nombre fixe (ex: `5`) ou un tableau pour un choix aléatoire. |

---

> [!WARNING]  
> **Sécurité & Avertissement**  
> Ce script est destiné à des fins éducatives. Bien que le comportement soit conçu pour paraître humain, l'utilisation d'outils d'automatisation peut être contraire aux conditions d'utilisation de certains sites. À utiliser de manière responsable.

_Projet maintenu par JordiBrisbois._
