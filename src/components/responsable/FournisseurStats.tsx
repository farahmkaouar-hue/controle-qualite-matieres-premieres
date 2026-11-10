import { useState, useEffect } from 'react';
import { callServer } from '../../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { TrendingUp, TrendingDown, Package, AlertTriangle, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Fournisseur, Lot } from '../../types';

export function FournisseurStats() {
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [fournRes, lotsRes] = await Promise.all([
      callServer<Fournisseur[]>('/fournisseurs'),
      callServer<Lot[]>('/lots'),
    ]);

    if (fournRes.data) setFournisseurs(fournRes.data);
    if (lotsRes.data) {
      setLots(lotsRes.data);
      // Sélectionner le premier fournisseur par défaut
      if (fournRes.data && fournRes.data.length > 0) {
        setSelectedFournisseur(fournRes.data[0].id);
      }
    }
    setLoading(false);
  };

  const fournisseur = fournisseurs.find(f => f.id === selectedFournisseur);
  const lotsFournisseur = lots.filter(l => l.fournisseur_id === selectedFournisseur);
  
  const stats = {
    total: lotsFournisseur.length,
    acceptes: lotsFournisseur.filter(l => l.decision_finale === 'ACCEPTER').length,
    rejetes: lotsFournisseur.filter(l => l.decision_finale === 'REJETER').length,
    en_attente: lotsFournisseur.filter(l => !l.decision_finale).length,
    etat_normal: lotsFournisseur.filter(l => l.etat_controle === 'normal').length,
    etat_renforce: lotsFournisseur.filter(l => l.etat_controle === 'renforce').length,
    etat_reduit: lotsFournisseur.filter(l => l.etat_controle === 'reduit').length,
  };

  const tauxAcceptation = stats.total > 0 
    ? ((stats.acceptes / (stats.acceptes + stats.rejetes)) * 100).toFixed(1)
    : 0;

  const scoreQualite = parseFloat(tauxAcceptation);

  const pieData = [
    { name: 'Acceptés', value: stats.acceptes, color: '#22c55e' },
    { name: 'Rejetés', value: stats.rejetes, color: '#ef4444' },
    { name: 'En attente', value: stats.en_attente, color: '#94a3b8' },
  ];

  const getScoreBadge = (score: number) => {
    if (score >= 95) return { label: 'Excellent', variant: 'default' as const, icon: Award };
    if (score >= 90) return { label: 'Très bon', variant: 'default' as const, icon: TrendingUp };
    if (score >= 80) return { label: 'Bon', variant: 'secondary' as const, icon: TrendingUp };
    if (score >= 70) return { label: 'Moyen', variant: 'default' as const, icon: Package };
    return { label: 'À surveiller', variant: 'destructive' as const, icon: AlertTriangle };
  };

  const scoreBadge = getScoreBadge(scoreQualite);
  const ScoreIcon = scoreBadge.icon;

  if (loading || fournisseurs.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center text-muted-foreground">
          Chargement des données fournisseurs...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Performance Fournisseur</CardTitle>
            <CardDescription>Statistiques détaillées et score qualité</CardDescription>
          </div>
          <Select value={selectedFournisseur} onValueChange={setSelectedFournisseur}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fournisseurs.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.nom} ({f.code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Score global */}
        {fournisseur && (
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div>
              <h3 className="text-sm text-muted-foreground mb-1">Score Qualité Global</h3>
              <div className="flex items-center gap-3">
                <p className="text-4xl">{tauxAcceptation}%</p>
                <Badge variant={scoreBadge.variant} className="gap-1">
                  <ScoreIcon className="w-3 h-3" />
                  {scoreBadge.label}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{fournisseur.nom}</p>
              <p className="text-xs text-muted-foreground">{fournisseur.code}</p>
              {fournisseur.email && (
                <p className="text-xs text-muted-foreground mt-1">{fournisseur.email}</p>
              )}
            </div>
          </div>
        )}

        {/* Statistiques détaillées */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total lots</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl">{stats.acceptes}</p>
                <p className="text-sm text-muted-foreground">Acceptés</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl">{stats.rejetes}</p>
                <p className="text-sm text-muted-foreground">Rejetés</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl">{stats.etat_renforce}</p>
                <p className="text-sm text-muted-foreground">En renforcé</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique de répartition */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-4">Répartition des lots</h4>
            {stats.total > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-4">État de contrôle actuel</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                <span className="text-sm">Normal</span>
                <Badge variant="secondary">{stats.etat_normal} lots</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                <span className="text-sm">Renforcé</span>
                <Badge variant="destructive">{stats.etat_renforce} lots</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded">
                <span className="text-sm">Réduit</span>
                <Badge variant="default">{stats.etat_reduit} lots</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Recommandations */}
        {scoreQualite < 80 && stats.total >= 5 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-900">Recommandation</h4>
                <p className="text-sm text-yellow-800 mt-1">
                  Le taux d'acceptation de ce fournisseur est inférieur à 80%. 
                  Envisagez une réunion qualité ou un audit fournisseur.
                </p>
              </div>
            </div>
          </div>
        )}

        {scoreQualite >= 95 && stats.total >= 10 && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Award className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900">Fournisseur d'excellence</h4>
                <p className="text-sm text-green-800 mt-1">
                  Performance exceptionnelle ! Ce fournisseur peut être éligible au contrôle réduit.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
