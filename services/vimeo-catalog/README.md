# Catalogo Vimeo esterno

Worker Cloudflare + KV, separato dal sito. Nessuna dipendenza runtime. Video in streaming da Vimeo; nel servizio solo metadati. Non attivato finché non sono configurati account, KV e secret.

## Attivazione una tantum

Usare Node 24 e Wrangler 4 (`npx wrangler@4 ...`) dalla cartella `services/vimeo-catalog`.

1. Accedere al proprio account Cloudflare Free: `npx wrangler@4 login`.
2. Creare KV: `npx wrangler@4 kv namespace create CATALOG`. Copiare l'ID in `wrangler.toml` al posto del placeholder.
3. Creare un token Vimeo con il minimo scope di lettura pubblico. Se è associato a Matteo lasciare VIMEO_USER_ID vuoto; altrimenti impostare il suo ID numerico. Il servizio verifica che il profilo sia esattamente https://vimeo.com/matteocataldo.
4. Pubblicare il servizio: `npx wrangler@4 deploy`, poi `npx wrangler@4 secret put VIMEO_TOKEN` e inserire il token nel prompt. Non salvarlo nel repository, né nelle variabili VITE_ del frontend.
5. Attendere il primo cron: 03:17 UTC ogni giorno (04:17 inverno / 05:17 estate italiane). Verificare `/catalog.json`: deve rispondere 200 con `total` e `fetchedAt`. Prima della prima sincronizzazione risponde 503 e il sito conserva il catalogo incluso nella build.
6. Impostare `public/catalog-config.json` della v3 con `endpoint: "https://matteo-portfolio-catalog.<account>.workers.dev/catalog.json"` e pubblicare una volta il sito secondo il workflow demo già presente.

Da quel momento gli aggiornamenti dei video non richiedono deploy. La pagina legge il catalogo quando viene aperta/ricaricata; una sessione lasciata aperta non viene interrotta da aggiornamenti in background.

## Frequenza e Showcase

`SYNC_INTERVAL_HOURS` accetta 24, 48 o 168. Il cron resta giornaliero: nei giorni intermedi non interroga Vimeo. Non usare cron `*/2` nel giorno del mese per simulare 48 ore.

Quando disponibile una Showcase, modificare SOLO la configurazione del servizio: SOURCE_MODE="showcase", VIMEO_SHOWCASE_ID="ID_NUMERICO". Ripubblicare la configurazione del Worker, non il portfolio. Il catalogo segue l'ordine manuale della raccolta. Le cache sono separate per sorgente: dopo il cambio il servizio risponde 503 fino al primo sync; pianificare il cambio e verificarlo. Il sito in caso di 503 mostra il fallback storico, quindi non usare questo meccanismo come controllo di accesso.

## Affidabilità e limiti

- Tutte le pagine API sono lette prima di sostituire KV. Errori, rate limit, risposte parziali o raccolta vuota conservano la copia precedente. 40 pagine massime (4.000 voci): al superamento serve rivedere la strategia; nessun troncamento silenzioso.
- Si includono solo video pubblici, disponibili e con embed pubblico. Video limitati a domini, privati, non elencati o con password vengono esclusi. La transcodifica deve essere completata.
- Nessun endpoint pubblico avvia sincronizzazioni; le visite leggono KV e non consumano chiamate Vimeo. Una lettura KV per richiesta; Cache-Control 5 minuti. CORS pubblico perché il catalogo è pubblico, nessuna credenziale frontend.
- KV non scade, per resistere alle interruzioni Vimeo. Non garantisce revoche immediate: rimozioni/privacy si propagano al prossimo sync riuscito. In emergenza disabilitare l'embed anche su Vimeo.
- Quote Free da monitorare in Cloudflare (richieste, letture KV e CPU). La frequenza giornaliera non garantisce gratuità per traffico illimitato. Non viene attivato un piano a pagamento.
- I crediti già verificati e le categorie del sito restano prioritari. Per nuovi video l'editor è ricavato solo se esplicito, il director può richiedere una correzione: non vengono inventati nomi.

## SEO e URL

I nuovi progetti usano `?video=ID` sulla home v3 per evitare 404 su GitHub Pages senza redeploy. Le pagine statiche e sitemap generate alla build non diventano dinamiche con questo servizio; il SEO completo dei nuovi video richiede hosting dinamico o una rigenerazione separata. I metadati dell'interfaccia si aggiornano, ma i social crawler senza JavaScript vedono la home. V1 e V2 restano snapshot di presentazione.

## Test

`node --test services/vimeo-catalog/worker.test.mjs` dalla radice v3. Test con API e KV simulati; nessun token reale richiesto. Per test locale Wrangler usare `.dev.vars` ignorato da Git e `npx wrangler@4 dev --test-scheduled`. Solo in locale, richiamare `/__scheduled` per avviare il cron di prova.
