# 🚀 Déploiement Reversi — 100% GRATUIT

**Temps estimé** : 20 minutes (juste des clics)  
**Coût** : €0  
**Cible** : iOS + Android testables en ligne

---

## 🎯 Architecture finale

```
┌─────────────────────┐
│  Supabase (DB)      │  PostgreSQL gratuit
│  30 projets × 500MB │
└──────────┬──────────┘
           │
           │ (connexion)
           ↓
┌─────────────────────┐
│  Fly.io (API .NET)  │  Serveur gratuit (micro)
│  3 instances gratis │  reversi-api.fly.dev
└──────────┬──────────┘
           │ (https)
           ↓
┌─────────────────────┐
│  Vercel (Front)     │  React PWA
│  GitHub sync        │  reversi.vercel.app
└─────────────────────┘
```

---

## 📋 TO-DO MANUEL (juste pour toi)

### **ÉTAPE 1 : Supabase — Base de données**

1. Va sur https://supabase.com → **Sign Up** (email)
2. Choisis **France** (région)
3. Crée un projet `reversi-prod`
4. Attends 1 min que la DB se crée
5. Va sur **Settings** → **Database** → copie la **Connection String** (le lien `postgresql://...`)
   - C'est celle avec port `5432`, pas 6543
   - Stocke-la en sûr → tu la colleras dans Fly.io

**✅ Fait : Supabase prêt**

---

### **ÉTAPE 2 : Fly.io — Serveur API**

1. Va sur https://fly.io → **Sign Up** (email ou GitHub)
2. Installe Fly CLI : https://fly.io/docs/hands-on/install-flyctl/
   ```bash
   # Windows: choco install flyctl
   # macOS: brew install flyctl
   # Linux: curl -L https://fly.io/install.sh | sh
   ```
3. Authentifie-toi :
   ```bash
   flyctl auth login
   ```
4. Clone le repo localement s'il ne l'est pas déjà :
   ```bash
   cd C:\Users\amich\Dev\Test\Reversi
   ```
5. Crée l'app sur Fly (une seule fois) :
   ```bash
   flyctl apps create reversi-api
   ```
6. Ajoute la connection string Supabase comme secret :
   ```bash
   flyctl secrets set -a reversi-api \
     'ConnectionStrings__Reversi=postgresql://[USER]:[PASSWORD]@db.supabase.co:5432/postgres'
   ```
   ⚠️ Remplace `[USER]:[PASSWORD]` par tes vrais identifiants Supabase
7. Déploie l'API :
   ```bash
   flyctl deploy -a reversi-api
   ```
   - Ça va builder le Dockerfile et déployer
   - Attends 2-3 min
8. Quand c'est terminé, tu verras : `Visit your app at https://reversi-api.fly.dev`

**✅ Fait : API sur Fly.io en direct**

---

### **ÉTAPE 3 : Vercel — Frontend**

1. Va sur https://vercel.com → **Sign Up** (GitHub recommandé)
2. Push ton repo GitHub s'il n'y est pas :
   ```bash
   git remote add origin https://github.com/[TON_USER]/Reversi
   git push -u origin main
   ```
3. Sur Vercel : **Add New** → **Project** → choisis le repo `Reversi`
4. **Framework** : `Other` (il va détecter Vite)
5. **Root Directory** : `Front`
6. **Build Command** : `npm run build`
7. **Output Directory** : `dist`
8. **Environment Variables** :
   ```
   REVERSI_API_URL=reversi-api.fly.dev
   ```
9. **Deploy** → attends 1 min

**✅ Fait : Front sur Vercel**

---

## 🎮 Test en ligne

### **Depuis un ordinateur** :
- Ouvre https://[ton-projet].vercel.app

### **Depuis iPhone** :
1. Ouvre Safari
2. Va sur https://[ton-projet].vercel.app
3. Touche **Partager** → **Sur l'écran d'accueil**
4. Ça s'installe comme app native

### **Depuis Android** :
1. Ouvre Chrome
2. Va sur https://[ton-projet].vercel.app
3. Menu (trois points) → **Installer l'application**
4. Ça s'installe

---

## ⚡ URLs finales

- **Front** : `https://[ton-projet].vercel.app`
- **API** : `https://reversi-api.fly.dev/swagger` (Swagger UI pour tester les endpoints)
- **DB** : Supabase dashboard (tu peux voir les tables)

---

## 🛠️ Troubleshooting

### API répond 502 Bad Gateway
→ Vérifie que la connection string est bonne dans Fly.io :
```bash
flyctl secrets list -a reversi-api
```

### Front dit "API unavailable"
→ Attends 2 min (Fly.io cold boot), puis actualise

### PWA install ne s'affiche pas
→ Normal sur desktop. Sur téléphone, c'est automatique après 5 sec

---

## 📊 Limites gratuites (largement suffisant pour tester)

| Service | Limite | Pour Reversi |
|---------|--------|-------------|
| **Supabase** | 500 MB | ✅ Jeu = ~1 MB de DB |
| **Fly.io** | 3 micro machines gratuits | ✅ 1 suffit |
| **Vercel** | Bandwidth illimité | ✅ PWA = 2-3 MB |

---

## 🚨 IMPORTANT pour la première fois

Avant de déployer, **fais un commit git** avec tout ce qui change :

```bash
git add .
git commit -m "Configure prod deployment: Dockerfile, appsettings.Production, fly.toml, vercel.json"
git push
```

C'est ce commit que Vercel va déployer automatiquement.

---

**Prêt ? Lance les commandes Fly.io et c'est parti ! 🚀**
