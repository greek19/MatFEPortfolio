import type { Category, Lang, Project } from './types'

export const copy = {
  it: {
    nav: { work: 'Lavori', about: 'Profilo', contact: 'Contatti' },
    role: 'Editor & Colorist',
    intro: 'Montaggio, colore e ritmo per musica, film e immagini in movimento.',
    viewWork: 'Seleziona lavori',
    selected: 'Lavori selezionati',
    sequence: 'Sequenza',
    index: 'Indice',
    all: 'Tutti',
    view: 'Apri progetto',
    close: 'Chiudi',
    overview: 'Progetto',
    contribution: 'Ruolo',
    watch: 'Guarda su Vimeo',
    aboutTitle: 'Il montaggio è il punto in cui le immagini cominciano a respirare.',
    aboutBody: 'Matteo Cataldo è un editor e colorist. Lavora tra videoclip, cinema e contenuti di marca, cercando per ogni progetto la sua cadenza visiva.',
    aboutMeta: 'Milano, Italia · Disponibile worldwide',
    contactTitle: 'Per parlare di un progetto, scrivi a Matteo.',
    email: 'Contatti',
    menu: 'Menu',
  },
  en: {
    nav: { work: 'Work', about: 'About', contact: 'Contact' },
    role: 'Editor & Colorist',
    intro: 'Editing, colour and rhythm for music, film and moving images.',
    viewWork: 'Selected work',
    selected: 'Selected work',
    sequence: 'Sequence',
    index: 'Index',
    all: 'All',
    view: 'Open project',
    close: 'Close',
    overview: 'Project',
    contribution: 'Role',
    watch: 'Watch on Vimeo',
    aboutTitle: 'Editing is where images begin to breathe.',
    aboutBody: 'Matteo Cataldo is an editor and colourist. He works across music videos, film and branded work, searching for each project’s own visual cadence.',
    aboutMeta: 'Milan, Italy · Available worldwide',
    contactTitle: 'To discuss a project, get in touch with Matteo.',
    email: 'Contact',
    menu: 'Menu',
  },
} satisfies Record<Lang, Record<string, unknown>>

export const categoryLabels: Record<Category, Record<Lang, string>> = {
  music: { it: 'Musica', en: 'Music' },
  social: { it: 'Contenuti', en: 'Content' },
  film: { it: 'Film', en: 'Film' },
  production: { it: 'Produzioni', en: 'Productions' },
}

export const projects: Project[] = [
  {
    slug: 'ligabue-volente-o-nolente', number: '01', title: 'Volente o Nolente', client: 'Ligabue ft. Elisa', year: '2026', category: 'music', roles: ['Editing'], duration: '03:42', featured: true,
    poster: 'https://i.vimeocdn.com/video/2179590167-c7f34259d0e40d6d0ae6c45629c56c8e99029f72a05671925984a4ac8ee3c990-d_640?region=us',
    description: { it: 'Videoclip ufficiale per Ligabue ed Elisa.', en: 'Official music video for Ligabue and Elisa.' }, statement: { it: 'Regia e fotografia: Younuts! · Editing: Matteo Cataldo', en: 'Directed and photographed by Younuts! · Edited by Matteo Cataldo' }, video: { provider: 'vimeo', id: '1209869703' },
  },
  {
    slug: 'arisa-ricominciare-ancora', number: '02', title: 'Ricominciare Ancora', client: 'Arisa', year: '2026', category: 'music', roles: ['Editing', 'Colorist'], duration: '03:29', featured: true,
    poster: 'https://i.vimeocdn.com/video/2179590986-526244dfc543a9dd95ca841a6491cf097ff0b0ab5a8ee332a7e8a6ba6cf2684d-d_640?region=us',
    description: { it: 'Videoclip ufficiale per Arisa.', en: 'Official music video for Arisa.' }, statement: { it: 'Diretto e prodotto da Marco Salom · Editing e colore: Matteo Cataldo', en: 'Directed and produced by Marco Salom · Editing and colour by Matteo Cataldo' }, video: { provider: 'vimeo', id: '1209869181' },
  },
  {
    slug: 'ligabue-30-anni', number: '03', title: '30 anni in un giorno', client: 'Ligabue', year: '2026', category: 'film', roles: ['Editing'], duration: '01:36', featured: true,
    poster: 'https://i.vimeocdn.com/video/2179565386-1edca755abf4b9a376083838f23335b226aebb1e6d097ef686b2448454a074ec-d_640?region=us',
    description: { it: 'Trailer del docufilm dedicato ai trent’anni di Ligabue.', en: 'Trailer for the docufilm celebrating Ligabue’s thirty years.' }, statement: { it: 'Scritto e diretto da Marco Salom · Montaggio: Matteo Cataldo', en: 'Written and directed by Marco Salom · Edited by Matteo Cataldo' }, video: { provider: 'vimeo', id: '1209853317' },
  },
  {
    slug: 'napoli-melancholia', number: '04', title: 'Napoli Melancholia', client: 'Labasco', year: '2026', category: 'film', roles: ['Editing'], duration: '00:47', featured: false,
    poster: 'https://i.vimeocdn.com/video/2179648642-7ad06e21e82179389f9e5f3b528c8b5d3692bdcafb0b078cefc751cc6b76016b-d_640?region=us',
    description: { it: 'Teaser per Napoli Melancholia.', en: 'Teaser for Napoli Melancholia.' }, statement: { it: 'Editing: Matteo Cataldo', en: 'Edited by Matteo Cataldo' }, video: { provider: 'vimeo', id: '1209849109' },
  },
  {
    slug: 'polka-3', number: '05', title: 'Polka 3', client: 'Rosa Chemical, Bdope', year: '2026', category: 'music', roles: ['Editing'], duration: '04:01', featured: true,
    poster: 'https://i.vimeocdn.com/video/2179430958-ebacd52bc3e69f5fb736f62150dfa3accd3486c9e91ab33a46770fe302d2157a-d_640?region=us',
    description: { it: 'Videoclip ufficiale di Rosa Chemical e Bdope.', en: 'Official music video by Rosa Chemical and Bdope.' }, statement: { it: 'Diretto da Marco Salom · Editing: Matteo Cataldo', en: 'Directed by Marco Salom · Edited by Matteo Cataldo' }, video: { provider: 'vimeo', id: '1209748550' },
  },
  {
    slug: 'im-afraid-of-americans', number: '06', title: "I'm Afraid of Americans", client: 'O.R.K.', year: '2026', category: 'music', roles: ['Editing'], duration: '04:24', featured: false,
    poster: 'https://i.vimeocdn.com/video/2179555437-01a32182051a47fa2cd8fbbf6c5d075ac32ceff2b1c04170249022b6a54d7fb2-d_640?region=us',
    description: { it: 'Videoclip musicale per O.R.K.', en: 'Music video for O.R.K.' }, statement: { it: 'Diretto da Domenico Onorato e Daniela Bellu · Editing: Matteo Cataldo', en: 'Directed by Domenico Onorato and Daniela Bellu · Edited by Matteo Cataldo' }, video: { provider: 'vimeo', id: '1209748549' },
  },
  {
    slug: 'fendi-belt', number: '07', title: 'Fendi Belt', client: 'Shiva ft. Paky', year: '2026', category: 'music', roles: ['Editing'], duration: '02:35', featured: false,
    poster: 'https://i.vimeocdn.com/video/2179431805-463fe5bdd824d33b917e9943d7e63ba1ce5cc7801fb7d5f395f0e60f54608a08-d_640?region=us',
    description: { it: 'Videoclip ufficiale di Shiva e Paky.', en: 'Official music video by Shiva and Paky.' }, statement: { it: 'Diretto da Marco Salom · Editing: Matteo Cataldo', en: 'Directed by Marco Salom · Edited by Matteo Cataldo' }, video: { provider: 'vimeo', id: '1209748545' },
  },
  {
    slug: 'sushi-e-cocaina', number: '08', title: 'Sushi & Cocaina', client: 'Marracash ft. Luchè', year: '2026', category: 'music', roles: ['Editing', 'Colorist'], duration: '03:40', featured: false,
    poster: 'https://i.vimeocdn.com/video/2179427473-5c29bf5c07d8b41b2e87788fe1bd80a9ceac1fb0322a5dc5e1f386bb333410c0-d_640?region=us',
    description: { it: 'Videoclip ufficiale di Marracash e Luchè.', en: 'Official music video by Marracash and Luchè.' }, statement: { it: 'Regia e fotografia: Gianluca Catania · Editing e colore: Matteo Cataldo', en: 'Directed and photographed by Gianluca Catania · Editing and colour by Matteo Cataldo' }, video: { provider: 'vimeo', id: '1209746185' },
  },
]
