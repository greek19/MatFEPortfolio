# MatFEPortfolio — Demo archive

Il branch `demo` contiene esclusivamente il contenitore di presentazione usato per confrontare le diverse direzioni del portfolio. Le implementazioni originali restano isolate nei branch `v1`, `v2` e successivi.

## Struttura pubblicata

```text
/MatFEPortfolio/       barra di confronto
/MatFEPortfolio/v1/    build del branch v1
/MatFEPortfolio/v2/    build del branch v2
```

La versione scelta viene caricata sotto la barra senza modificare il codice del relativo branch. Il parametro `?version=v1` permette inoltre di condividere direttamente una specifica variante.

## Aggiungere una nuova versione

1. Creare e pubblicare il nuovo branch, per esempio `v3`.
2. Aggiungere una voce a `public/demo-versions.json`:

```json
{
  "id": "v3",
  "branch": "v3",
  "label": "Versione 03",
  "description": "Direzione sintetica"
}
```

3. Aggiornare `main` allo stesso commit di `demo` e pubblicare `main`.

Il workflow legge la configurazione, recupera ogni branch elencato, crea le build con i rispettivi percorsi e pubblica l'archivio completo su GitHub Pages.

## Avvio locale

```bash
pnpm install
pnpm run dev
```

Durante lo sviluppo locale il contenitore carica le versioni dall'indirizzo GitHub Pages già pubblicato. La build del contenitore si verifica con:

```bash
pnpm run lint
pnpm run build
```

## Deploy

Il workflow `.github/workflows/deploy.yml` parte a ogni push sul branch `main` e può essere avviato anche manualmente. `main` rispecchia il contenitore pubblicato, mentre `demo` ne conserva la linea di sviluppo separata. Il repository deve utilizzare **Settings → Pages → Source → GitHub Actions**.
