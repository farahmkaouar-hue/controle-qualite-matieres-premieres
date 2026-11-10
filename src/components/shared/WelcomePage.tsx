import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Package, ClipboardCheck, BarChart3, Bell, CheckCircle, Shield } from 'lucide-react';
import type { User } from '../../types';

interface WelcomePageProps {
  user: User;
  onGetStarted: () => void;
}

export function WelcomePage({ user, onGetStarted }: WelcomePageProps) {
  const isMagasinier = user.role === 'magasinier';

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* En-tête de bienvenue */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-primary rounded-full flex items-center justify-center mb-4">
          <Shield className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl">Bienvenue, {user.prenom} {user.nom} !</h1>
        <p className="text-muted-foreground text-lg">
          Gestion et Contrôle des Matières Premières - ISO 2859-1
        </p>
      </div>

      {/* Présentation selon le rôle */}
      {isMagasinier ? (
        <Card>
          <CardHeader>
            <CardTitle>Vos Missions - Magasinier</CardTitle>
            <CardDescription>
              Vous êtes responsable de l'enregistrement des réceptions et des inspections qualité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <Package className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg mb-1">1. Réception des Matières</h3>
                <p className="text-muted-foreground">
                  Enregistrez chaque arrivée de matière première avec le numéro de lot, 
                  le produit, le fournisseur et la quantité. L'horodatage est automatique.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <ClipboardCheck className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg mb-1">2. Inspection ISO 2859-1</h3>
                <p className="text-muted-foreground">
                  Effectuez le contrôle qualité selon la norme ISO 2859-1. Le système calcule 
                  automatiquement la taille de l'échantillon et la décision d'acceptation ou de rejet.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <Bell className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg mb-1">3. Notifications</h3>
                <p className="text-muted-foreground">
                  Recevez des alertes en cas de changement d'état de contrôle (passage en renforcé, etc.).
                  Les notifications apparaissent dans l'icône cloche en haut à droite.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Vos Missions - Responsable Qualité</CardTitle>
            <CardDescription>
              Vous supervisez les contrôles qualité et prenez les décisions stratégiques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg mb-1">1. Dashboard Qualité</h3>
                <p className="text-muted-foreground">
                  Consultez les statistiques en temps réel : taux d'acceptation, nombre de lots contrôlés,
                  performance des fournisseurs, et graphiques d'analyse.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <Bell className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg mb-1">2. Gestion des Alertes</h3>
                <p className="text-muted-foreground">
                  Traitez les alertes critiques (passage en contrôle renforcé, fournisseurs problématiques).
                  Prenez en charge, résolvez et suivez l'historique.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <CheckCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg mb-1">3. Validations</h3>
                <p className="text-muted-foreground">
                  Validez les demandes de passage en contrôle réduit pour les fournisseurs performants
                  (après 10 lots acceptés consécutifs).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fonctionnalités clés */}
      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités Clés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">✅ Conforme ISO 2859-1</h4>
              <p className="text-sm text-muted-foreground">
                Tables officielles complètes, calculs automatiques, 3 niveaux d'inspection
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">🔄 Machine à États</h4>
              <p className="text-sm text-muted-foreground">
                Gestion automatique des états Normal / Renforcé / Réduit selon les règles ISO
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">📊 Traçabilité Totale</h4>
              <p className="text-sm text-muted-foreground">
                Historique complet de tous les lots, inspections et changements d'état
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">🔔 Alertes Temps Réel</h4>
              <p className="text-sm text-muted-foreground">
                Notifications automatiques selon la criticité des événements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bouton d'action */}
      <div className="text-center">
        <Button onClick={onGetStarted} size="lg" className="text-lg px-8 py-6">
          {isMagasinier ? 'Commencer les Réceptions' : 'Voir le Dashboard'}
        </Button>
      </div>

      {/* Aide */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground">
            💡 <strong>Besoin d'aide ?</strong> Consultez le README.md pour un guide complet 
            ou contactez votre administrateur système.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
