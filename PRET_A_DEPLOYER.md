# ✅ REVERSI — PRÊT À DÉPLOYER

**Date** : 4 août 2026  
**Statut** : 🟢 Production ready  
**Commit** : `e4286a3` (Production deployment configured)

---

## 📊 État du projet

### ✅ Complété (Côté développeur)

- **Backend (.NET 10)**
  - ✅ Moteur de jeu pur (Reversi.Core) : 88/88 tests
  - ✅ API REST minimale (endpoints game, moves, pass, undo, rewind, demo, advance)
  - ✅ Deferred computer moves : `deferComputer` flag pour séquencer les animations
  - ✅ CORS dynamique : lira les origins depuis `FrontOrigins` en config
  - ✅ Dockerfile multi-stage pour Fly.io
  - ✅ appsettings.Production.json prêt

- **Frontend (React 19 + TypeScript + Vite)**
  - ✅ PWA complète avec service worker
  - ✅ Icônes iOS (apple-touch-icon) + Android (192/512 + maskable)
  - ✅ Manifest PWA avec orientation portrait
  - ✅ Responsive : phone (390×844), tablet (820×1180), FHD (1920×1080)
  - ✅ Réglages persistés : langue (FR/EN), terrains (5 thèmes), sons
  - ✅ Animations : discs qui sautent, pions qui tournent en cascade, sons pentatoniques
  - ✅ Contrôles tactiles : glissez verticalement pour retourner le plateau
  - ✅ Bouton discret pour masquer les points d'aide
  - ✅ Guide interactif (6 étapes) avec fenêtre fixe
  - ✅ Vercel config prête avec réécriture d'API

- **Architecture**
  - ✅ Jeu persisté par liste de coups (replay = undo gratuit)
  - ✅ Timeline interactive : remonte au coup N
  - ✅ Joker : 2 positions de démo
  - ✅ IA 3 niveaux (Beginner/Normal/Strong)
  - ✅ Sauvegarde locale (partpartie) avant de quitter
  - ✅ Sons synthétisés (Web Audio, zéro fichiers)

---

## 🎯 Ce qu'il reste (À faire manuellement)

### 1️⃣ **Supabase** — Base de données (5 min)

Crée un compte gratuit et une DB PostgreSQL :

1. Va sur https://supabase.com
2. Sign Up (email)
3. Crée projet `reversi-prod`
4. Attends que la DB se crée (~1 min)
5. **Settings** → **Database** → copie la connection string
   - Cherche celle avec `postgresql://...` et port `5432`
   - Stocke-la en sûr

**Coût** : €0 (500 MB gratuit)  
**Suffisant pour** : ~1000 parties sauvegardées

---

### 2️⃣ **Fly.io** — Serveur API (10 min)

1. Va sur https://fly.io → Sign Up (email ou GitHub)
2. Installe Fly CLI (voir `DEPLOIEMENT.md` pour les commandes)
3. Authentifie-toi : `flyctl auth login`
4. Crée l'app :
   ```bash
   cd C:\Users\amich\Dev\Test\Reversi
   flyctl apps create reversi-api
   ```
5. Ajoute la connection string Supabase comme secret :
   ```bash
   flyctl secrets set -a reversi-api \
     'ConnectionStrings__Reversi=postgresql://[USER]:[PASSWORD]@db.supabase.co:5432/postgres'
   ```
   ⚠️ Remplace `[USER]` et `[PASSWORD]` par tes vrais identifiants Supabase
6. Déploie :
   ```bash
   flyctl deploy -a reversi-api
   ```
7. Attends 2-3 min → tu verras `https://reversi-api.fly.dev`

**Coût** : €0 (3 micro-machines gratuits)  
**Suffisant pour** : ~50 requêtes/jour

---

### 3️⃣ **Vercel** — Frontend (5 min)

1. Va sur https://vercel.com → Sign Up (GitHub recommandé)
2. Push le repo sur GitHub s'il n'y est pas :
   ```bash
   git remote add origin https://github.com/[TON_USER]/Reversi
   git push -u origin main
   ```
3. Vercel : **Add New** → **Project** → choisis `Reversi`
4. Framework : `Other`
5. Root Directory : `Front`
6. Build Command : `npm run build`
7. Output Directory : `dist`
8. Environment Variable :
   ```
   REVERSI_API_URL=reversi-api.fly.dev
   ```
9. **Deploy**

**Coût** : €0 (bandwidth illimité)  
**Suffisant pour** : ~1000 utilisateurs/jour

---

## 🎮 Test final (après déploiement)

### Depuis un PC
```
https://[ton-vercel-domain].vercel.app
```

### Depuis iPhone
1. Safari → https://[ton-vercel-domain].vercel.app
2. Partager → Sur l'écran d'accueil
3. Installe comme app

### Depuis Android
1. Chrome → https://[ton-vercel-domain].vercel.app
2. Menu → Installer l'application
3. Installe comme app

---

## 🔗 URLs finales

| Service | URL |
|---------|-----|
| **Front** | `https://[ton-projet].vercel.app` |
| **API** | `https://reversi-api.fly.dev` (Swagger à `/swagger`) |
| **DB** | Supabase dashboard |

---

## 📝 Fichiers ajoutés côté dev

```
✅ Dockerfile                        → Build de l'API pour Fly.io
✅ .dockerignore                    → Ignore les fichiers inutiles
✅ fly.toml                          → Config Fly.io
✅ Back/Reversi.Api/appsettings.Production.json  → Config prod
✅ Front/vercel.json                → Config Vercel (CORS rewrite)
✅ DEPLOIEMENT.md                   → Instructions détaillées
✅ PRET_A_DEPLOYER.md              → Ce fichier (checklist)
```

---

## 🚀 Commande finale

Une fois que tout est prêt chez les trois services (Supabase prêt, Fly.io configuré, GitHub pushé), tu peux relancer :

```bash
# S'assurer que le dernier code est sur GitHub
git push origin main

# Vercel déploie automatiquement
# Fly.io peut avoir besoin d'un redéploiement manuel:
flyctl deploy -a reversi-api
```

---

## ⚡ Résumé gratuit

| Composant | Service | Gratuit | Limite |
|-----------|---------|---------|--------|
| DB | Supabase | ✅ | 500 MB |
| API | Fly.io | ✅ | 3 instances micro |
| Front | Vercel | ✅ | Illimité |
| **Total** | **3 services** | **€0** | **Généreux pour tester** |

---

## 🎯 Prochaines étapes

1. **Prépare Supabase** : crée le projet, récupère la connection string
2. **Prépare Fly.io** : installe CLI, authentifie-toi, set le secret
3. **Déploie l'API** : `flyctl deploy -a reversi-api`
4. **Prépare Vercel** : connecte GitHub, configure l'env var
5. **Teste sur mobile** : installe l'app sur iOS et Android

**Durée totale** : ~20-30 minutes pour tout prêt et testable.

---

**Tu es prêt ! 🚀**
