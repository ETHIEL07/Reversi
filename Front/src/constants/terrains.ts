export type Terrain = 'forest' | 'winter' | 'jungle' | 'desert' | 'night'

export type TerrainChoice = {
  terrain: Terrain
  /** French label shown in the options. */
  label: string
  /** English label, used when the interface is switched over. */
  labelEn: string
  note: string
  noteEn: string
  /** Two colours for the swatch: the felt of the board and the sky behind it. */
  felt: string
  sky: string
}

/**
 * The terrain repaints the whole game: background, board felt, accent colour and the outfit
 * the champions wear. Everything downstream reads CSS variables, so a terrain is nothing more
 * than a block of variables plus the piece of gear it hands out.
 */
export const TERRAINS: TerrainChoice[] = [
  {
    terrain: 'forest',
    label: 'Forêt',
    labelEn: 'Forest',
    note: 'Le tapis vert classique, sous une lumière calme.',
    noteEn: 'The classic green baize under a calm light.',
    felt: '#1e7a4f',
    sky: '#12231b',
  },
  {
    terrain: 'winter',
    label: 'Hiver',
    labelEn: 'Winter',
    note: 'Glace et ciel pâle. Les champions sortent l’écharpe.',
    noteEn: 'Ice and a pale sky. The champions put a scarf on.',
    felt: '#2f7f9e',
    sky: '#101c2a',
  },
  {
    terrain: 'jungle',
    label: 'Jungle',
    labelEn: 'Jungle',
    note: 'Feuillage épais et chaleur lourde, feuilles aux épaules.',
    noteEn: 'Thick foliage and heavy heat, leaves on the shoulders.',
    felt: '#3f8f22',
    sky: '#0d1d0c',
  },
  {
    terrain: 'desert',
    label: 'Désert',
    labelEn: 'Desert',
    note: 'Sable et soleil bas, chèche sur la tête.',
    noteEn: 'Sand and a low sun, headscarf on.',
    felt: '#b4823a',
    sky: '#2a1c10',
  },
  {
    terrain: 'night',
    label: 'Nuit',
    labelEn: 'Night',
    note: 'Ciel étoilé et cape sombre. Le plateau se lit à la lueur.',
    noteEn: 'Starry sky and a dark cape. The board reads by glow.',
    felt: '#2b3f7a',
    sky: '#0a0c1c',
  },
]
