# MatFEPortfolio

MVP bilingue (italiano/inglese) per il portfolio di un film editor e videomaker. Il concept unisce timeline astratta, cinema editoriale e archivio sperimentale, con un playhead/timecode come firma visiva.

## Avvio locale

Richiede Node.js 20 o superiore.

```bash
pnpm install
pnpm run dev
```

Il terminale mostrerà l'indirizzo locale da aprire nel browser.

## Verifiche e build

```bash
pnpm run lint
pnpm run test
pnpm run build
pnpm run preview
```

La build statica viene generata nella cartella `dist`.

## Gestione dei contenuti

I contenuti sostituibili sono centralizzati in `src/data.ts`:

- `copy`: testi dell'interfaccia in italiano e inglese;
- `categoryLabels`: nomi tradotti delle categorie;
- `projects`: elenco dei progetti, metadati, ruoli, descrizioni e riferimenti video.

Ogni progetto accetta un provider `vimeo` o `youtube` e il relativo ID. I player vengono caricati soltanto all'apertura del progetto. Per sostituire l'identità provvisoria, aggiornare anche titolo e descrizione in `index.html`, indirizzo e-mail e link social in `src/App.tsx`.

I colori `tone` dei progetti alimentano i placeholder visuali e possono essere mantenuti come colore dominante del progetto anche quando verranno aggiunti poster o preview reali.

## GitHub Pages

`vite.config.ts` usa il base path `/MatFEPortfolio/`, coerente con il repository `greek19/MatFEPortfolio`.

Il workflow `.github/workflows/deploy.yml`:

1. parte a ogni push sul branch `main` oppure manualmente;
2. installa le dipendenze;
3. crea la build;
4. pubblica `dist` su GitHub Pages.

Nel repository GitHub, impostare **Settings → Pages → Source → GitHub Actions**. Nessun backend o CMS è richiesto.

## Struttura

```text
src/
  App.tsx       interfaccia e interazioni
  data.ts       contenuti bilingui e progetti
  types.ts      struttura dei dati
  styles.css    design system, responsive e reduced motion
```

## Prestazioni e accessibilità

- player Vimeo/YouTube caricati solo su richiesta;
- iframe con lazy loading;
- nessun autoplay con audio;
- layout specifici desktop e mobile;
- navigazione da tastiera e collegamento “salta al contenuto”;
- supporto a `prefers-reduced-motion`;
- animazioni principali realizzate con CSS, senza WebGL nell'MVP.

## Passi successivi

- sostituire identità, biografia, contatti e link social;
- inserire i progetti e gli ID video reali;
- aggiungere poster WebP/AVIF e brevi preview WebM/MP4 ottimizzate;
- aggiungere ritratto e materiali di backstage;
- eseguire una revisione contenuti e accessibilità con i dati definitivi.
