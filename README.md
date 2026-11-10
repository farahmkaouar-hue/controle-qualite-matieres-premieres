# Contrôle qualité des matières premières

Application web réalisée pendant mon stage chez SIDILEC International (juin – juillet 2025). Elle numérise la réception et le contrôle qualité des matières premières selon la norme **ISO 2859-1**.

## Fonctionnalités

- **Réception** des lots de matières premières par le magasinier.
- **Calcul automatique** de la taille d'échantillon et des critères d'acceptation ou de rejet (AQL) selon l'ISO 2859-1.
- **Inspection** et décision d'acceptation ou de rejet du lot.
- **Tableau de bord** du responsable qualité : statistiques, alertes et historique.
- Deux profils : magasinier et responsable qualité.

Le stage comprenait aussi un diagnostic qualité (Ishikawa, 5 Pourquoi, Pareto).

## Technologies

React, TypeScript, Vite, Tailwind, Supabase (PostgreSQL).

## Lancer le projet

1. Créer un fichier `.env` avec `VITE_SUPABASE_PROJECT_ID` et `VITE_SUPABASE_ANON_KEY` (votre propre projet Supabase).
2. `npm install`
3. `npm run dev`
