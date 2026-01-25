# ⌨️ TypingStudy Bot v2.1.1

**Bot d'auto-typing intelligent pour [TypingStudy.com](https://www.typingstudy.com)** avec simulation humaine avancée et calibration automatique du WPM.

[![Version](https://img.shields.io/badge/version-2.1.1-blue.svg)](https://github.com/JordiBrisbois/EPI-AutoTypingStudy)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## ✨ Fonctionnalités

### 🎯 Nouvelle v2.1.1 (Userscript)
- **Mode Auto Infini** : Enchaîne automatiquement les leçons sans intervention
- **Kill Switch** : Arrêt d'urgence instantané avec la touche `Echap`
- **WPM Aléatoire** : Variation réaliste de la vitesse cible à chaque nouvel exercice
- **Compensation Automatique** : Calibration précise pour atteindre le WPM visé
- **Erreurs Réalistes** : Substitution de caractères proches (sans correction)

### 🧠 Simulation Humaine Avancée
- **Distribution Normale** : Délais basés sur Box-Muller transform (variation ±15%)
- **Proximité Clavier** : Erreurs sur touches adjacentes (ex: `o` → `i`, `a` → `q`)
- **Latences Contextuelles** : Ralentissement léger sur majuscules et espaces
- **Événements Complets** : `keydown` → `keypress` → `input` → `keyup`

### 🔒 Sécurité
- **Verrou d'Exécution** : Empêche les lancements multiples
- **Gestion d'Erreurs** : Try-catch avec libération garantie du verrou
- **Logs Colorés** : Suivi en temps réel de la progression

---

## 🚀 Utilisation

### Option A : Userscript (Auto-Mode & Boucles Infinies ♾️) - RECOMMANDÉ

Cette méthode permet au bot de **s'exécuter automatiquement** d'une leçon à l'autre et inclut un **Kill Switch**.

1. **Installez l'extension** [Tampermonkey](https://www.tampermonkey.net/) sur votre navigateur.
2. Cliquez sur l'icône Tampermonkey → **Ajouter un nouveau script**.
3. Tout effacer et copier-coller le contenu du fichier [`userscript.js`](userscript.js).
4. **Sauvegardez** (Ctrl+S).

**Contrôles :**
- `Alt + S` : Démarrer le bot (active le **Mode Auto**).
- `Echap` (Escape) : **ARRÊT D'URGENCE** (Arrête le bot et désactive le Mode Auto).

### Option B : Bookmarklet (Rapide ⚡)

**Lancez le bot en un clic depuis vos favoris !**

> 💡 **Guide Complet** : [Voir le tutoriel détaillé pour installer le Bookmarklet](Bookmarklet.md)

1. **Affichez votre barre de favoris** : `Ctrl + Shift + B` (Chrome/Edge) ou `Cmd + Shift + B` (Mac)

2. **Créez un nouveau favori** :
   - Clic droit sur la barre → **Ajouter une page**
   - **Nom** : `🤖 TypingStudy Bot`

3. **Copiez cette URL** dans le champ "Adresse" :

```javascript
javascript:(function(){window.BOT_WPM=60;window.BOT_ERRORS=[0,1,2,3];fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js').then(r=>r.text()).then(eval);})();
```

4. **Utilisation** : 
   - Allez sur une leçon TypingStudy
   - Cliquez sur le favori `🤖 TypingStudy Bot`
   - Le bot démarre automatiquement !

---

### Option C : Console du Navigateur (Personnalisation 🛠️)

**Pour ajuster finement les paramètres avant chaque exercice**

1. **Ouvrez la console** : `F12` ou `Ctrl + Shift + I`

2. **Autorisez le collage** (si demandé) : tapez `allow pasting` et Entrée

3. **Collez et personnalisez ce code** :

```javascript
// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

window.BOT_WPM = 60;              // WPM que VOUS VOULEZ voir affiché
window.BOT_ERRORS = [0, 1, 2, 3]; // Nombre d'erreurs (aléatoire)

// ═══════════════════════════════════════════════════════════════
// EXECUTION
// ═══════════════════════════════════════════════════════════════

fetch('https://raw.githubusercontent.com/JordiBrisbois/EPI-AutoTypingStudy/master/script.js')
    .then(r => r.text())
    .then(eval);
```

---

## ⚙️ Configuration (Userscript)

Si vous utilisez la méthode Userscript, vous pouvez éditer les constantes en haut du fichier `userscript.js` :

```javascript
const CONFIG = {
    MIN_WPM: 61,        // Vitesse min
    MAX_WPM: 68,        // Vitesse max (choisie aléatoirement par leçon)
    ERROR_RATES: [0, 1, 2], // Nombre d'erreurs possibles
    AUTO_NAV_DELAY: 4000, // Attente avant leçon suivante (ms)
    START_KEY: 's'      // Touche raccourci (Alt + s)
};
```

---

## ⚙️ Configuration

### Variables Disponibles

| Variable | Type | Défaut | Description |
|----------|------|--------|-------------|
| `window.BOT_WPM` | `number` | `60` | WPM que vous **voulez voir affiché** sur le site |
| `window.BOT_ERRORS` | `number` ou `array` | `[0,1,2,3]` | Nombre d'erreurs (fixe ou tableau pour choix aléatoire) |

### Exemples de Configuration

#### 🐢 Débutant (Vitesse Lente)
```javascript
window.BOT_WPM = 40;
window.BOT_ERRORS = [1, 2, 3, 4];
```

#### ⚡ Intermédiaire (Vitesse Moyenne)
```javascript
window.BOT_WPM = 60;
window.BOT_ERRORS = [0, 1, 2];
```

#### 🚀 Expert (Vitesse Rapide)
```javascript
window.BOT_WPM = 80;
window.BOT_ERRORS = [0, 1];
```

#### 💯 Performance Maximale
```javascript
window.BOT_WPM = 100;
window.BOT_ERRORS = 0; // Aucune erreur
```

#### 🎲 Aléatoire Réaliste
```javascript
window.BOT_WPM = Math.floor(Math.random() * 20) + 50; // 50-70 WPM
window.BOT_ERRORS = [0, 1, 2, 3];
```

---

## 📊 Sortie Console

Le bot affiche des logs colorés pour suivre la progression :

```
🤖 Démarrage du Bot TypingStudy v2.0
⚙️  Configuration : 60 WPM visé → 74 WPM interne (×1.23) • 2 erreur(s)
📝 Texte chargé : 240 caractères
🎯 Positions d'erreurs : [45, 123]
⌨️  Début de la frappe...
❌ Position 45 : Substitution 'é' → 'r' (non corrigée)
📊 41.7% • 100/240 chars • 16.2s
❌ Position 123 : Substitution 'o' → 'i' (non corrigée)
📊 83.3% • 200/240 chars • 32.5s
📊 100.0% • 240/240 chars • 39.1s
✅ Frappe terminée avec succès!
📈 Stats : 74 WPM réels • 39.1s • 2 erreur(s)
🎯 WPM attendu sur le site : ~60 WPM
🔓 Bot déverrouillé et prêt
```

---

## 🧪 Calibration

Le bot utilise une **compensation automatique** pour atteindre le WPM voulu sur TypingStudy.

### Formule de Compensation
```javascript
WPM_interne = WPM_visé × (1.23 + 0.015 × nombre_erreurs)
```

### Pourquoi cette compensation ?

TypingStudy calcule le WPM différemment que la formule standard. Le bot compense automatiquement cette différence pour que vous obteniez **exactement** le WPM que vous configurez.

**Précision observée** : ±2 WPM (98% de précision)

---

## 🛠️ Dépannage

### Le bot ne démarre pas
- ✅ Vérifiez que vous êtes bien sur **TypingStudy.com**
- ✅ Rechargez la page (`F5`) et réessayez
- ✅ Vérifiez la console (`F12`) pour voir les erreurs

### Le WPM affiché est différent
- ✅ Normal : ±2 WPM d'écart est acceptable
- ✅ Si l'écart est >5 WPM, signalez-le (GitHub Issues)

### "Le bot est déjà en cours d'exécution"
- ✅ Attendez la fin de l'exercice en cours
- ✅ Ou rechargez la page pour réinitialiser

### Caractères doublés ou manquants
- ✅ Rechargez la page avant de relancer
- ✅ Vérifiez qu'aucun autre script n'est actif

---

## 📋 Fonctionnement Interne

### 1. Prétraitement du Texte
```javascript
\n (littéral) → Retour à la ligne (Enter)
¶ (symbole) → Espace
```

### 2. Génération des Erreurs
- Position aléatoire (évite les 10 premiers/derniers caractères)
- Évite les espaces et retours à la ligne
- Substitution par touche adjacente sur le clavier

### 3. Simulation de Frappe
```
Pour chaque caractère :
  1. Erreur ? → Taper mauvais caractère, continuer
  2. Sinon → Taper caractère correct
  3. Événements : keydown → keypress → input → keyup
  4. Délai humain (distribution normale)
```

### 4. Calcul du Délai
```javascript
délai_base = 60000 / (WPM × 5)
délai_final = normale(délai_base, ±15%)
           + bonus_majuscule(5ms)
           + bonus_espace(5ms)
```

---

## 📜 Changelog

### v2.1.1 (2025-01-25)
- 🐛 **Correction Kill Switch** : L'appui sur `Echap` annule désormais correctement les redirections en attente (race condition).
- 🧹 Nettoyage de code (suppression variables inutilisées).

### v2.1 (2025-01-25)
- ✨ Ajout du Userscript Tampermonkey
- ♾️ Mode Auto (Enchaînement automatique des leçons)
- 🛑 Kill Switch et Sûreté
- 🎲 WPM Aléatoire entre les sessions

### v2.0 (2025-01-24)
- ✨ Compensation automatique du WPM
- ✨ Gestion correcte du symbole `¶` (espace)
- ✨ Erreurs par substitution (plus de backspace)
- ✨ Prédiction du WPM affiché
- 🎯 Calibration optimisée (précision 98%)
- 🔧 Code complètement réécrit et optimisé

### v1.0 (Précédente)
- ✅ Simulation de frappe humaine
- ✅ Erreurs avec correction (backspace)
- ✅ Configuration WPM/Erreurs

---

## ⚠️ Avertissement

> **Usage Éducatif Uniquement**
> 
> Ce script est destiné à des **fins éducatives et de démonstration**. L'utilisation d'outils d'automatisation peut être contraire aux conditions d'utilisation de certains sites web.
> 
> **Utilisez ce bot de manière responsable** et en connaissance de cause. Les auteurs ne sont pas responsables de l'utilisation qui en est faite.

---

## 🤝 Contribution

Les contributions sont les bienvenues ! 

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amelioration`)
3. Commit vos changements (`git commit -m 'Ajout fonctionnalité X'`)
4. Push sur la branche (`git push origin feature/amelioration`)
5. Ouvrez une Pull Request

---

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👤 Auteur

**Jordi Brisbois**

- GitHub: [@JordiBrisbois](https://github.com/JordiBrisbois)
- Projet: [EPI-AutoTypingStudy](https://github.com/JordiBrisbois/EPI-AutoTypingStudy)

---

## 🌟 Remerciements

Merci à tous les contributeurs et utilisateurs du projet !

Si ce bot vous aide, n'hésitez pas à mettre une ⭐ sur le repo GitHub 😊

---

**Made with ❤️ and ☕ by Jordi Brisbois**
