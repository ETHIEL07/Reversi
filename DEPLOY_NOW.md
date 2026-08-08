# Déploiement IMMEDIATE — Copier/Coller 

**Tu es déjà connecté à Render et tu as le repo sélectionné. Voici les 8 clics exactes :**

## Étape 1 : Remplir le formulaire (tu as ça déjà affiché)

### Name
```
reversi-api
```

### Branch
```
main
```

### Region
```
Oregon (US West)
```

### Root Directory
*(laisse vide)*

### Instance Type
Sélectionne **Free** (0$/mois, idéal pour test)

---

## Étape 2 : Variables d'environnement

Click **"Add Environment Variable"** et ajoute :

**Variable 1:**
- Key: `ASPNETCORE_ENVIRONMENT`
- Value: `Production`
- Click "Save"

**Variable 2:**
- Key: `ConnectionStrings__Reversi`  
- Value: *(laisse vide pour maintenant, on la liera à la DB après)*
- Click "Save"

---

## Étape 3 : Créer le service

Click le gros bouton **"Create Web Service"** (en bas)

**Attends 3-5 minutes** que le premier build se termine.

Tu verras :
```
=== Building application...
=== Successfully built application
```

---

## Étape 4 : Créer la PostgreSQL

Depuis le dashboard Render (accueil) :
1. Click **"New +"** en haut
2. Click **"PostgreSQL"**
3. Remplis:
   - Name: `reversi-db`
   - Database: `reversi_prod`
   - User: `jmp`
   - Region: Same as reversi-api (Oregon)
   - Plan: **Free**
4. Click **"Create Database"**

**Attends 2 minutes** que la DB soit créée.

---

## Étape 5 : Lier la DB à l'API

Va au service `reversi-api` → Click **"Environment"**

Tu dois modifier la variable `ConnectionStrings__Reversi` :
1. Click sur la variable existante
2. Au lieu de Value vide, copy-paste la **Internal Database URL** (depuis le service `reversi-db`)
3. Save

*(La Internal URL ressemble à `postgresql://jmp:PASSWORD@reversi-db.xxxxxx.render.internal:5432/reversi_prod`)*

Render va redéployer automatiquement.

---

## Étape 6 : Vérifier que c'est UP

Va à: `https://reversi-api.onrender.com/api/version`

Tu dois voir:
```json
{"number":"260808.1332","date":"2026-08-08 13:32","gitVersion":"v1.0.0 - local"}
```

---

## Étape 7 : Update Vercel

Dans ton repo local:

```bash
# Ouvre Front/vercel.json
# Change la destination de:
# "https://activation-penalty-davis-responsibility.trycloudflare.com/api/:path*"
# À:
# "https://reversi-api.onrender.com/api/:path*"

git add Front/vercel.json
git commit -m "Point to Render backend"
git push origin main
```

Vercel redéploiera auto en 1-2 min.

---

## Étape 8 : TEST FINAL 🎮

Va à: https://reversi-psi-two.vercel.app

Click "Jouer" → "Nouvelle partie" → "Ordinateur" → "Commencer la partie"

**C'est fini !** ✅

---

**Notes:**
- Free instances on Render restent **actifs 24/7**, pas de cold start
- La DB est gratuite aussi
- Redéploiement auto chaque fois que tu push sur `main`
- PostgreSQL et API tiennent 12 mois gratuit sur Render

Besoin d'aide sur une étape ? Dis laquelle !
