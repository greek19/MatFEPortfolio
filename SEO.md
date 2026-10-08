# SEO — Matteo Cataldo

## Strategia

La versione pubblica da indicizzare è `/MatFEPortfolio/v3/`. La demo e le versioni precedenti sono presentazioni alternative (`noindex, follow`), non pagine di acquisizione. Non bloccarle con robots.txt: i crawler devono leggere il noindex. Non sono stati aggiunti keyword stuffing, recensioni, premi, localizzazioni o crediti inventati.

## Implementazione

- HTML iniziale con contenuti reali e collegamenti alle 46 pagine progetto, anche senza JavaScript.
- URL progetto stabili, canonical assoluti senza parametri di tema/versione.
- Titoli e descrizioni specifici, Open Graph e Twitter con immagini, alt e nome del portfolio.
- JSON-LD Person, WebSite, CollectionPage/ItemList e VideoObject per ogni filmato.
- Sitemap pagine e sitemap video generate dai dati centralizzati; indice sitemap nel sito demo.
- Player del progetto presente subito nel DOM. L'autoplay Vimeo resta legato alla visibilità.
- Le note originali restano consultabili in “Altre informazioni”, non testo occultato solo per i motori.

## Verifica prima del rilascio

Nella v3: `pnpm lint`, `pnpm build`, `node scripts/check-build.mjs`. Nella demo: `pnpm versions:build`, `pnpm build`. Pubblicare i branch secondo il workflow esistente (demo + v1/v2/v3, avvio da main). Le modifiche locali non aggiornano automaticamente GitHub Pages.

## Dopo il deploy

1. Verificare la proprietà URL-prefix `https://greek19.github.io/MatFEPortfolio/` in Google Search Console con il proprietario. Nessun token di verifica fittizio è incluso.
2. Inviare `https://greek19.github.io/MatFEPortfolio/sitemap.xml` e controllare l'ispezione URL di home e progetti.
3. Eseguire Rich Results Test e controllare nel tempo il report di indicizzazione video, eventuali blocchi Vimeo e Core Web Vitals su mobile.
4. Verificare che il profilo Vimeo e i profili professionali reali rimandino al portfolio pubblico.
5. Confermare biografia, sede Milano e crediti prima del lancio definitivo: alcuni contenuti nascono come placeholder. Le date importate sono quelle di upload, non di produzione; non è stata inventata un'ora di pubblicazione.

## Limiti e sviluppi

`robots.txt` vale solo alla radice dell'host (`https://greek19.github.io/robots.txt`), non nella sottocartella del progetto. Non aggiungere un robots.txt inefficace nella cartella del portfolio. La sitemap può essere inviata direttamente in Search Console.

Il selettore lingua è attualmente uno stato dell'interfaccia, non due URL tradotti. Non sono stati inventati hreflang verso pagine inesistenti. Per posizionarsi anche in inglese occorre una successiva versione con URL `/en/`, contenuti tradotti e hreflang reciproci. About e Contact sono viste interne, non landing page indicizzabili separate.

L'indicizzazione e il posizionamento non sono garantiti dai metadati. Restano determinanti contenuti autentici, link da siti pertinenti, disponibilità degli embed e prestazioni reali. Documentazione: https://developers.google.com/search/docs/appearance/video e https://developers.google.com/search/docs/appearance/structured-data/sd-policies
