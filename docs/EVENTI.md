# Pagina eventi — solo link

File: `public/events/index.html` della v3. Pagina HTML autonoma copiata nella build, senza collegamenti da menu, miniature o sitemap del portfolio.

- Locale (demo): http://127.0.0.1:5173/MatFEPortfolio/v3/events/index.html
- Dopo il deploy: https://greek19.github.io/MatFEPortfolio/v3/events/index.html
- Singolo segnaposto: aggiungere `#evento-01` oppure `#evento-02` al link.

Sono presenti due segnaposto espliciti senza player, miniature fotografiche o video di esempio. Per inserire un video autorizzato sostituire il blocco `.placeholder` della relativa scheda con il player e aggiornare titolo e stato. Mantenere un titolo accessibile sull'iframe e non avviare contemporaneamente più video con audio.

La pagina ha `noindex, nofollow, noarchive`, nessun dato strutturato video e non viene aggiunta alle sitemap. Non è protetta: chi conosce il link può aprirla o condividerla e il sorgente è pubblico su GitHub. Per contenuti riservati occorrono autorizzazione/password e impostazioni Vimeo adeguate, non il solo URL nascosto.

Non aggiungere i video riservati a questa pagina al catalogo pubblico della v3. ATTENZIONE: la sincronizzazione dal profilo importa tutti gli upload pubblici e incorporabili, quindi un evento pubblico su quel profilo potrebbe apparire anche nel portfolio principale. Prima di aggiungere eventi reali, passare alla Showcase pubblica curata oppure introdurre un'esclusione esplicita per ID nel catalogo pubblico. Questa pagina placeholder non modifica la sorgente Vimeo e non aggiunge eventi al feed.

La pagina viene pubblicata con il normale deploy della v3; non compare nella barra delle versioni e non richiede modifiche a v1/v2.
