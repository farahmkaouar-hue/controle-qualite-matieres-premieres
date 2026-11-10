import { useState, useEffect } from 'react';
import { callServer } from '../../utils/supabase/client';
import { FournisseurStats } from './FournisseurStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  AlertTriangle,
  Download,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { StatistiquesResponse, Alerte, Lot } from '../../types';

export function Dashboard() {
  const [stats, setStats] = useState<StatistiquesResponse | null>(null);
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [statsRes, alertesRes, lotsRes] = await Promise.all([
      callServer<StatistiquesResponse>('/statistiques'),
      callServer<Alerte[]>('/alertes'),
      callServer<Lot[]>('/lots'),
    ]);

    if (statsRes.data) setStats(statsRes.data);
    if (alertesRes.data) setAlertes(alertesRes.data.filter(a => a.statut !== 'resolue'));
    if (lotsRes.data) setLots(lotsRes.data.slice(0, 10)); // 10 derniers lots
    
    setLoading(false);
  };

  const handleExport = () => {
    alert('Fonctionnalité d\'export en développement');
  };

  const COLORS = ['#22c55e', '#ef4444', '#3b82f6'];

  const pieData = stats ? [
    { name: 'Normal', value: stats.lots_par_etat.normal },
    { name: 'Renforcé', value: stats.lots_par_etat.renforce },
    { name: 'Réduit', value: stats.lots_par_etat.reduit },
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl">Tableau de bord Qualité</h2>
          <p className="text-muted-foreground">Vue d'ensemble des contrôles ISO 2859-1</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Actualiser
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Lots</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-500" />
              {stats?.total_lots || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Lots contrôlés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Taux d'Acceptation</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              {stats?.taux_acceptation || 0}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {stats?.lots_acceptes || 0} acceptés / {stats?.lots_rejetes || 0} rejetés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Alertes Actives</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              {stats?.alertes_actives || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Nécessitent attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Contrôle Renforcé</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <XCircle className="w-6 h-6 text-red-500" />
              {stats?.lots_par_etat.renforce || 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Fournisseurs surveillés</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes critiques */}
      {alertes.filter(a => a.severite === 'critical').length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Alertes Critiques
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertes.filter(a => a.severite === 'critical').map((alerte) => (
              <Alert key={alerte.id} variant="destructive">
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div>
                      <strong>{alerte.titre}</strong>
                      <p className="text-sm mt-1">{alerte.message}</p>
                      {alerte.fournisseur && (
                        <p className="text-xs mt-2">Fournisseur: {alerte.fournisseur.nom}</p>
                      )}
                    </div>
                    <Badge>{new Date(alerte.created_at).toLocaleDateString('fr-FR')}</Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par état */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par État de Contrôle</CardTitle>
            <CardDescription>Distribution des lots selon leur état</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top fournisseurs */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Fournisseurs</CardTitle>
            <CardDescription>Top 5 fournisseurs par taux d'acceptation</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.fournisseurs_top || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fournisseur" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="taux_acceptation" fill="#22c55e" name="Taux acceptation (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance fournisseurs */}
      <FournisseurStats />

      {/* Derniers lots */}
      <Card>
        <CardHeader>
          <CardTitle>Derniers Lots Contrôlés</CardTitle>
          <CardDescription>Historique récent des inspections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lots.map((lot) => (
              <div key={lot.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  {lot.decision_finale === 'ACCEPTER' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : lot.decision_finale === 'REJETER' ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Package className="w-5 h-5 text-gray-400" />
                  )}
                  <div>
                    <p className="font-medium">{lot.numero_lot}</p>
                    <p className="text-sm text-muted-foreground">
                      {lot.produit?.nom} - {lot.fournisseur?.nom}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={
                    lot.etat_controle === 'normal' ? 'secondary' : 
                    lot.etat_controle === 'renforce' ? 'destructive' : 
                    'default'
                  }>
                    {lot.etat_controle}
                  </Badge>
                  {lot.decision_finale && (
                    <Badge variant={lot.decision_finale === 'ACCEPTER' ? 'default' : 'destructive'}>
                      {lot.decision_finale}
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {new Date(lot.date_reception).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
