# ⚡ RISOLVI ERRORE RENDER SUBITO

## 🎯 Il Tuo Problema

```
error: "/.env": not found
```

Render sta usando il **branch sbagliato** con il vecchio Dockerfile.

---

## ✅ SOLUZIONE VELOCE (5 minuti)

### Passo 1: Vai su Render
Apri: https://dashboard.render.com

### Passo 2: Seleziona il Tuo Servizio
Click sul servizio "Mirage" o come lo hai chiamato

### Passo 3: Settings
Click su **"Settings"** nel menu a sinistra

### Passo 4: Trova "Branch"
Scorri giù fino a trovare la sezione **"Build & Deploy"**

### Passo 5: Cambia Branch
Nel campo **"Branch"**, cambia da qualsiasi cosa ci sia a:
```
claude/update-product-branding-011CUNQYy3n6F399qiQwDikm
```

### Passo 6: Salva
Click **"Save Changes"** in fondo alla pagina

### Passo 7: Deploy
1. Torna alla dashboard principale del servizio
2. Click **"Manual Deploy"** in alto a destra
3. Seleziona **"Clear build cache & deploy"**
4. ✅ FATTO!

---

## 🎬 Screenshot Guida

### Dove trovare Branch Setting:

```
Dashboard Render
└── [Tuo Servizio]
    └── Settings (menu sinistra)
        └── Build & Deploy section
            └── Branch: [cambia qui]
```

---

## 🔄 ALTERNATIVA: Usa Script Automatico

Se preferisci, puoi usare lo script che ho creato:

```bash
# Dalla root del progetto
./scripts/deploy-to-main.sh
```

Lo script ti guiderà per:
- ✅ Creare o aggiornare il branch main
- ✅ Fare merge del codice aggiornato
- ✅ Pushare tutto

Poi su Render:
- Cambia branch a `main`
- Deploy con clear cache

---

## ❓ Come Verificare se ha Funzionato

Dopo il deploy, controlla i logs:

1. Dashboard → Logs
2. Cerca questa riga:
   ```
   Checking out branch: claude/update-product-branding-011CUNQYy3n6F399qiQwDikm
   ```
   O:
   ```
   Checking out branch: main
   ```

3. NON dovresti vedere:
   ```
   COPY .env .env  ❌
   ```

4. Se vedi:
   ```
   # IMPORTANT: DO NOT copy .env files!  ✅
   ```
   Significa che sta usando il Dockerfile corretto!

---

## 🆘 Se Ancora Non Funziona

Prova questi comandi sul tuo computer:

```bash
# Verifica che le modifiche siano state pushate
git log --oneline -3

# Dovresti vedere:
# 8984dd9 fix: resolve Render deployment cache issue...
# 5ab2caa fix: resolve Docker build error...
# a767da1 feat: rebrand to Mirage...
```

Se li vedi, il problema è SOLO su Render (branch sbagliato).

---

## 📞 Contattami

Se dopo questi step ancora non funziona, fammi sapere:
- Screenshot delle impostazioni Render (Settings → Branch)
- Logs del deploy (ultime 50 righe)
