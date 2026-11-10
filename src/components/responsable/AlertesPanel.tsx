import { useState, useEffect } from 'react';
import { callServer } from '../../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import type { Alerte } from '../../types';

export function AlertesPanel() {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreStatut, setFiltreStatut] = useState<'toutes' | 'nouvelles' | 'en_cours' | 'resolues'>('nouvelles');

  useEffect(() => {
    loadAlertes();
  }, []);

  const loadAlertes = async () => {
    setLoading(true);
    const { data } = await callServer<Alerte[]>('/alertes');
    if (data) {
      setAlertes(data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
    setLoading(false);
  };

  const handleChangeStatut = async (alerteId: string, nouveauStatut: 'en_cours' | 'resolue') => {
    const { data, error } = await callServer(`/alertes/${alerteId}`, {
      method: 'PATCH',
      body: JSON.stringify({ statut: nouveauStatut }),
    });

    if (!error && data) {
      setAlertes(alertes.map(a => a.id === alerteId ? { ...a, statut: nouveauStatut } : a));
    }
  };

  const alertesFiltrees = alertes.filter(a => {
    if (filtreStatut === 'toutes') return true;
    return a.statut === filtreStatut;
  });

  const getNombreParStatut = (statut: string) => {
    return alertes.filter(a => a.statut === statut).length;
  };

  const getSeveriteIcon = (severite: string) => {
    switch (severite) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeveriteBadge = (severite: string) => {
    switch (severite) {
      case 'critical':
        return <Badge variant="destructive">Critique</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-yellow-500">Attention</Badge>;
      default:
        return <Badge variant="secondary">Info</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Gestion des Alertes</h2>
          <p className="text-muted-foreground">Suivi et résolution des alertes qualité</p>
        </div>
        <Button variant="outline" onClick={loadAlertes} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Nouvelles</CardDescription>
            <CardTitle className="text-2xl">{getNombreParStatut('nouvelle')}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En cours</CardDescription>
            <CardTitle className="text-2xl">{getNombreParStatut('en_cours')}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Résolues</CardDescription>
            <CardTitle className="text-2xl">{getNombreParStatut('resolue')}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{alertes.length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Liste des alertes */}
      <Card>
        <CardHeader>
          <CardTitle>Alertes</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={filtreStatut} onValueChange={(v: any) => setFiltreStatut(v)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="nouvelles">
                Nouvelles ({getNombreParStatut('nouvelle')})
              </TabsTrigger>
              <TabsTrigger value="en_cours">
                En cours ({getNombreParStatut('en_cours')})
              </TabsTrigger>
              <TabsTrigger value="resolues">
                Résolues ({getNombreParStatut('resolue')})
              </TabsTrigger>
              <TabsTrigger value="toutes">
                Toutes ({alertes.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filtreStatut} className="mt-6">
              {alertesFiltrees.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune alerte dans cette catégorie</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertesFiltrees.map((alerte) => (
                    <Alert key={alerte.id} className={
                      alerte.severite === 'critical' ? 'border-red-300 bg-red-50' :
                      alerte.severite === 'warning' ? 'border-yellow-300 bg-yellow-50' :
                      'border-blue-300 bg-blue-50'
                    }>
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3 flex-1">
                          {getSeveriteIcon(alerte.severite)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {getSeveriteBadge(alerte.severite)}
                              <Badge variant="outline" className="capitalize">
                                {alerte.statut === 'nouvelle' ? 'Nouvelle' :
                                 alerte.statut === 'en_cours' ? 'En cours' : 'Résolue'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(alerte.created_at).toLocaleString('fr-FR')}
                              </span>
                            </div>
                            <AlertDescription>
                              <h4 className="font-semibold text-base mb-1">{alerte.titre}</h4>
                              <p className="mb-2">{alerte.message}</p>
                              {alerte.fournisseur && (
                                <p className="text-sm">
                                  <strong>Fournisseur:</strong> {alerte.fournisseur.nom}
                                </p>
                              )}
                              {alerte.lot && (
                                <p className="text-sm">
                                  <strong>Lot:</strong> {alerte.lot.numero_lot}
                                </p>
                              )}
                            </AlertDescription>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {alerte.statut === 'nouvelle' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleChangeStatut(alerte.id, 'en_cours')}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Prendre en charge
                            </Button>
                          )}
                          {alerte.statut === 'en_cours' && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleChangeStatut(alerte.id, 'resolue')}
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Résoudre
                            </Button>
                          )}
                          {alerte.statut === 'resolue' && (
                            <Badge variant="outline" className="text-green-700 border-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Résolue
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Alert>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
