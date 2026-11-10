# Gestion & Contrôle des Matières Premières - ISO 2859-1

Application web professionnelle de gestion et contrôle qualité des matières premières selon la norme ISO 2859-1.

## 🎯 Fonctionnalités

### ✅ Authentification et Rôles
- **Magasinier** : Enregistrement des réceptions et inspections
- **Responsable** : Dashboard, statistiques, gestion des alertes
- **Admin** : Gestion complète (à venir)

### ✅ Réception des Matières
- Enregistrement automatique de la date/heure
- Sélection produit et fournisseur
- Numéro de lot et quantité

### ✅ Inspection ISO 2859-1
- Calcul automatique de la taille d'échantillon
- Tables ISO 2859-1 complètes intégrées
- 3 niveaux d'inspection (I, II, III)
- Support de tous les AQL standards
- Décision automatique ACCEPTER/REJETER
- Commentaires et types de défauts

### ✅ Machine à États Automatique
- **Normal** : État standard
- **Renforcé** : Activé après 2 rejets consécutifs ou 2 rejets sur 5 lots
- **Réduit** : Après 10 lots acceptés consécutifs (validation responsable)
- Retour automatique en normal après 5 lots acceptés en renforcé
- Retour en normal depuis réduit si 1 rejet

### ✅ Système d'Alertes
- Alertes automatiques selon l'état de contrôle
- 3 niveaux de sévérité (Info, Attention, Critique)
- Centre de notifications avec compteur
- Gestion des alertes par le responsable
- Suivi du statut (nouvelle, en cours, résolue)

### ✅ Dashboard Responsable
- Statistiques en temps réel
- Graphiques interactifs (recharts)
- Taux d'acceptation global et par fournisseur
- Répartition par état de contrôle
- Historique des derniers lots

### ✅ Traçabilité Complète
- Historique de tous les changements d'état
- Logs d'inspection détaillés
- Association lot → produit → fournisseur → inspecteur

## 🚀 Démarrage Rapide

### 1. Initialiser les Données de Test

Lors de la première utilisation, cliquez sur le bouton **"Initialiser les données"** en bas à droite de la page de connexion.

Cela créera automatiquement :
- 2 utilisateurs de test
- 2 produits
- 2 fournisseurs

### 2. Se Connecter

**Compte Magasinier :**
- Email : `magasinier@test.com`
- Mot de passe : `magasinier123`

**Compte Responsable :**
- Email : `responsable@test.com`
- Mot de passe : `responsable123`

### 3. Scénario de Test Complet

#### En tant que Magasinier :

1. **Réception d'un lot**
   - Cliquez sur "Réception"
   - Numéro de lot : `LOT-2025-001`
   - Produit : Acier inoxydable 304
   - Fournisseur : Métaux France
   - Quantité : 500
   - Cliquez sur "Enregistrer la réception"

2. **Inspection du lot**
   - Cliquez sur "Inspection"
   - Sélectionnez le lot créé : `LOT-2025-001`
   - Taille du lot : 500 (prérempli)
   - Niveau : II (Normal)
   - AQL : 1.0
   - Cliquez sur "Calculer la taille d'échantillon"
   - **Résultat** : Échantillon de 50 unités, Ac=2, Re=3
   - Nombre de défauts trouvés : `1`
   - Type de défaut : `Rayure légère`
   - Commentaire : `Contrôle visuel effectué`
   - Cliquez sur "Valider l'inspection"
   - **Décision** : ACCEPTER (1 ≤ 2)

3. **Tester un rejet**
   - Créez un nouveau lot : `LOT-2025-002`
   - Même fournisseur, quantité : 300
   - Inspection avec 5 défauts
   - **Décision** : REJETER (5 ≥ 3)

4. **Déclencher une alerte critique**
   - Créez un 3ème lot du même fournisseur
   - Inspection avec rejet
   - **Résultat** : Passage en contrôle renforcé + Alerte critique

#### En tant que Responsable :

1. **Consulter le Dashboard**
   - Cliquez sur "Tableau de bord"
   - Visualiser les statistiques
   - Graphiques de répartition
   - Performance des fournisseurs

2. **Gérer les Alertes**
   - Cliquez sur "Alertes" dans le menu
   - Voir l'alerte critique créée
   - Cliquez sur "Prendre en charge"
   - Puis "Résoudre" une fois traité

3. **Notifications**
   - Icône cloche en haut à droite
   - Badge avec le nombre d'alertes
   - Popup avec détails

## 📊 Norme ISO 2859-1

L'application implémente fidèlement la norme ISO 2859-1 pour l'échantillonnage simple :

### Tables Intégrées
- **Lettres code** : Correspondance taille de lot → lettre (A à R)
- **Tailles d'échantillon** : 2 à 2000 unités
- **Critères Ac/Re** : Pour tous les AQL de 0.065% à 4.0%

### Niveaux d'Inspection
- **Niveau I** : Réduit (moins d'échantillons)
- **Niveau II** : Normal (standard)
- **Niveau III** : Renforcé (plus d'échantillons)

### AQL Supportés
0.065, 0.10, 0.15, 0.25, 0.40, 0.65, 1.0, 1.5, 2.5, 4.0

## 🔧 Architecture Technique

### Frontend
- **React** avec TypeScript
- **Tailwind CSS** pour le design
- **Shadcn/UI** pour les composants
- **Recharts** pour les graphiques
- **Lucide React** pour les icônes

### Backend
- **Supabase** (PostgreSQL)
- **Hono** (serveur Edge Functions)
- **KV Store** pour stockage simple

### Sécurité
- Authentification Supabase Auth
- Mots de passe hashés automatiquement
- Sessions sécurisées
- Rôles utilisateurs

## 📱 Interface

### Design
- **Moderne et professionnel**
- **Épuré** : Focus sur l'essentiel
- **Responsive** : Adapté desktop et tablette
- **Accessible** : Composants conformes
- **Couleurs** : Palette cohérente avec badges de statut

### Navigation
- Menu principal avec icônes
- Badge de notifications
- Profil utilisateur en haut à droite
- Navigation contextuelle selon le rôle

## 🎓 Guide d'Utilisation

### Pour les Magasiniers

1. **Réception**
   - Enregistrer chaque arrivée de matière
   - Informations minimales requises
   - Horodatage automatique

2. **Inspection**
   - Sélectionner le lot à inspecter
   - Suivre les instructions ISO 2859-1
   - Le système calcule tout automatiquement
   - Enregistrer les observations

### Pour les Responsables

1. **Surveillance**
   - Dashboard avec vue d'ensemble
   - Alertes en temps réel
   - Graphiques de tendances

2. **Actions**
   - Traiter les alertes critiques
   - Valider les passages en contrôle réduit
   - Consulter l'historique
   - Exporter les rapports (à venir)

## 🔄 Machine à États

```
NORMAL
  ├─ 2 rejets consécutifs → RENFORCÉ
  ├─ 2 rejets sur 5 lots → RENFORCÉ
  └─ 10 acceptés consécutifs → RÉDUIT (validation requise)

RENFORCÉ
  ├─ 5 acceptés consécutifs → NORMAL
  └─ Pas d'amélioration après 5 lots → ALERTE URGENTE

RÉDUIT
  └─ 1 rejet → NORMAL
```

## 📈 Évolutions Futures

- [ ] Export Excel/PDF des rapports
- [ ] Graphiques d'évolution mensuelle
- [ ] Photos de défauts
- [ ] Score fournisseur automatique
- [ ] Assistant qualité (aide contextuelle)
- [ ] Gestion utilisateurs (admin)
- [ ] Notifications email (SMTP)
- [ ] Sauvegarde automatique
- [ ] Import/export CSV
- [ ] API REST complète

## 🐛 Support

Pour toute question ou problème :
1. Vérifier que les données ont été initialisées
2. Rafraîchir la page
3. Vider le cache du navigateur
4. Se reconnecter

## 📝 Notes Importantes

- **Données de test** : Les données sont stockées dans Supabase et persistent entre les sessions
- **Temps réel** : Les statistiques se mettent à jour automatiquement
- **Alertes** : Vérifiées toutes les 30 secondes
- **ISO 2859-1** : Tables officielles complètes intégrées
- **Production ready** : Code propre, typé, commenté

---

**Version** : 1.0.0  
**Date** : Octobre 2025  
**Norme** : ISO 2859-1 (Échantillonnage simple, niveau normal)
