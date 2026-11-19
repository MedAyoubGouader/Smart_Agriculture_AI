/*
 * DONNÉES DE DÉMONSTRATION de la carte publique (reprises de la maquette de design).
 * Elles seront remplacées par l'API Django en C3 (prédictions, historique, climat).
 * Toutes les valeurs sont indexées par le code de gouvernorat (pcode), jamais par le nom.
 */

// Ordre de la maquette → pcode (clé de jointure du projet).
export const PCODES = ['TN11', 'TN12', 'TN13', 'TN14', 'TN15', 'TN16', 'TN17', 'TN21', 'TN22', 'TN23', 'TN24',
  'TN31', 'TN32', 'TN33', 'TN34', 'TN41', 'TN42', 'TN43', 'TN61', 'TN51', 'TN52', 'TN53', 'TN62', 'TN63']
const IDX = Object.fromEntries(PCODES.map((p, i) => [p, i]))
const ZONE = 'NNNNNNNNNNNCCCCCCCSSSSSS'
const PLUIE = [450, 440, 420, 430, 480, 430, 620, 600, 820, 480, 450, 320, 330, 300, 210, 290, 320, 250, 160, 170, 180, 110, 90, 90]
const TEMP = [18.4, 18.2, 18.5, 18.1, 18.3, 18.0, 17.9, 17.6, 17.8, 16.4, 16.8, 19.1, 19.0, 19.2, 19.6, 19.4, 16.9, 18.6, 19.8, 20.4, 20.6, 21.0, 21.6, 21.4]
const SURFACE = [2, 12, 10, 25, 25, 35, 70, 110, 75, 90, 65, 10, 4, 15, 12, 45, 40, 35, 8, 4, 3, 0, 0, 0]
const _ = null

// rel : 3 = prévision régionale, 2 = prévision indicative, 1 = tendance nationale. th = seuils [faible, favorable].
export const CULTURES = {
  ble: { nom: 'Blé dur', rel: 3, th: [1.2, 2.0], vals: [1.6, 2.0, 1.7, 2.2, 1.9, 1.8, 2.5, 2.9, 2.6, 2.3, 2.1, 1.2, 1.1, 1.0, 0.8, 1.3, 1.1, 1.0, 0.6, 0.5, 0.4, _, _, _] },
  bt: { nom: 'Blé tendre', rel: 3, th: [1.2, 2.0], vals: [1.8, 2.1, 1.9, 2.4, 2.0, 1.9, 2.7, 3.1, 2.8, 2.4, 2.2, 1.3, 1.2, 1.1, 0.9, 1.4, 1.2, 1.1, 0.7, _, _, _, _, _] },
  orge: { nom: 'Orge', rel: 3, th: [1.0, 1.8], vals: [1.3, 1.5, 1.3, 1.7, 1.5, 1.4, 2.0, 2.3, 2.1, 1.9, 1.8, 1.1, 1.0, 1.0, 0.7, 1.2, 1.1, 1.0, 0.6, 0.5, 0.45, 0.35, _, _] },
  olive: { nom: 'Olivier', rel: 2, th: [0.6, 1.2], sens: 0.6, alt: 1, vals: [_, 1.1, 1.1, 1.2, 1.4, 1.0, 1.4, 1.5, 1.3, 0.8, 0.9, 1.3, 1.2, 1.1, 0.9, 0.8, 0.6, 0.9, 0.45, 0.5, 0.4, 0.3, _, _] },
  agr: { nom: 'Agrumes', rel: 2, th: [12, 20], sens: 0.3, vals: [_, 16, 18, 17, 24, 13, 19, 15, 14, _, _, 10, _, _, _, 11, _, _, _, _, _, _, _, _] },
  tom: { nom: 'Tomate', rel: 2, th: [35, 55], sens: 0.3, vals: [_, 47, 50, 54, 62, 45, 56, 58, 52, 38, 40, 40, 42, 36, 30, 48, 33, 44, _, 34, _, _, _, _] },
  pdt: { nom: 'Pomme de terre', rel: 2, th: [15, 22], sens: 0.35, vals: [_, 18, 19, 20, 24, 15, 22, 21, 23, 17, 16, 14, 15, 13, 12, 18, 16, 17, _, _, _, _, _, _] },
  dat: { nom: 'Dattes', rel: 2, th: [4.5, 6.5], sens: 0.2, vals: [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, 5.1, 4.0, 3.6, _, 6.8, 7.2] },
  pc: { nom: 'Pois chiche', rel: 1, nat: 0.85, th: [0.6, 1] },
  fev: { nom: 'Fève et féverole', rel: 1, nat: 1.15, th: [0.8, 1.3] },
  aman: { nom: 'Amandier', rel: 1, nat: 0.32, th: [0.2, 0.4], sens: 0.5 },
}
export const NIVEAUX = { 3: 'Prévision régionale', 2: 'Prévision indicative', 1: 'Tendance nationale' }
const CLIMAT = { 1982: 1.1, 1983: 0.85, 1985: 1.15, 1987: 1.1, 1988: 0.42, 1989: 0.6, 1990: 1.05, 1991: 1.15, 1992: 1.25, 1993: 0.7, 1994: 0.5, 1995: 0.8, 1996: 1.4, 1997: 0.7, 1999: 1.05, 2000: 0.85, 2001: 0.75, 2002: 0.45, 2003: 1.3, 2004: 1.3, 2005: 0.95, 2006: 1.1, 2007: 0.85, 2008: 0.75, 2009: 1.25, 2010: 0.85, 2011: 1.05, 2012: 1.1, 2013: 0.85, 2014: 0.95, 2015: 1.15, 2016: 0.55, 2017: 0.75, 2018: 1.05, 2019: 1.3, 2020: 0.95 }

// Campagnes observées sur la frise (2000-2001 → 2019-2020) et campagne en prévision (plan du projet).
export const ANNEES = Array.from({ length: 20 }, (_v, i) => 2001 + i)
export const PREVISION = { annee: 2026, libelle: '2025-2026' }
export const COULEURS = { good: '#3FA66B', mid: '#EE9433', low: '#D64B45' }
export const CLASSES = { good: 'Favorable', mid: 'Intermédiaire', low: 'Faible', na: 'Pas de prédiction fiable' }
export const INDICATEURS = { yield: 'Rendement prédit', risk: 'Risque de faible rendement', anom: 'Écart à la moyenne', hist: 'Historique' }

function aleatoire(graine) {
  let h = 1779033703 ^ graine.length
  for (let i = 0; i < graine.length; i++) {
    h = Math.imul(h ^ graine.charCodeAt(i), 3432918353)
    h = (h << 13) | (h >>> 19)
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

export const fmt = (v, d) => {
  if (d == null) d = Math.abs(v) >= 10 ? 0 : 1
  return v.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
}
export const campagne = (y) => (y === 'pred' ? PREVISION.libelle : `${y - 1}-${y}`)

const CACHE = {}
export function base(c, p) {
  const C = CULTURES[c]
  return C.rel === 1 ? C.nat : C.vals[IDX[p]]
}
export function serie(c, p) {
  const k = c + '|' + p
  if (k in CACHE) return CACHE[k]
  const C = CULTURES[c]
  const b = base(c, p)
  if (b == null) return (CACHE[k] = null)
  const sens = { N: 0.75, C: 1, S: 1.15 }[p ? ZONE[IDX[p]] : 'C'] * (C.sens ?? 1)
  const r = aleatoire(k)
  const s = {}
  for (let y = 1980; y <= 2020; y++) {
    const f = 1 + ((CLIMAT[y] ?? 1) - 1) * sens
    const tendance = 0.74 + (0.26 * (y - 1980)) / 40
    const alternance = C.alt ? (y % 2 ? 1.1 : 0.9) : 1
    s[y] = Math.max(b * 0.1, b * tendance * f * alternance * (1 + (r() - 0.5) * 0.2) * 1.04)
  }
  return (CACHE[k] = s)
}
export function serieNationale(c) {
  const k = 'nat|' + c
  if (CACHE[k]) return CACHE[k]
  if (CULTURES[c].rel === 1) return (CACHE[k] = serie(c, null))
  const s = {}
  for (let y = 1980; y <= 2020; y++) {
    let t = 0
    let m = 0
    PCODES.forEach((p) => {
      const S = serie(c, p)
      if (S) {
        t += S[y]
        m++
      }
    })
    s[y] = t / m
  }
  return (CACHE[k] = s)
}
export function previsionNationale(c) {
  if (CULTURES[c].rel === 1) return CULTURES[c].nat
  let t = 0
  let m = 0
  PCODES.forEach((p) => {
    const b = base(c, p)
    if (b != null) {
      t += b
      m++
    }
  })
  return t / m
}
export const moyenne = (s) => ANNEES.reduce((t, y) => t + s[y], 0) / ANNEES.length
export const classe = (v, th) => (v >= th[1] ? 'good' : v >= th[0] ? 'mid' : 'low')
export function risque(c, p) {
  const C = CULTURES[c]
  const z = (base(c, p) - C.th[0]) / (C.th[1] - C.th[0])
  const r = aleatoire('risk' + c + p)()
  return Math.round(Math.min(92, Math.max(3, 62 - 50 * z + (r - 0.5) * 10)))
}
export const pluieNormale = (p) => PLUIE[IDX[p]]
export const pluieActuelle = (p) => Math.round(PLUIE[IDX[p]] * (1 - (0.05 + aleatoire('rain' + p)() * 0.27)))
const pluieAnnee = (p, y) => Math.round(PLUIE[IDX[p]] * (1 + ((CLIMAT[y] ?? 1) - 1) * 0.8) * (1 + (aleatoire('ry' + p + y)() - 0.5) * 0.15))
export const tempNormale = (p) => TEMP[IDX[p]]
export const tempAnomalie = (p) => 0.5 + aleatoire('t' + p)() * 0.8

// ---- Valeur affichée pour une couche, un gouvernorat et une campagne ----------------------------
export function infoPrediction(c, p, ind, annee) {
  const C = CULTURES[c]
  if (C.rel === 1) return { na: true }
  const b = base(c, p)
  if (b == null) return { na: true, lab: INDICATEURS[ind] }
  const s = serie(c, p)
  const u = ' t/ha'
  if (ind === 'hist') {
    const m = moyenne(s)
    return { v: m, cls: classe(m, C.th), txt: fmt(m) + u, lab: 'Moyenne 2000-2020' }
  }
  const v = annee === 'pred' ? b : s[annee]
  if (ind === 'risk') {
    const r = risque(c, p)
    return { v: r, cls: r < 25 ? 'good' : r <= 50 ? 'mid' : 'low', txt: r + ' %', lab: 'Risque de faible rendement' }
  }
  if (ind === 'anom') {
    const m = moyenne(s)
    const a = ((v - m) / m) * 100
    return { v: a, cls: a >= 5 ? 'good' : a >= -10 ? 'mid' : 'low', txt: (a >= 0 ? '+' : '−') + fmt(Math.abs(a), 0) + ' %', lab: 'Écart à la moyenne 2000-2020' }
  }
  return { v, cls: classe(v, C.th), txt: fmt(v) + u, lab: annee === 'pred' ? 'Rendement prédit' : 'Rendement observé' }
}

export const SEQUENTIELLES = {
  rendement: ['Rendement observé', 't/ha', 'sable'],
  superficie: ['Superficie emblavée', 'milliers ha', 'sable'],
  production: ['Production', 'milliers t', 'sable'],
  pluie: ['Pluie cumulée de la campagne', 'mm', 'bleu'],
  temp: ['Température moyenne', '°C', 'mauve'],
}
const RAMPES = { sable: ['#4A4535', '#F1E5C2'], bleu: ['#1B3347', '#A6D2F0'], mauve: ['#3A2F45', '#DCC0EA'] }
export function rampe(k, t) {
  const [a, b] = RAMPES[k].map((h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16)))
  return 'rgb(' + a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',') + ')'
}
export function valeursSequentielles(l, annee) {
  const out = {}
  const yy = annee === 'pred' ? 2020 : annee
  PCODES.forEach((p) => {
    let v = null
    if (l.kind === 'hist') {
      const s = serie(l.crop, p)
      if (s && SURFACE[IDX[p]]) {
        const a = SURFACE[IDX[p]] * (l.crop === 'orge' ? 0.9 : l.crop === 'bt' ? 0.3 : 1) * (1 + (aleatoire('a' + p + yy)() - 0.5) * 0.2)
        v = l.metric === 'rendement' ? s[yy] : l.metric === 'superficie' ? a : a * s[yy]
      }
    }
    if (l.kind === 'clim') {
      v = l.metric === 'pluie'
        ? annee === 'pred' ? pluieActuelle(p) : pluieAnnee(p, yy)
        : TEMP[IDX[p]] + (annee === 'pred' ? tempAnomalie(p) : (aleatoire('ty' + p + yy)() - 0.5) * 1.2)
    }
    out[p] = v
  })
  const vs = Object.values(out).filter((v) => v != null)
  return { out, min: Math.min(...vs), max: Math.max(...vs) }
}

export function info(l, p, annee) {
  if (l.kind === 'pred') {
    const i = infoPrediction(l.crop, p, l.ind, annee)
    if (!i.na) i.color = COULEURS[i.cls]
    return i
  }
  const q = valeursSequentielles(l, annee)
  const v = q.out[p]
  if (v == null) return { na: true }
  const m = SEQUENTIELLES[l.metric]
  return { v, color: rampe(m[2], (v - q.min) / (q.max - q.min || 1)), txt: fmt(v, m[1] === '°C' || v < 10 ? 1 : 0) + ' ' + m[1], lab: m[0] }
}

export const aUneCarte = (l) => l.kind === 'admin' || !(l.kind === 'pred' && CULTURES[l.crop].rel === 1)

export function titreCouche(l, annee) {
  if (l.kind === 'pred') {
    const t = l.ind === 'yield' ? (annee === 'pred' ? 'Rendement prédit' : 'Rendement observé') : l.ind === 'hist' ? 'Historique · moyenne 2000-2020' : INDICATEURS[l.ind]
    return [t, CULTURES[l.crop].nom + ' · ' + (l.ind === 'hist' ? '2000-2020' : campagne(annee))]
  }
  if (l.kind === 'admin') return ['Limites administratives', 'Gouvernorats · 24 unités']
  if (l.kind === 'hist') return [SEQUENTIELLES[l.metric][0], CULTURES[l.crop].nom + ' · ' + (annee === 'pred' ? '2019-2020' : campagne(annee))]
  return [SEQUENTIELLES[l.metric][0], l.metric === 'pluie' && annee === 'pred' ? `Campagne ${PREVISION.libelle} (en cours)` : 'Campagne ' + campagne(annee)]
}

// ---- Catalogue « Explorer les données » --------------------------------------------------------
export const CATALOGUE = {}
Object.entries(CULTURES).forEach(([k, c]) => {
  CATALOGUE['pred:' + k] = {
    grp: 'predc', titre: 'Rendement prédit — ' + c.nom, nom: c.nom, rel: c.rel,
    desc: c.rel === 1
      ? `Tendance nationale du rendement de ${c.nom.toLowerCase()} estimée à partir des statistiques agricoles nationales. Les données par gouvernorat sont trop lacunaires pour une carte régionale.`
      : `Prévision du rendement de ${c.nom.toLowerCase()} par gouvernorat pour la campagne en cours, accompagnée d'un intervalle de prévision à 80 %, d'une probabilité de faible rendement et de l'écart à la moyenne 2000-2020.${c.rel === 2 ? ' Fiabilité réduite : séries plus courtes et forte variabilité des pratiques (irrigation, alternance).' : ''}`,
    src: 'Modèle Smart Agriculture AI — statistiques agricoles régionales et indices climatiques',
    per: c.rel === 1 ? `1980-2020 · prévision ${PREVISION.libelle}` : `Historique 1980-2020 · prévision ${PREVISION.libelle}`,
    res: c.rel === 1 ? 'Nationale' : 'Gouvernorat (24 unités)', unite: 't/ha', couche: { kind: 'pred', crop: k, ind: 'yield' },
  }
})
;[
  ['production', 'Production céréalière', 'Production annuelle par gouvernorat et par céréale, en milliers de tonnes.', 'milliers t'],
  ['superficie', 'Superficie emblavée', "Superficie semée en céréales par gouvernorat, en milliers d'hectares.", 'milliers ha'],
  ['rendement', 'Rendement observé', 'Rendement observé par campagne, calculé comme production / superficie récoltée.', 't/ha'],
].forEach(([k, t, d, u]) => {
  CATALOGUE['hist:' + k] = {
    grp: 'hist', titre: t, nom: t.split(' ')[0], desc: d + " Couleurs neutres : il s'agit de valeurs observées, non de prédictions.",
    src: 'Statistiques agricoles régionales (données de démonstration)', per: 'Campagnes 2000-2001 à 2019-2020',
    res: 'Gouvernorat (24 unités)', unite: u, couche: { kind: 'hist', metric: k, crop: 'ble' },
  }
})
CATALOGUE['clim:pluie'] = {
  grp: 'clim', titre: 'Pluie cumulée de la campagne', nom: 'Pluie',
  desc: 'Cumul des précipitations de septembre à mai, comparé à la normale 1991-2020. Utilisé comme variable explicative du modèle.',
  src: 'CHIRPS (pluie mensuelle par gouvernorat)', per: '1981-2026', res: 'Gouvernorat (24 unités)', unite: 'mm', couche: { kind: 'clim', metric: 'pluie' },
}
CATALOGUE['clim:temp'] = {
  grp: 'clim', titre: 'Température moyenne de la campagne', nom: 'Température',
  desc: 'Température moyenne de septembre à mai et anomalie par rapport à la normale 1991-2020.',
  src: 'NASA POWER (données mensuelles par gouvernorat)', per: '1981-2025', res: 'Gouvernorat (24 unités)', unite: '°C', couche: { kind: 'clim', metric: 'temp' },
}
CATALOGUE['adm:gouv'] = {
  grp: 'adm', titre: 'Limites des gouvernorats', nom: 'Gouvernorats',
  desc: 'Contours des 24 gouvernorats, utilisés comme unités spatiales de toutes les prédictions régionales.',
  src: 'HDX / OCHA (COD-AB Tunisie), simplifié', per: '—', res: '1:1 000 000 environ', unite: '—', couche: { kind: 'admin' },
}
export const cleCatalogue = (l) => (l.kind === 'pred' ? 'pred:' + l.crop : l.kind === 'hist' ? 'hist:' + l.metric : l.kind === 'clim' ? 'clim:' + l.metric : 'adm:gouv')
export const ARBRE = [
  ['pred', 'Prédictions', [['predc', 'par culture', Object.keys(CULTURES).map((k) => 'pred:' + k)]]],
  ['hist', 'Historique', ['hist:production', 'hist:superficie', 'hist:rendement']],
  ['clim', 'Climat', ['clim:pluie', 'clim:temp']],
  ['adm', 'Limites administratives', ['adm:gouv']],
]

export const normaliser = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
