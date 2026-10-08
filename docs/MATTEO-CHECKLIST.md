# Portfolio — cosa chiedere a Matteo

Aggiornato l'8 ottobre 2026.

## Da fare adesso

- [ ] Confermare il profilo sorgente: https://vimeo.com/matteocataldo.
- [ ] Confermare che tutti gli upload pubblici e incorporabili possano comparire nel portfolio fino alla creazione della Showcase.
- [ ] Concordare la gestione del token API: creato da Matteo, oppure dal responsabile tecnico per leggere esclusivamente dati pubblici.
- [ ] Verificare che i video selezionati siano pubblici e incorporabili. Il servizio attuale esclude video privati, non elencati, con password, limitati a determinati domini o ancora in elaborazione.

## Il token è indispensabile?

Per il servizio automatico che abbiamo preparato, **sì: serve un token dell'API ufficiale Vimeo**. Non è però necessariamente un token personale fornito da Matteo.

- **Opzione A — token di Matteo:** Matteo crea un token autenticato associato al suo account, con il solo accesso pubblico di lettura. Il servizio usa `/me` e verifica che il profilo sia quello corretto. È la configurazione predisposta attualmente.
- **Opzione B — nessun token da chiedere a Matteo:** il responsabile tecnico crea una propria app Vimeo e un token “Unauthenticated”, per soli metadati pubblici. Si configura nel servizio l'ID numerico del profilo di Matteo, anziché `/me`. Da verificare sull'account e sulla futura raccolta pubblica prima dell'attivazione. Unauthenticated significa non associato all'utente, NON assenza di token.
- **Senza alcun token:** si può mantenere l'elenco manuale oppure usare un embed Vimeo preconfezionato, con le relative limitazioni di interfaccia. Non soddisfa la sincronizzazione API personalizzata preparata. Non utilizzeremo scraping o endpoint legacy come base della nuova automazione.

Non servono password dell'account, permessi di upload, modifica, cancellazione o accesso ai video privati. Non serve un token distinto per la Showcase se lo stesso token può leggerla.

## Come creare il token (opzione A)

1. Accedere con l'account Vimeo di Matteo a https://developer.vimeo.com/apps.
2. Creare un'app per l'integrazione del portfolio, compilando i campi richiesti in modo veritiero. Se l'app esiste già, aprirla.
3. Aprire la sezione di autenticazione / Personal Access Tokens.
4. Selezionare “Authenticated (you)” per collegare il token al profilo di Matteo.
5. Abilitare soltanto lo scope pubblico di lettura (`public`). Non abilitare `private`, `edit`, `delete`, `upload` o altre capacità non richieste.
6. Generare il token e conservarlo in modo sicuro. Se la schermata propone permessi differenti, fermarsi e verificarli con il responsabile tecnico.
7. Inserirlo direttamente nel servizio Cloudflare come segreto `VIMEO_TOKEN`, oppure consegnarlo al responsabile tecnico tramite un gestore di password con condivisione protetta. Mai inserirlo in questo documento, in GitHub, in chat o nel codice frontend. Non condividere la password Vimeo.

Cloudflare: Workers & Pages → matteo-portfolio-catalog → Settings → Variables and Secrets → Add → tipo Secret → nome VIMEO_TOKEN. Serve accesso autorizzato all'account Cloudflare; non condividere il login per questa operazione.

## Showcase — da preparare successivamente

- [ ] Creare una raccolta “Portfolio — Matteo Cataldo”.
- [ ] Inserire soltanto i video da mostrare sul sito.
- [ ] Impostare la raccolta pubblica per la configurazione prevista.
- [ ] Ordinare i video secondo la priorità desiderata.
- [ ] Comunicarci il link della Showcase e il piano Vimeo utilizzato.

**A cosa serve:** separa i lavori del portfolio dagli altri upload; permette a Matteo di aggiungere, rimuovere e ordinare i progetti direttamente su Vimeo senza modificare il sito. Rimuovere un video dalla raccolta non lo elimina dalla libreria Vimeo. Pubblicare un nuovo video sul profilo non lo aggiunge automaticamente alla raccolta: andrà inserito nella Showcase.

**Come crearla:** Library → Showcases → New showcase (oppure +Create → Showcase), scegliere nome e privacy, poi Add videos. Per l'ordine: Layout → Video grid → Content → Custom. Secondo la documentazione attuale la creazione è inclusa in tutti i piani; alcune funzioni, come l'embed della playlist, hanno requisiti diversi. Il nostro sito legge i dati via API, non incorpora la playlist preconfezionata. L'ordinamento personalizzato ha un limite documentato oltre 100 video.

Quando sarà pronta, cambieremo sorgente e ID nella configurazione Cloudflare. Non occorrerà riscrivere il portfolio o generare un nuovo token se quello esistente ha già accesso. Effettueremo una verifica prima del cambio.

## Dati dei lavori e contenuti da confermare

- [ ] Titolo del progetto e artista/nome canzone per i videoclip; cliente per gli altri lavori.
- [ ] Editor e director corretti, senza attribuzioni implicite. Preferire righe chiare nella descrizione: “Editor: …”, “Director: …”.
- [ ] Categoria desiderata: musica, film, brand, social, backstage o personale. Attualmente alcune categorie/crediti sono correzioni locali; non tutto viene dedotto automaticamente da Vimeo.
- [ ] Miniatura scelta per ogni video e autorizzazione a mostrarlo sul portfolio.
- [ ] Biografia, sede, recapito pubblico e collegamenti professionali definitivi: confermare o sostituire i placeholder.

## Cosa aspettarsi

Il controllo è giornaliero (03:17 UTC). Dopo la prima attivazione non serve un deploy per ogni nuovo video. La pagina va aperta o ricaricata per ricevere l'elenco aggiornato. In caso di errore il servizio conserva l'ultima copia valida; il sito ha anche un fallback incorporato. Le rimozioni non sono immediate: per urgenze revocare l'embed su Vimeo e avvisare il responsabile tecnico.

Il servizio Cloudflare è predisposto/pubblicato, ma l'importazione reale resta in attesa del token. Finché manca, il portfolio mostra i contenuti già disponibili. Il piano gratuito ha quote da monitorare; un aggiornamento al giorno non equivale a traffico illimitato.

Le pagine SEO statiche e le sitemap dei nuovi video non vengono generate da questo servizio: il loro aggiornamento dinamico resta un intervento separato.

## Guide ufficiali

- Token: https://help.vimeo.com/hc/en-us/articles/12427789081745-How-to-generate-a-personal-access-token
- Creare una Showcase: https://help.vimeo.com/hc/en-us/articles/12426259177105-How-to-create-a-showcase
- Aggiungere video: https://help.vimeo.com/hc/en-us/articles/15004749856529-How-to-add-videos-to-a-showcase
- Ordinamento e rimozione: https://help.vimeo.com/hc/en-us/articles/15004751322129-How-to-customize-videos-in-my-showcase
