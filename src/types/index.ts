// Types pour l'application de gestion des matières premières ISO 2859-1

export type UserRole = 'magasinier' | 'responsable' | 'admin';

export type EtatControle = 'normal' | 'renforce' | 'reduit';

export type DecisionInspection = 'ACCEPTER' | 'REJETER';

export type NiveauInspection = 'I' | 'II' | 'III';

export type StatutAlerte = 'nouvelle' | 'en_cours' | 'resolue';

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: UserRole;
  poste?: string;
  service?: string;
  matricule?: string;
  created_at: string;
}

export interface Produit {
  id: string;
  code: string;
  nom: string;
  reference: string;
  categorie: string;
  specifications?: string;
  description?: string;
  created_at: string;
}

export interface Fournisseur {
  id: string;
  code: string;
  nom: string;
  pays: string;
  statut: 'actif' | 'inactif' | 'sous_surveillance';
  email?: string;
  telephone?: string;
  score_qualite?: number;
  created_at: string;
}

export interface Lot {
  id: string;
  numero_lot: string;
  produit_id: string;
  fournisseur_id: string;
  quantite_recue: number;
  date_reception: string;
  heure_reception: string;
  magasinier_id: string;
  etat_controle: EtatControle;
  statut_reception: 'en_attente' | 'en_cours_inspection' | 'accepte' | 'rejete' | 'bloque';
  decision_finale?: DecisionInspection;
  created_at: string;
  
  // Relations
  produit?: Produit;
  fournisseur?: Fournisseur;
  magasinier?: User;
}

export interface Inspection {
  id: string;
  lot_id: string;
  taille_lot: number;
  niveau_inspection: NiveauInspection;
  aql: number;
  taille_echantillon: number;
  nb_defauts: number;
  defauts_critique: number;
  defauts_majeur: number;
  defauts_mineur: number;
  type_defaut?: string;
  decision: DecisionInspection;
  etat_controle: EtatControle;
  inspecteur_id: string;
  date_inspection: string;
  heure_inspection: string;
  commentaire?: string;
  photo_defaut?: string;
  created_at: string;
  
  // Relations
  lot?: Lot;
  inspecteur?: User;
}

export interface Alerte {
  id: string;
  type: string;
  titre: string;
  message: string;
  severite: 'info' | 'warning' | 'critical';
  statut: StatutAlerte;
  lot_id?: string;
  fournisseur_id?: string;
  created_by: string;
  assigned_to?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  
  // Relations
  lot?: Lot;
  fournisseur?: Fournisseur;
  createur?: User;
  assigne?: User;
}

export interface HistoriqueEtat {
  id: string;
  lot_id: string;
  ancien_etat: EtatControle;
  nouvel_etat: EtatControle;
  raison: string;
  user_id: string;
  created_at: string;
  
  // Relations
  lot?: Lot;
  user?: User;
}

export interface PlanEchantillonnage {
  taille_lot_min: number;
  taille_lot_max: number;
  niveau_I?: number;
  niveau_II?: number;
  niveau_III?: number;
}

export interface AuditFournisseur {
  id: string;
  fournisseur_id: string;
  date_audit: string;
  note: number;
  commentaires: string;
  actions_correctives?: string;
  created_at: string;
  
  // Relations
  fournisseur?: Fournisseur;
}

export interface StatistiquesResponse {
  total_lots: number;
  lots_acceptes: number;
  lots_rejetes: number;
  lots_en_attente: number;
  lots_bloques: number;
  taux_acceptation: number;
  taux_conformite_global: number;
  alertes_actives: number;
  temps_moyen_traitement: number;
  cout_moyen_controle: number;
  cout_non_conformites: number;
  lots_par_etat: {
    normal: number;
    renforce: number;
    reduit: number;
  };
  lots_par_statut: {
    en_attente: number;
    en_cours_inspection: number;
    accepte: number;
    rejete: number;
    bloque: number;
  };
  defauts_par_type: {
    critiques: number;
    majeurs: number;
    mineurs: number;
  };
  performance_inspecteurs: Array<{
    inspecteur: string;
    nb_inspections: number;
    taux_conformite: number;
  }>;
  evolution_mensuelle: Array<{
    mois: string;
    acceptes: number;
    rejetes: number;
  }>;
  fournisseurs_top: Array<{
    fournisseur: string;
    taux_acceptation: number;
    total_lots: number;
    nb_non_conformites: number;
  }>;
  conformite_par_produit: Array<{
    produit: string;
    taux_conformite: number;
  }>;
}
