// Plan d'échantillonnage ISO 2859-1
// Basé sur les tables standards pour échantillonnage simple

import { PlanEchantillonnage, NiveauInspection } from '../types';

// Table de correspondance taille de lot -> lettre code
export const LETTRES_CODE: Array<{ min: number; max: number; niveau_I: string; niveau_II: string; niveau_III: string }> = [
  { min: 2, max: 8, niveau_I: 'A', niveau_II: 'A', niveau_III: 'B' },
  { min: 9, max: 15, niveau_I: 'A', niveau_II: 'B', niveau_III: 'C' },
  { min: 16, max: 25, niveau_I: 'B', niveau_II: 'C', niveau_III: 'D' },
  { min: 26, max: 50, niveau_I: 'C', niveau_II: 'D', niveau_III: 'E' },
  { min: 51, max: 90, niveau_I: 'C', niveau_II: 'E', niveau_III: 'F' },
  { min: 91, max: 150, niveau_I: 'D', niveau_II: 'F', niveau_III: 'G' },
  { min: 151, max: 280, niveau_I: 'E', niveau_II: 'G', niveau_III: 'H' },
  { min: 281, max: 500, niveau_I: 'F', niveau_II: 'H', niveau_III: 'J' },
  { min: 501, max: 1200, niveau_I: 'G', niveau_II: 'J', niveau_III: 'K' },
  { min: 1201, max: 3200, niveau_I: 'H', niveau_II: 'K', niveau_III: 'L' },
  { min: 3201, max: 10000, niveau_I: 'J', niveau_II: 'L', niveau_III: 'M' },
  { min: 10001, max: 35000, niveau_I: 'K', niveau_II: 'M', niveau_III: 'N' },
  { min: 35001, max: 150000, niveau_I: 'L', niveau_II: 'N', niveau_III: 'P' },
  { min: 150001, max: 500000, niveau_I: 'M', niveau_II: 'P', niveau_III: 'Q' },
  { min: 500001, max: Infinity, niveau_I: 'N', niveau_II: 'Q', niveau_III: 'R' },
];

// Tailles d'échantillon par lettre code
export const TAILLES_ECHANTILLON: Record<string, number> = {
  'A': 2,
  'B': 3,
  'C': 5,
  'D': 8,
  'E': 13,
  'F': 20,
  'G': 32,
  'H': 50,
  'J': 80,
  'K': 125,
  'L': 200,
  'M': 315,
  'N': 500,
  'P': 800,
  'Q': 1250,
  'R': 2000,
};

// Table de critères d'acceptation/rejet pour échantillonnage simple, normal
// Format: { lettreCode: { AQL: { Ac: nombre_acceptation, Re: nombre_rejet } } }
export const CRITERES_ACCEPTATION: Record<string, Record<number, { Ac: number; Re: number }>> = {
  'A': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 0, Re: 1 },
    0.15: { Ac: 0, Re: 1 },
    0.25: { Ac: 0, Re: 1 },
    0.40: { Ac: 0, Re: 1 },
    0.65: { Ac: 0, Re: 1 },
    1.0: { Ac: 0, Re: 1 },
    1.5: { Ac: 0, Re: 1 },
    2.5: { Ac: 0, Re: 1 },
    4.0: { Ac: 0, Re: 1 },
  },
  'B': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 0, Re: 1 },
    0.15: { Ac: 0, Re: 1 },
    0.25: { Ac: 0, Re: 1 },
    0.40: { Ac: 0, Re: 1 },
    0.65: { Ac: 0, Re: 1 },
    1.0: { Ac: 0, Re: 1 },
    1.5: { Ac: 0, Re: 1 },
    2.5: { Ac: 0, Re: 1 },
    4.0: { Ac: 0, Re: 1 },
  },
  'C': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 0, Re: 1 },
    0.15: { Ac: 0, Re: 1 },
    0.25: { Ac: 0, Re: 1 },
    0.40: { Ac: 0, Re: 1 },
    0.65: { Ac: 0, Re: 1 },
    1.0: { Ac: 0, Re: 1 },
    1.5: { Ac: 0, Re: 1 },
    2.5: { Ac: 1, Re: 2 },
    4.0: { Ac: 1, Re: 2 },
  },
  'D': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 0, Re: 1 },
    0.15: { Ac: 0, Re: 1 },
    0.25: { Ac: 0, Re: 1 },
    0.40: { Ac: 0, Re: 1 },
    0.65: { Ac: 0, Re: 1 },
    1.0: { Ac: 1, Re: 2 },
    1.5: { Ac: 1, Re: 2 },
    2.5: { Ac: 1, Re: 2 },
    4.0: { Ac: 2, Re: 3 },
  },
  'E': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 0, Re: 1 },
    0.15: { Ac: 0, Re: 1 },
    0.25: { Ac: 0, Re: 1 },
    0.40: { Ac: 0, Re: 1 },
    0.65: { Ac: 1, Re: 2 },
    1.0: { Ac: 1, Re: 2 },
    1.5: { Ac: 2, Re: 3 },
    2.5: { Ac: 3, Re: 4 },
    4.0: { Ac: 5, Re: 6 },
  },
  'F': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 0, Re: 1 },
    0.15: { Ac: 0, Re: 1 },
    0.25: { Ac: 0, Re: 1 },
    0.40: { Ac: 1, Re: 2 },
    0.65: { Ac: 1, Re: 2 },
    1.0: { Ac: 2, Re: 3 },
    1.5: { Ac: 3, Re: 4 },
    2.5: { Ac: 5, Re: 6 },
    4.0: { Ac: 7, Re: 8 },
  },
  'G': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 0, Re: 1 },
    0.15: { Ac: 0, Re: 1 },
    0.25: { Ac: 1, Re: 2 },
    0.40: { Ac: 1, Re: 2 },
    0.65: { Ac: 2, Re: 3 },
    1.0: { Ac: 3, Re: 4 },
    1.5: { Ac: 5, Re: 6 },
    2.5: { Ac: 7, Re: 8 },
    4.0: { Ac: 10, Re: 11 },
  },
  'H': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 0, Re: 1 },
    0.15: { Ac: 1, Re: 2 },
    0.25: { Ac: 1, Re: 2 },
    0.40: { Ac: 2, Re: 3 },
    0.65: { Ac: 3, Re: 4 },
    1.0: { Ac: 5, Re: 6 },
    1.5: { Ac: 7, Re: 8 },
    2.5: { Ac: 10, Re: 11 },
    4.0: { Ac: 14, Re: 15 },
  },
  'J': {
    0.065: { Ac: 0, Re: 1 },
    0.10: { Ac: 1, Re: 2 },
    0.15: { Ac: 1, Re: 2 },
    0.25: { Ac: 2, Re: 3 },
    0.40: { Ac: 3, Re: 4 },
    0.65: { Ac: 5, Re: 6 },
    1.0: { Ac: 7, Re: 8 },
    1.5: { Ac: 10, Re: 11 },
    2.5: { Ac: 14, Re: 15 },
    4.0: { Ac: 21, Re: 22 },
  },
  'K': {
    0.065: { Ac: 1, Re: 2 },
    0.10: { Ac: 1, Re: 2 },
    0.15: { Ac: 2, Re: 3 },
    0.25: { Ac: 3, Re: 4 },
    0.40: { Ac: 5, Re: 6 },
    0.65: { Ac: 7, Re: 8 },
    1.0: { Ac: 10, Re: 11 },
    1.5: { Ac: 14, Re: 15 },
    2.5: { Ac: 21, Re: 22 },
    4.0: { Ac: 21, Re: 22 },
  },
  'L': {
    0.065: { Ac: 1, Re: 2 },
    0.10: { Ac: 2, Re: 3 },
    0.15: { Ac: 3, Re: 4 },
    0.25: { Ac: 5, Re: 6 },
    0.40: { Ac: 7, Re: 8 },
    0.65: { Ac: 10, Re: 11 },
    1.0: { Ac: 14, Re: 15 },
    1.5: { Ac: 21, Re: 22 },
    2.5: { Ac: 21, Re: 22 },
    4.0: { Ac: 21, Re: 22 },
  },
  'M': {
    0.065: { Ac: 2, Re: 3 },
    0.10: { Ac: 3, Re: 4 },
    0.15: { Ac: 5, Re: 6 },
    0.25: { Ac: 7, Re: 8 },
    0.40: { Ac: 10, Re: 11 },
    0.65: { Ac: 14, Re: 15 },
    1.0: { Ac: 21, Re: 22 },
    1.5: { Ac: 21, Re: 22 },
    2.5: { Ac: 21, Re: 22 },
    4.0: { Ac: 21, Re: 22 },
  },
  'N': {
    0.065: { Ac: 3, Re: 4 },
    0.10: { Ac: 5, Re: 6 },
    0.15: { Ac: 7, Re: 8 },
    0.25: { Ac: 10, Re: 11 },
    0.40: { Ac: 14, Re: 15 },
    0.65: { Ac: 21, Re: 22 },
    1.0: { Ac: 21, Re: 22 },
    1.5: { Ac: 21, Re: 22 },
    2.5: { Ac: 21, Re: 22 },
    4.0: { Ac: 21, Re: 22 },
  },
};

/**
 * Calcule la taille d'échantillon et les critères selon ISO 2859-1
 */
export function calculerEchantillonISO(
  tailleLot: number,
  niveauInspection: NiveauInspection,
  aql: number
): { tailleEchantillon: number; nbAcceptation: number; nbRejet: number; lettreCode: string } | null {
  // Trouver la lettre code
  const rangeLot = LETTRES_CODE.find(r => tailleLot >= r.min && tailleLot <= r.max);
  if (!rangeLot) return null;

  let lettreCode: string;
  switch (niveauInspection) {
    case 'I':
      lettreCode = rangeLot.niveau_I;
      break;
    case 'II':
      lettreCode = rangeLot.niveau_II;
      break;
    case 'III':
      lettreCode = rangeLot.niveau_III;
      break;
    default:
      return null;
  }

  // Obtenir la taille d'échantillon
  const tailleEchantillon = TAILLES_ECHANTILLON[lettreCode];
  if (!tailleEchantillon) return null;

  // Obtenir les critères d'acceptation/rejet
  const criteresLettre = CRITERES_ACCEPTATION[lettreCode];
  if (!criteresLettre) return null;

  const criteres = criteresLettre[aql];
  if (!criteres) return null;

  return {
    tailleEchantillon,
    nbAcceptation: criteres.Ac,
    nbRejet: criteres.Re,
    lettreCode,
  };
}

/**
 * Détermine la décision d'inspection
 */
export function determinerDecision(nbDefauts: number, nbAcceptation: number, nbRejet: number): 'ACCEPTER' | 'REJETER' {
  if (nbDefauts <= nbAcceptation) {
    return 'ACCEPTER';
  } else {
    return 'REJETER';
  }
}

/**
 * Valeurs AQL communes
 */
export const AQL_COMMUNS = [0.065, 0.10, 0.15, 0.25, 0.40, 0.65, 1.0, 1.5, 2.5, 4.0];
