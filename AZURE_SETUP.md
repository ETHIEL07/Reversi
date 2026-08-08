# Déploiement Azure pour Reversi

## Phase 1 : Créer un compte Azure Free Tier

1. **Ouvre** https://azure.microsoft.com/free/
2. **Connexion** avec `jmpironneau@gmail.com` (crée le compte si besoin)
3. **Valide** avec une carte bancaire (pour la verification, pas de charge pour Free Tier)
4. **Note** ton **Subscription ID** (visible dans le portail Azure)

## Phase 2 : Créer les ressources

### 2a. Resource Group
```bash
az group create \
  --name reversi-rg \
  --location eastus
```

### 2b. PostgreSQL Flexible Server
```bash
az postgres flexible-server create \
  --resource-group reversi-rg \
  --name reversi-db \
  --admin-user jmp \
  --admin-password "Piro2026!" \
  --database-name Reversi_prod \
  --tier Burstable \
  --sku-name Standard_B1ms \
  --storage-size 32 \
  --public-access 0.0.0.0 \
  --version 18
```

### 2c. App Service Plan
```bash
az appservice plan create \
  --name reversi-plan \
  --resource-group reversi-rg \
  --sku F1 \
  --is-linux
```

### 2d. Web App (App Service)
```bash
az webapp create \
  --resource-group reversi-rg \
  --plan reversi-plan \
  --name reversi-api \
  --deployment-container-image-name-user $GITHUB_USERNAME \
  --deployment-container-image-name reversi/api \
  --deployment-container-image-tag latest
```

### 2e. Variables d'environnement de l'App Service
```bash
az webapp config appsettings set \
  --resource-group reversi-rg \
  --name reversi-api \
  --settings \
    ASPNETCORE_ENVIRONMENT=Production \
    "ConnectionStrings__DefaultConnection=Host=reversi-db.postgres.database.azure.com;Database=Reversi_prod;Username=jmp@reversi-db;Password=Piro2026!;Port=5432;SSL Mode=Require;"
```

## Phase 3 : GitHub Secrets

1. **Ouvre** https://github.com/ETHIEL07/Reversi/settings/secrets/actions
2. **Crée** ces secrets :
   - `AZURE_APP_NAME` = `reversi-api`
   - `AZURE_PUBLISH_PROFILE` = (télécharge depuis Azure Portal)

### Comment obtenir le Publish Profile :
1. Va dans **Azure Portal** → **App Service** → **reversi-api**
2. Click **Download publish profile** (bouton en haut)
3. Copie tout le contenu du fichier XML
4. Crée le secret `AZURE_PUBLISH_PROFILE` avec ce contenu

## Phase 4 : Configurer Vercel

Mets à jour `Front/vercel.json` :
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://reversi-api.azurewebsites.net/api/:path*"
    }
  ]
}
```

## Phase 5 : Push et déploiement

```bash
git add .
git commit -m "Add Azure deployment and Docker support"
git push origin main
```

GitHub Actions va automatiquement déployer sur Azure.

---

## Vérification

Après quelques minutes (GitHub Actions build + Azure déploie) :
```bash
curl https://reversi-api.azurewebsites.net/api/version
```

Visite https://reversi-psi-two.vercel.app/ et teste "Nouvelle partie" 🎮
