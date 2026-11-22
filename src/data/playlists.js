// Video playlists for the Learn section.
// Each playlist belongs to a channel, and that channel is credited on every card.
// Videos play through YouTube's embedded player. GateQ does not host or download them.
//
// GO Classes playlist IDs come from the official GO Classes page
// (goclasses.in, "List of free CSE & DA playlists on GO Classes YouTube channel").
// NPTEL playlists are not added yet: add entries here with provider 'nptel' and the playlist ID.

export const PROVIDERS = {
  goclasses: {
    name: 'GO Classes',
    channelUrl: 'https://www.youtube.com/channel/UCyvbBJhLJ-5YqwPA884vj0Q',
  },
  nptel: {
    name: 'NPTEL',
    channelUrl: 'https://www.youtube.com/@nptel-nociitm9240/courses',
  },
}

export const PLAYLISTS = [
  { id: 'gc-linear-algebra', provider: 'goclasses', subject: 'Engineering Mathematics', title: 'Linear Algebra', playlistId: 'PLIPZ2_p3RNHhGLQ1ZT37KLpBMAD90CM4_' },
  { id: 'gc-discrete-math', provider: 'goclasses', subject: 'Discrete Mathematics', title: 'Discrete Mathematics', playlistId: 'PLIPZ2_p3RNHgjPQN2GtCVOCgrkH2zCkSU' },
  { id: 'gc-c-programming', provider: 'goclasses', subject: 'Programming in C', title: 'C Programming', playlistId: 'PLIPZ2_p3RNHgzQutUHGzqMjA1z7XJ_Uya' },
  { id: 'gc-data-structures', provider: 'goclasses', subject: 'Data Structures', title: 'Data Structures', playlistId: 'PLIPZ2_p3RNHi_0QW5bavzLyAJZ0ozFTJ3' },
  { id: 'gc-algorithms', provider: 'goclasses', subject: 'Algorithms', title: 'Algorithms', playlistId: 'PLIPZ2_p3RNHjUCHdJp-_soSSmhgmO4i0T' },
  { id: 'gc-dbms', provider: 'goclasses', subject: 'Database Management', title: 'DBMS', playlistId: 'PLIPZ2_p3RNHhUXFx03wy3uFeCXRw6qlm8' },
  { id: 'gc-os', provider: 'goclasses', subject: 'Operating Systems', title: 'Operating Systems', playlistId: 'PLIPZ2_p3RNHixlIaarIXGPy-eggJQMxd_' },
  { id: 'gc-coa', provider: 'goclasses', subject: 'Computer Organization', title: 'Computer Organization (COA)', playlistId: 'PLIPZ2_p3RNHjMdZR3GYQ2KZio0NKczrik' },
  { id: 'gc-toc', provider: 'goclasses', subject: 'Theory of Computation', title: 'Theory of Computation', playlistId: 'PLIPZ2_p3RNHhXeEdbXsi34ePvUjL8I-Q9' },
  { id: 'gc-compiler', provider: 'goclasses', subject: 'Compiler Design', title: 'Compiler Design', playlistId: 'PLIPZ2_p3RNHjy3eH_qRImIs5dVUTpr9ga' },
  { id: 'gc-networks', provider: 'goclasses', subject: 'Computer Networks', title: 'Computer Networks', playlistId: 'PLIPZ2_p3RNHim3NUSNOb7ffyhaE5MSkmE' },
  { id: 'gc-digital-logic', provider: 'goclasses', subject: 'Digital Logic', title: 'Digital Logic', playlistId: 'PLIPZ2_p3RNHiwFGR4fqKlj9C_eo8R6hbY' },
].map((p) => ({ ...p, url: `https://www.youtube.com/playlist?list=${p.playlistId}` }))

export function playlistEmbedUrl(playlistId) {
  return `https://www.youtube-nocookie.com/embed/videoseries?list=${encodeURIComponent(playlistId)}`
}
