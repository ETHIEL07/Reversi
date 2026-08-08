# Déploiement Render.com — 3 minutes ⚡

Render est 100x plus simple qu'Azure. Tout est automatique une fois autorisé.

## Étape 1 : Autoriser Render → GitHub

1. Va à https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Sélectionne "Deploy an existing repository from GitHub"
4. Autorise Render à accéder à ton GitHub (`ETHIEL07/Reversi`)
5. Sélectionne `Reversi` repo

## Étape 2 : Configurer le service

| Champ | Valeur |
|-------|--------|
| **Name** | `reversi-api` |
| **Repository** | `ETHIEL07/Reversi` |
| **Branch** | `main` |
| **Runtime** | `Docker` |
| **Build Command** | (laisse vide, Dockerfile s'auto-détecte) |
| **Start Command** | (laisse vide) |
| **Plan** | `Free` |

## Étape 3 : Variables d'environnement

Click "Advanced" → "Add Environment Variable" :

```
ASPNETCORE_ENVIRONMENT = Production
```

## Étape 4 : Créer la PostgreSQL

Depuis le dashboard Render :
1. "New +" → "PostgreSQL"
2. **Name** : `reversi-db`
3. **Database** : `reversi_prod`
4. **User** : `jmp`
5. **Region** : Same as web service
6. **Plan** : Free
7. Click "Create Database"

Une fois créée, copie la "Internal Database URL" (sera utilisée auto).

## Étape 5 : Lier la DB au service web

Back sur le service `reversi-api` :
1. Scroll à "Environment Variables"
2. Click "Add from Database" 
3. **Name** : `ConnectionStrings__Reversi`
4. **Database** : `reversi-db`
5. **Property** : `Full Connection String`
6. Save

Render va redéployer auto avec la DB.

## Étape 6 : Vérifier

Après 2-3 min (le premier build peut être lent), va à :
```
https://reversi-api.onrender.com/api/version
```

Tu devrais voir:
```json
{
  "number": "260808.1332",
  "date": "2026-08-08 13:32",
  "gitVersion": "v1.0.0 - local"
}
```

## Étape 7 : Mettre à jour Vercel

Va à https://vercel.com/ETHIEL07/reversi/settings et mets à jour `Front/vercel.json` :

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://reversi-api.onrender.com/api/:path*"
    }
  ]
}
```

Push le change :
```bash
git add Front/vercel.json
git commit -m "Point API to Render backend"
git push origin main
```

Vercel redéploiera auto.

## Étape 8 : Tester

Va à https://reversi-psi-two.vercel.app et teste "Nouvelle partie" 🎮

---

**Voilà !** Tout tourne en permanence, 24/7, gratuit. C'est fini. 🚀
