# Matteo Cataldo — archivio demo

Il branch `demo` contiene la barra di confronto e il selettore delle palette. Le implementazioni restano separate nei branch `v1`, `v2` e `v3`; non sono fuse in un unico sorgente.

## Versioni

- **V1 — Editoriale:** portfolio chiaro e lineare, conservato.
- **V2 — Sperimentale:** collage, archivio Experience / Index, conservato.
- **V3 — Portfolio essenziale:** 46 video pubblici da Vimeo, categorie a scomparsa, viste Lavori / About / Contact senza scorrimento tra sezioni, crediti essenziali e pagine SEO dedicate. Nessuna ricerca o componente AI.

Il manifest `public/demo-versions.json` stabilisce versioni, branch e ordine. La demo apre le build sullo stesso dominio, anche in locale: non carica più le vecchie versioni online.

## Avvio locale

Node 24 e pnpm. Le tre copie di lavoro sono nella cartella sorella `MatFEPortfolio-versions`:

```text
MatFEPortfolio/                branch demo
MatFEPortfolio-versions/v1/     branch v1
MatFEPortfolio-versions/v2/     branch v2
MatFEPortfolio-versions/v3/     branch v3
```

Per ricrearle su un'altra macchina, dal repository:

```bash
git worktree add ../MatFEPortfolio-versions/v1 v1
git worktree add ../MatFEPortfolio-versions/v2 v2
git worktree add ../MatFEPortfolio-versions/v3 v3
pnpm install --frozen-lockfile
pnpm --dir ../MatFEPortfolio-versions/v1 install --frozen-lockfile
pnpm --dir ../MatFEPortfolio-versions/v2 install --frozen-lockfile
pnpm --dir ../MatFEPortfolio-versions/v3 install --frozen-lockfile
pnpm versions:build
pnpm dev
```

Aprire `http://localhost:5173/MatFEPortfolio/?version=v3`. È possibile passare un percorso diverso a `pnpm versions:build PERCORSO_WORKTREE`. Dopo modifiche a una versione, ripetere `versions:build` e ricaricare il browser. Le cartelle generate `public/v1`, `public/v2`, `public/v3` sono ignorate da Git. Per sviluppare una singola versione con hot reload usare `pnpm dev` nella sua cartella.

## Palette condivise

`src/themes.ts` è la sorgente delle sei palette; `src/theme.css` contiene le correzioni dei componenti esistenti. Eseguire `pnpm themes:sync` dopo averle modificate per copiarle nelle tre versioni. Ogni versione importa questi file dal proprio `main.tsx`, quindi funziona anche da sola.

Il tema originale conserva i colori propri di ciascuna versione. Le altre palette cambiano carta, inchiostro, accento e dettagli. La scelta persiste in localStorage (se disponibile), passa agli iframe tramite messaggi validati per origine e mittente e può essere condivisa con `?version=v2&theme=orange`. L'apertura a schermo intero conserva il tema.

### Riferimenti cromatici (ricerca settembre 2026)

Interpretazioni per il web, non codici ufficiali né una classifica di popolarità:

- **Cosmic Orange:** ispirato alla finitura [iPhone 17 Pro di Apple](https://support.apple.com/en-my/125090).
- **Transformative Teal:** ispirato al [colore 2026 di WGSN e Coloro](https://www.wgsn.com/de/blog/die-farbe-des-jahres-2026-transformative-teal).
- **Cloud Dancer:** ispirato al [colore 2026 Pantone](https://www.pantone.com/na/en-us/color-of-the-year/2026).
- **Electric Blue** e **Plum / Butter:** proposte editoriali complementari.

I test verificano il contrasto dei token di testo: inchiostro/carta >= 7:1, inchiostro/accento e dettaglio/carta >= 4.5:1. Non equivalgono a un audit di accessibilità completo dei vecchi layout.

## Verifiche

```bash
pnpm lint
pnpm test
pnpm build
```

Ripetere questi controlli nei singoli worktree. La V3 ha test per completezza dei video, crediti, sicurezza dei metadati e pagine SEO; `node scripts/check-build.mjs` nella V3 verifica tutte le 46 pagine generate.

## GitHub Pages

Il workflow della demo parte su push di `demo` o `main`, oppure manualmente selezionando il branch `demo`. Recupera il branch demo e i branch configurati dal remoto, compila ogni versione con base `/MatFEPortfolio/vN/` e pubblica un unico artefatto. Settings → Pages → Source deve essere GitHub Actions.

Prima di un deploy pubblicare i cambiamenti di **tutti** i branch versione, quindi il branch demo. Un push soltanto a v1/v2/v3 non ricostruisce la demo: avviare poi manualmente il suo workflow o pubblicare una modifica alla demo. Non è necessario unire V3 in main.

Le versioni sono raggiungibili anche direttamente a `/MatFEPortfolio/v1/`, `/v2/`, `/v3/`. In locale la demo usa esplicitamente `index.html` per evitare il fallback SPA di Vite.

Per aggiungere V4: creare il branch, aggiungere il manifest, importare il ponte temi, aggiornare `themes:sync` e `.gitignore`, pubblicare il branch e ricostruire la demo. Nessun CMS o server necessario.
