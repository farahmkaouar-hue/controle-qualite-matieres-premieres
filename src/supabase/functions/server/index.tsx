import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configuration CORS
app.use('*', cors());
app.use('*', logger(console.log));

// Client Supabase avec clé service role
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ===== AUTHENTIFICATION =====

// Inscription (admin uniquement)
app.post('/make-server-b3b7bc95/auth/signup', async (c) => {
  try {
    const { email, password, nom, prenom, role } = await c.req.json();

    // Créer l'utilisateur avec Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmer l'email
      user_metadata: { nom, prenom, role },
    });

    if (authError) {
      console.error('Erreur création utilisateur:', authError);
      return c.json({ error: authError.message }, 400);
    }

    // Enregistrer les infos utilisateur dans KV
    await kv.set(`user:${authData.user.id}`, {
      id: authData.user.id,
      email,
      nom,
      prenom,
      role,
      created_at: new Date().toISOString(),
    });

    return c.json({ success: true, user: authData.user });
  } catch (error) {
    console.error('Erreur signup:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Obtenir le profil utilisateur connecté
app.get('/make-server-b3b7bc95/auth/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      // Créer le profil à partir des métadonnées
      const profile = {
        id: user.id,
        email: user.email!,
        nom: user.user_metadata.nom || '',
        prenom: user.user_metadata.prenom || '',
        role: user.user_metadata.role || 'magasinier',
        created_at: user.created_at,
      };
      await kv.set(`user:${user.id}`, profile);
      return c.json(profile);
    }

    return c.json(userProfile);
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== PRODUITS =====

app.get('/make-server-b3b7bc95/produits', async (c) => {
  try {
    const produits = await kv.getByPrefix('produit:');
    return c.json(produits || []);
  } catch (error) {
    console.error('Erreur récupération produits:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-b3b7bc95/produits', async (c) => {
  try {
    const { code, nom, reference, categorie, specifications, description } = await c.req.json();
    const id = `prod_${Date.now()}`;
    
    const produit = {
      id,
      code,
      nom,
      reference,
      categorie,
      specifications,
      description,
      created_at: new Date().toISOString(),
    };

    await kv.set(`produit:${id}`, produit);
    return c.json(produit);
  } catch (error) {
    console.error('Erreur création produit:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== FOURNISSEURS =====

app.get('/make-server-b3b7bc95/fournisseurs', async (c) => {
  try {
    const fournisseurs = await kv.getByPrefix('fournisseur:');
    return c.json(fournisseurs || []);
  } catch (error) {
    console.error('Erreur récupération fournisseurs:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-b3b7bc95/fournisseurs', async (c) => {
  try {
    const { code, nom, pays, statut, email, telephone } = await c.req.json();
    const id = `fourn_${Date.now()}`;
    
    const fournisseur = {
      id,
      code,
      nom,
      pays: pays || 'France',
      statut: statut || 'actif',
      email,
      telephone,
      score_qualite: 100,
      created_at: new Date().toISOString(),
    };

    await kv.set(`fournisseur:${id}`, fournisseur);
    return c.json(fournisseur);
  } catch (error) {
    console.error('Erreur création fournisseur:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== LOTS =====

app.get('/make-server-b3b7bc95/lots', async (c) => {
  try {
    const lots = await kv.getByPrefix('lot:');
    
    // Enrichir avec les relations
    const lotsEnrichis = await Promise.all(
      (lots || []).map(async (lot: any) => {
        const produit = await kv.get(`produit:${lot.produit_id}`);
        const fournisseur = await kv.get(`fournisseur:${lot.fournisseur_id}`);
        const magasinier = await kv.get(`user:${lot.magasinier_id}`);
        
        return {
          ...lot,
          produit,
          fournisseur,
          magasinier,
        };
      })
    );

    return c.json(lotsEnrichis);
  } catch (error) {
    console.error('Erreur récupération lots:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Générer numéro de lot automatique
app.post('/make-server-b3b7bc95/lots/generer-numero', async (c) => {
  try {
    const { produit_id, fournisseur_id } = await c.req.json();
    
    const produit = await kv.get(`produit:${produit_id}`);
    const fournisseur = await kv.get(`fournisseur:${fournisseur_id}`);
    
    if (!produit || !fournisseur) {
      return c.json({ error: 'Produit ou fournisseur introuvable' }, 404);
    }
    
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const time = String(date.getHours()).padStart(2, '0') + String(date.getMinutes()).padStart(2, '0');
    
    const numero_lot = `LOT-${produit.code}-${fournisseur.code}-${year}${month}${day}-${time}`;
    
    return c.json({ numero_lot });
  } catch (error) {
    console.error('Erreur génération numéro lot:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.post('/make-server-b3b7bc95/lots', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const { numero_lot, produit_id, fournisseur_id, quantite_recue } = await c.req.json();
    const id = `lot_${Date.now()}`;
    
    const now = new Date();
    
    const lot = {
      id,
      numero_lot,
      produit_id,
      fournisseur_id,
      quantite_recue,
      date_reception: now.toISOString().split('T')[0],
      heure_reception: now.toISOString().split('T')[1].substring(0, 8),
      magasinier_id: user.id,
      etat_controle: 'normal',
      statut_reception: 'en_attente',
      created_at: now.toISOString(),
    };

    await kv.set(`lot:${id}`, lot);
    
    // Enrichir avec les relations pour la réponse
    const produit = await kv.get(`produit:${produit_id}`);
    const fournisseur = await kv.get(`fournisseur:${fournisseur_id}`);
    const magasinier = await kv.get(`user:${user.id}`);

    return c.json({
      ...lot,
      produit,
      fournisseur,
      magasinier,
    });
  } catch (error) {
    console.error('Erreur création lot:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Supprimer un lot
app.delete('/make-server-b3b7bc95/lots/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const lot_id = c.req.param('id');
    const lot = await kv.get(`lot:${lot_id}`);
    
    if (!lot) {
      return c.json({ error: 'Lot introuvable' }, 404);
    }
    
    // Vérifier si le lot a déjà été inspecté
    if (lot.decision_finale) {
      return c.json({ error: 'Impossible de supprimer un lot déjà inspecté' }, 400);
    }
    
    await kv.del(`lot:${lot_id}`);
    return c.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression lot:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== INSPECTIONS ISO 2859-1 =====

// Fonction de calcul ISO 2859-1 (simplifiée)
function calculerEchantillonISO(tailleLot: number, niveauInspection: string, aql: number) {
  // Tables simplifiées ISO 2859-1
  const tables: any = {
    'II': {
      '2-8': { echantillon: 2, Ac: 0, Re: 1 },
      '9-15': { echantillon: 3, Ac: 0, Re: 1 },
      '16-25': { echantillon: 5, Ac: 0, Re: 1 },
      '26-50': { echantillon: 8, Ac: 0, Re: 1 },
      '51-90': { echantillon: 13, Ac: 0, Re: 1 },
      '91-150': { echantillon: 20, Ac: 0, Re: 1 },
      '151-280': { echantillon: 32, Ac: 1, Re: 2 },
      '281-500': { echantillon: 50, Ac: 2, Re: 3 },
      '501-1200': { echantillon: 80, Ac: 3, Re: 4 },
      '1201-3200': { echantillon: 125, Ac: 5, Re: 6 },
      '3201-10000': { echantillon: 200, Ac: 7, Re: 8 },
      '10001-35000': { echantillon: 315, Ac: 10, Re: 11 },
    }
  };

  let range = '';
  if (tailleLot <= 8) range = '2-8';
  else if (tailleLot <= 15) range = '9-15';
  else if (tailleLot <= 25) range = '16-25';
  else if (tailleLot <= 50) range = '26-50';
  else if (tailleLot <= 90) range = '51-90';
  else if (tailleLot <= 150) range = '91-150';
  else if (tailleLot <= 280) range = '151-280';
  else if (tailleLot <= 500) range = '281-500';
  else if (tailleLot <= 1200) range = '501-1200';
  else if (tailleLot <= 3200) range = '1201-3200';
  else if (tailleLot <= 10000) range = '3201-10000';
  else range = '10001-35000';

  const params = tables[niveauInspection]?.[range] || { echantillon: 20, Ac: 1, Re: 2 };
  
  return {
    taille_echantillon: params.echantillon,
    nb_acceptation: params.Ac,
    nb_rejet: params.Re,
  };
}

// Machine à états pour les contrôles
async function gererMachineEtats(fournisseur_id: string, decision: string) {
  // Récupérer l'historique des 10 derniers lots du fournisseur
  const tousLots = await kv.getByPrefix('lot:');
  const lotsFournisseur = (tousLots || [])
    .filter((l: any) => l.fournisseur_id === fournisseur_id)
    .sort((a: any, b: any) => new Date(b.date_reception).getTime() - new Date(a.date_reception).getTime())
    .slice(0, 10);

  const historiqueEtat = await kv.get(`etat_controle:${fournisseur_id}`) || {
    etat_actuel: 'normal',
    lots_consecutifs_acceptes: 0,
    lots_consecutifs_rejetes: 0,
    rejets_sur_5: 0,
  };

  let nouvelEtat = historiqueEtat.etat_actuel;
  let alerte = null;

  if (decision === 'ACCEPTER') {
    historiqueEtat.lots_consecutifs_acceptes++;
    historiqueEtat.lots_consecutifs_rejetes = 0;

    // Normal -> Réduit : 10 lots acceptés consécutifs
    if (historiqueEtat.etat_actuel === 'normal' && historiqueEtat.lots_consecutifs_acceptes >= 10) {
      alerte = {
        type: 'validation_reduit',
        titre: 'Passage en contrôle réduit',
        message: `Le fournisseur a 10 lots acceptés consécutifs. Validation responsable requise pour passage en réduit.`,
        severite: 'info',
      };
    }

    // Renforcé -> Normal : 5 lots acceptés consécutifs
    if (historiqueEtat.etat_actuel === 'renforce' && historiqueEtat.lots_consecutifs_acceptes >= 5) {
      nouvelEtat = 'normal';
      historiqueEtat.lots_consecutifs_acceptes = 0;
      alerte = {
        type: 'retour_normal',
        titre: 'Retour en contrôle normal',
        message: `Le fournisseur est passé de renforcé à normal après 5 lots acceptés consécutifs.`,
        severite: 'info',
      };
    }
  } else { // REJETER
    historiqueEtat.lots_consecutifs_acceptes = 0;
    historiqueEtat.lots_consecutifs_rejetes++;
    historiqueEtat.rejets_sur_5 = lotsFournisseur.slice(0, 5).filter((l: any) => l.decision_finale === 'REJETER').length;

    // Normal -> Renforcé : 2 rejets consécutifs OU 2 rejets sur 5 lots
    if (historiqueEtat.etat_actuel === 'normal' && 
        (historiqueEtat.lots_consecutifs_rejetes >= 2 || historiqueEtat.rejets_sur_5 >= 2)) {
      nouvelEtat = 'renforce';
      alerte = {
        type: 'passage_renforce',
        titre: 'CRITIQUE : Passage en contrôle renforcé',
        message: `Le fournisseur passe en contrôle renforcé suite à des rejets répétés.`,
        severite: 'critical',
      };
    }

    // Réduit -> Normal : 1 rejet
    if (historiqueEtat.etat_actuel === 'reduit') {
      nouvelEtat = 'normal';
      alerte = {
        type: 'retour_normal_depuis_reduit',
        titre: 'Retour en contrôle normal',
        message: `Le fournisseur repasse en normal suite à un rejet en contrôle réduit.`,
        severite: 'warning',
      };
    }

    // Alerte si renforcé sans amélioration après 5 lots
    if (historiqueEtat.etat_actuel === 'renforce' && lotsFournisseur.length >= 5) {
      const rejetsEnRenforce = lotsFournisseur.slice(0, 5).filter((l: any) => l.decision_finale === 'REJETER').length;
      if (rejetsEnRenforce >= 2) {
        alerte = {
          type: 'renforce_persistant',
          titre: 'URGENT : Contrôle renforcé persistant',
          message: `Le fournisseur reste en renforcé sans amélioration. Intervention responsable requise.`,
          severite: 'critical',
        };
      }
    }
  }

  // Sauvegarder le nouvel état
  historiqueEtat.etat_actuel = nouvelEtat;
  await kv.set(`etat_controle:${fournisseur_id}`, historiqueEtat);

  return { nouvelEtat, alerte };
}

app.post('/make-server-b3b7bc95/inspections', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const { lot_id, taille_lot, niveau_inspection, aql, nb_defauts, defauts_critique, defauts_majeur, defauts_mineur, type_defaut, commentaire } = await c.req.json();

    // Calcul ISO 2859-1
    const resultatISO = calculerEchantillonISO(taille_lot, niveau_inspection, aql);
    const decision = nb_defauts <= resultatISO.nb_acceptation ? 'ACCEPTER' : 'REJETER';

    // Récupérer le lot
    const lot = await kv.get(`lot:${lot_id}`);
    if (!lot) {
      return c.json({ error: 'Lot introuvable' }, 404);
    }

    // Gérer la machine à états
    const { nouvelEtat, alerte } = await gererMachineEtats(lot.fournisseur_id, decision);

    // Créer l'inspection
    const inspection_id = `insp_${Date.now()}`;
    const now = new Date();
    const inspection = {
      id: inspection_id,
      lot_id,
      taille_lot,
      niveau_inspection,
      aql,
      taille_echantillon: resultatISO.taille_echantillon,
      nb_defauts,
      defauts_critique: defauts_critique || 0,
      defauts_majeur: defauts_majeur || 0,
      defauts_mineur: defauts_mineur || 0,
      type_defaut,
      decision,
      etat_controle: nouvelEtat,
      inspecteur_id: user.id,
      date_inspection: now.toISOString().split('T')[0],
      heure_inspection: now.toISOString().split('T')[1].substring(0, 8),
      commentaire,
      created_at: now.toISOString(),
    };

    await kv.set(`inspection:${inspection_id}`, inspection);

    // Mettre à jour le lot avec la décision finale et l'état
    lot.decision_finale = decision;
    lot.etat_controle = nouvelEtat;
    lot.statut_reception = decision === 'ACCEPTER' ? 'accepte' : 'rejete';
    await kv.set(`lot:${lot_id}`, lot);

    // Créer une alerte si nécessaire
    if (alerte) {
      const alerte_id = `alerte_${Date.now()}`;
      const nouvelleAlerte = {
        id: alerte_id,
        ...alerte,
        lot_id,
        fournisseur_id: lot.fournisseur_id,
        statut: 'nouvelle',
        created_by: user.id,
        created_at: new Date().toISOString(),
      };
      await kv.set(`alerte:${alerte_id}`, nouvelleAlerte);
    }

    // Historique état
    const historique_id = `hist_${Date.now()}`;
    await kv.set(`historique:${historique_id}`, {
      id: historique_id,
      lot_id,
      ancien_etat: lot.etat_controle,
      nouvel_etat: nouvelEtat,
      raison: `Inspection: ${decision}`,
      user_id: user.id,
      created_at: new Date().toISOString(),
    });

    return c.json({ inspection, alerte });
  } catch (error) {
    console.error('Erreur création inspection:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.get('/make-server-b3b7bc95/inspections', async (c) => {
  try {
    const inspections = await kv.getByPrefix('inspection:');
    return c.json(inspections || []);
  } catch (error) {
    console.error('Erreur récupération inspections:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== ALERTES =====

app.get('/make-server-b3b7bc95/alertes', async (c) => {
  try {
    const alertes = await kv.getByPrefix('alerte:');
    
    // Enrichir avec relations
    const alertesEnrichies = await Promise.all(
      (alertes || []).map(async (alerte: any) => {
        const lot = alerte.lot_id ? await kv.get(`lot:${alerte.lot_id}`) : null;
        const fournisseur = alerte.fournisseur_id ? await kv.get(`fournisseur:${alerte.fournisseur_id}`) : null;
        
        return {
          ...alerte,
          lot,
          fournisseur,
        };
      })
    );

    return c.json(alertesEnrichies);
  } catch (error) {
    console.error('Erreur récupération alertes:', error);
    return c.json({ error: String(error) }, 500);
  }
});

app.patch('/make-server-b3b7bc95/alertes/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (error || !user) {
      return c.json({ error: 'Non autorisé' }, 401);
    }

    const alerte_id = c.req.param('id');
    const { statut } = await c.req.json();

    const alerte = await kv.get(`alerte:${alerte_id}`);
    if (!alerte) {
      return c.json({ error: 'Alerte introuvable' }, 404);
    }

    alerte.statut = statut;
    if (statut === 'resolue') {
      alerte.resolved_by = user.id;
      alerte.resolved_at = new Date().toISOString();
    }

    await kv.set(`alerte:${alerte_id}`, alerte);
    return c.json(alerte);
  } catch (error) {
    console.error('Erreur mise à jour alerte:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== STATISTIQUES =====

app.get('/make-server-b3b7bc95/statistiques', async (c) => {
  try {
    const lots = await kv.getByPrefix('lot:');
    const alertes = await kv.getByPrefix('alerte:');
    const inspections = await kv.getByPrefix('inspection:');
    const users = await kv.getByPrefix('user:');
    const produits = await kv.getByPrefix('produit:');

    const total_lots = lots?.length || 0;
    const lots_acceptes = lots?.filter((l: any) => l.decision_finale === 'ACCEPTER').length || 0;
    const lots_rejetes = lots?.filter((l: any) => l.decision_finale === 'REJETER').length || 0;
    const lots_en_attente = lots?.filter((l: any) => l.statut_reception === 'en_attente').length || 0;
    const lots_bloques = lots?.filter((l: any) => l.statut_reception === 'bloque').length || 0;
    
    const taux_acceptation = total_lots > 0 ? parseFloat((lots_acceptes / total_lots * 100).toFixed(1)) : 0;
    const taux_conformite_global = total_lots > 0 ? parseFloat((lots_acceptes / total_lots * 100).toFixed(1)) : 0;
    const alertes_actives = alertes?.filter((a: any) => a.statut !== 'resolue').length || 0;

    const lots_par_etat = {
      normal: lots?.filter((l: any) => l.etat_controle === 'normal').length || 0,
      renforce: lots?.filter((l: any) => l.etat_controle === 'renforce').length || 0,
      reduit: lots?.filter((l: any) => l.etat_controle === 'reduit').length || 0,
    };

    const lots_par_statut = {
      en_attente: lots_en_attente,
      en_cours_inspection: lots?.filter((l: any) => l.statut_reception === 'en_cours_inspection').length || 0,
      accepte: lots?.filter((l: any) => l.statut_reception === 'accepte').length || 0,
      rejete: lots?.filter((l: any) => l.statut_reception === 'rejete').length || 0,
      bloque: lots_bloques,
    };

    // Défauts par type
    const defauts_par_type = {
      critiques: inspections?.reduce((sum: number, i: any) => sum + (i.defauts_critique || 0), 0) || 0,
      majeurs: inspections?.reduce((sum: number, i: any) => sum + (i.defauts_majeur || 0), 0) || 0,
      mineurs: inspections?.reduce((sum: number, i: any) => sum + (i.defauts_mineur || 0), 0) || 0,
    };

    // Performance des inspecteurs
    const performance_inspecteurs = (users || [])
      .filter((u: any) => u.role === 'magasinier')
      .map((u: any) => {
        const insp = inspections?.filter((i: any) => i.inspecteur_id === u.id) || [];
        const acceptes = insp.filter((i: any) => i.decision === 'ACCEPTER').length;
        return {
          inspecteur: `${u.prenom} ${u.nom}`,
          nb_inspections: insp.length,
          taux_conformite: insp.length > 0 ? parseFloat((acceptes / insp.length * 100).toFixed(1)) : 0,
        };
      })
      .filter((p: any) => p.nb_inspections > 0);

    // Statistiques par fournisseur
    const fournisseurs = await kv.getByPrefix('fournisseur:');
    const fournisseurs_top = (fournisseurs || []).map((f: any) => {
      const lotsFourn = lots?.filter((l: any) => l.fournisseur_id === f.id) || [];
      const acceptes = lotsFourn.filter((l: any) => l.decision_finale === 'ACCEPTER').length;
      const rejetes = lotsFourn.filter((l: any) => l.decision_finale === 'REJETER').length;
      const total = lotsFourn.length;
      
      return {
        fournisseur: f.nom,
        taux_acceptation: total > 0 ? parseFloat((acceptes / total * 100).toFixed(1)) : 0,
        total_lots: total,
        nb_non_conformites: rejetes,
      };
    }).sort((a: any, b: any) => b.taux_acceptation - a.taux_acceptation);

    // Conformité par produit
    const conformite_par_produit = (produits || []).map((p: any) => {
      const lotsProduit = lots?.filter((l: any) => l.produit_id === p.id) || [];
      const acceptes = lotsProduit.filter((l: any) => l.decision_finale === 'ACCEPTER').length;
      const total = lotsProduit.length;
      
      return {
        produit: p.nom,
        taux_conformite: total > 0 ? parseFloat((acceptes / total * 100).toFixed(1)) : 0,
      };
    }).filter((p: any) => p.taux_conformite > 0);

    // Temps moyen et coûts (estimés)
    const temps_moyen_traitement = 2.5; // heures (estimé)
    const cout_moyen_controle = 150; // euros (estimé)
    const cout_non_conformites = lots_rejetes * 500; // euros (estimé)

    return c.json({
      total_lots,
      lots_acceptes,
      lots_rejetes,
      lots_en_attente,
      lots_bloques,
      taux_acceptation,
      taux_conformite_global,
      alertes_actives,
      temps_moyen_traitement,
      cout_moyen_controle,
      cout_non_conformites,
      lots_par_etat,
      lots_par_statut,
      defauts_par_type,
      performance_inspecteurs,
      fournisseurs_top: fournisseurs_top.slice(0, 10),
      conformite_par_produit,
      evolution_mensuelle: [], // TODO: implémenter si besoin
    });
  } catch (error) {
    console.error('Erreur récupération statistiques:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// ===== INITIALISATION DES DONNÉES DE TEST =====

app.post('/make-server-b3b7bc95/seed', async (c) => {
  try {
    // Créer des utilisateurs de test
    const magasinier = {
      id: 'user_mag_1',
      email: 'magasinier@test.com',
      nom: 'Dupont',
      prenom: 'Jean',
      role: 'magasinier',
      poste: 'Magasinier',
      service: 'Réception',
      matricule: 'MAG001',
      created_at: new Date().toISOString(),
    };

    const responsable = {
      id: 'user_resp_1',
      email: 'responsable@test.com',
      nom: 'Martin',
      prenom: 'Sophie',
      role: 'responsable',
      poste: 'Responsable Qualité',
      service: 'Qualité',
      matricule: 'RES001',
      created_at: new Date().toISOString(),
    };

    await kv.set('user:user_mag_1', magasinier);
    await kv.set('user:user_resp_1', responsable);

    // Créer les utilisateurs dans Supabase Auth
    await supabase.auth.admin.createUser({
      email: 'magasinier@test.com',
      password: 'magasinier123',
      email_confirm: true,
      user_metadata: { nom: 'Dupont', prenom: 'Jean', role: 'magasinier', poste: 'Magasinier', service: 'Réception', matricule: 'MAG001' },
    }).catch(() => {}); // Ignorer si existe déjà

    await supabase.auth.admin.createUser({
      email: 'responsable@test.com',
      password: 'responsable123',
      email_confirm: true,
      user_metadata: { nom: 'Martin', prenom: 'Sophie', role: 'responsable', poste: 'Responsable Qualité', service: 'Qualité', matricule: 'RES001' },
    }).catch(() => {});

    // Créer des produits
    const produit1 = {
      id: 'prod_1',
      code: 'MAT-001',
      reference: 'REF-ACIER-304',
      nom: 'Acier inoxydable 304',
      categorie: 'Métaux',
      specifications: 'Acier inoxydable austénitique, résistant à la corrosion',
      description: 'Matière première acier pour pièces mécaniques',
      created_at: new Date().toISOString(),
    };

    const produit2 = {
      id: 'prod_2',
      code: 'MAT-002',
      reference: 'REF-PLAST-ABS',
      nom: 'Plastique ABS',
      categorie: 'Plastiques',
      specifications: 'Acrylonitrile Butadiène Styrène, injection',
      description: 'Granulés plastique pour moulage',
      created_at: new Date().toISOString(),
    };

    await kv.set('produit:prod_1', produit1);
    await kv.set('produit:prod_2', produit2);

    // Créer des fournisseurs
    const fournisseur1 = {
      id: 'fourn_1',
      code: 'MTX',
      nom: 'Métaux France',
      pays: 'France',
      statut: 'actif',
      email: 'contact@metauxfrance.fr',
      telephone: '01 23 45 67 89',
      score_qualite: 95,
      created_at: new Date().toISOString(),
    };

    const fournisseur2 = {
      id: 'fourn_2',
      code: 'PLP',
      nom: 'PlastiPro',
      pays: 'Allemagne',
      statut: 'actif',
      email: 'info@plastipro.de',
      telephone: '+49 30 123 456',
      score_qualite: 88,
      created_at: new Date().toISOString(),
    };

    const fournisseur3 = {
      id: 'fourn_3',
      code: 'CHN',
      nom: 'China Materials Ltd',
      pays: 'Chine',
      statut: 'sous_surveillance',
      email: 'contact@chinamaterials.cn',
      telephone: '+86 10 8765 4321',
      score_qualite: 72,
      created_at: new Date().toISOString(),
    };

    await kv.set('fournisseur:fourn_1', fournisseur1);
    await kv.set('fournisseur:fourn_2', fournisseur2);
    await kv.set('fournisseur:fourn_3', fournisseur3);

    return c.json({ 
      success: true, 
      message: 'Données de test créées',
      credentials: {
        magasinier: { email: 'magasinier@test.com', password: 'magasinier123' },
        responsable: { email: 'responsable@test.com', password: 'responsable123' },
      }
    });
  } catch (error) {
    console.error('Erreur seed:', error);
    return c.json({ error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);
