# Matteo Cataldo — V3 / Portfolio essenziale

Video in primo piano, miniature scorrevoli, una fascia con artista/cliente e titolo. Nessuna hero, titolo «Lavori», introduzione, ricerca o componente AI. About e Contact sono viste accessibili dal menu, non sezioni raggiunte scorrendo.

## Avvio e verifiche

Node 24 e pnpm:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm test
pnpm build
node scripts/check-build.mjs
```

Base `/MatFEPortfolio/v3/`, compatibile con la demo multi-versione. Per aggiornare l'anteprima completa eseguire `pnpm versions:build` nella cartella `MatFEPortfolio`, poi ricaricare la demo. Nessun push automatico.

## Tutti i video pubblici

Importazione del 16 settembre 2026: **46/46 video caricati pubblicamente** su [Vimeo Matteo Cataldo](https://vimeo.com/matteocataldo). Inclusi teaser, backstage e filmati completi distinti. Non sono importati i video soltanto apprezzati o le apparizioni su profili altrui. I filmati sono incorporati da Vimeo, non scaricati.

- `src/content/vimeo.json`: metadati pubblici, data importazione e conteggio del profilo.
- `scripts/import-vimeo.mjs`: recupera tutte le pagine e verifica il totale; non sovrascrive i dati se incompleto. Oltre 60 upload richiede l'API ufficiale autenticata, senza troncare i risultati.
- `src/content/overrides.ts`: classificazione editoriale e crediti verificati, separati dall'importazione.
- `src/data.ts`: normalizzazione, estrazione del credito editor solo quando dichiarato, copy IT/EN.

```bash
pnpm content:import
pnpm test
pnpm build
```

Le descrizioni assenti non diventano crediti presunti: compaiono trattini con etichetta accessibile «Non indicato su Vimeo». Completare `editor` / `director` negli override dopo conferma di Matteo. I crediti collettivi restano collettivi. La data Vimeo è la **data di caricamento**, non l'anno di realizzazione. Le categorie si basano sui progetti presenti; per nuovi video rivedere la classificazione negli override.

## Interfaccia

- Categorie in menu richiudibile al clic esterno, Escape o selezione.
- Vista cinema o griglia; tutte le 46 miniature rimangono raggiungibili.
- Scheda: titolo/brano, artista o cliente, editor e director. Durata, data Vimeo, contributi aggiuntivi e note originali in «Altre informazioni», inizialmente chiuso.
- Vimeo con avvio muto a riquadro visibile, pausa al clic, audio, minutaggio e fullscreen. YouTube supportato dal player.
- Dialog nativo, tastiera, focus, reduced motion e immagini lazy-loaded. Rimossi dipendenza e download dei modelli AI.
- La pagina esterna non scorre; miniature, griglia e schede lunghe hanno scorrimento interno. Nelle viewport molto basse lo scorrimento interno evita contenuti irraggiungibili.

## SEO

La build genera **46 pagine HTML** in `dist/work/<slug>/index.html`, oltre alla home. Gli URL funzionano con refresh e accesso diretto su GitHub Pages; le normali aperture dal portfolio usano la scheda video senza ricaricare la pagina.

Ogni pagina contiene nella risposta HTML titolo, descrizione, canonical, Open Graph/X, immagine del proprio video e `VideoObject` con durata, data di upload, poster e URL embed. La home include `ItemList` e link a tutti i progetti anche senza JavaScript. Nessun keyword stuffing: l'unico titolo visivamente nascosto serve all'accessibilità; i dati aggiuntivi sono consultabili nel dettaglio richiudibile.

`dist/sitemap.xml`: 47 URL. Dopo il deploy inviare `https://greek19.github.io/MatFEPortfolio/v3/sitemap.xml` a Search Console. Indicizzazione e rich result non sono garantiti e vanno verificati online. Le pagine statiche sono in italiano, l'interfaccia può passare all'inglese; non viene dichiarato un hreflang fittizio per pagine inglesi non generate.

Riferimenti: [Google VideoObject](https://developers.google.com/search/docs/appearance/structured-data/video), [SEO JavaScript](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Temi e deploy

Le palette condivise restano compatibili con demo/V1/V2. Modificarne la sorgente nel branch demo ed eseguire `pnpm themes:sync` per propagarle.

Pubblicare tramite il workflow del branch **demo**, che compila tutte le versioni nei rispettivi percorsi. Il vecchio workflow standalone non deve sostituire la root di Pages. Nessun CMS, backend o servizio AI richiesto.
