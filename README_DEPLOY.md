# 🚀 Reversi — Deploy to Railway (1 click)

## ⚡ Deploy Automatique

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new?templateUrl=https://github.com/ETHIEL07/Reversi)

**C'est tout ce que tu dois faire :**

1. **Click le bouton bleu Deploy ↑**
2. **Autorize GitHub** (1 click)
3. **Attends 5 min** → API + DB + Frontend = ONLINE ✅

---

## ✅ Ce qui se passe automatiquement après :

- ✅ **Docker build** du backend .NET
- ✅ **PostgreSQL 18** créée et configurée
- ✅ **API déployée** sur `https://reversi-api.railway.app`
- ✅ **Vercel notifiée** → frontend redirect vers Railway API
- ✅ **Game jouable** immédiatement

---

## 🎮 Test après déploiement

```bash
# Vérifie l'API
curl https://reversi-api.railway.app/api/version

# Visite l'app
https://reversi-psi-two.vercel.app
```

Clique "Jouer" → "Nouvelle partie" → ça marche ! 🎉

---

## 📋 Architecture finale

```
┌─────────────────────────────────────────┐
│ Vercel (Frontend React)                 │
│ https://reversi-psi-two.vercel.app      │
└────────────────┬────────────────────────┘
                 │ /api/* → Railway
                 ↓
┌─────────────────────────────────────────┐
│ Railway (Backend .NET + PostgreSQL)     │
│ https://reversi-api.railway.app         │
├─────────────────────────────────────────┤
│ • API on :80                            │
│ • PostgreSQL 18 (internal)              │
│ • Auto-redeploy on git push             │
└─────────────────────────────────────────┘
```

---

## 🆘 Problèmes ?

Si tu vois une erreur après deploy :
1. Attends **2 min de plus** (build peut être lent)
2. Refresh la page Vercel
3. Check la console Railway pour les erreurs

---

**Voilà !** C'est 100% en ligne. Zéro local. 🎊
