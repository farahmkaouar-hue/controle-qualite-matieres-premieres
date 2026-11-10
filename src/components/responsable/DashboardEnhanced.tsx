import { useState, useEffect } from 'react';
import { callServer } from '../../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BarChart3,
  Package, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  AlertTriangle,
  Users,
  Clock,
  DollarSign,
  Shield,
  Target,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line 
} from 'recharts';
import type { StatistiquesResponse } from '../../types';

export function DashboardEnhanced() {
  const [stats, setStats] = useState<StatistiquesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await callServer<StatistiquesResponse>('/statistiques');
    if (data) setStats(data);
    setLoading(false);
  };

  const COLORS_ETAT = {
    normal: '#10b981',
    renforce: '#ef4444',
    reduit: '#3b82f6',
  };

  const COLORS_DEFAUTS = {
    critiques: '#dc2626',
    majeurs: '#f97316',
    mineurs: '#fbbf24',
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <BarChart3 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Tableau de Bord Qualité</h1>
              <p className="text-blue-100 mt-1">Contrôle ISO 2859-1 des matières premières</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-white">
            <Calendar className="w-5 h-5" />
            <span>{new Date().toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
            <Button 
              onClick={loadData} 
              variant="ghost" 
              className="ml-4 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>
      </div>

      {/* KPIs Principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-green-700">Taux de Conformité</CardTitle>
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{stats.taux_conformite_global}%</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.lots_acceptes} / {stats.total_lots} lots acceptés</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-red-700">Lots Rejetés</CardTitle>
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">{stats.lots_rejetes}</div>
            <p className="text-xs text-muted-foreground mt-1">{((stats.lots_rejetes / stats.total_lots) * 100 || 0).toFixed(1)}% du total</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-yellow-700">En Attente</CardTitle>
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{stats.lots_en_attente}</div>
            <p className="text-xs text-muted-foreground mt-1">Lots à inspecter</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-orange-700">Alertes Actives</CardTitle>
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-700">{stats.alertes_actives}</div>
            <p className="text-xs text-muted-foreground mt-1">Nécessitent une action</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les différentes sections */}
      <Tabs defaultValue="conformite" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 bg-blue-100">
          <TabsTrigger value="conformite" className="gap-2">
            <Target className="w-4 h-4" />
            Conformité
          </TabsTrigger>
          <TabsTrigger value="fournisseurs" className="gap-2">
            <Package className="w-4 h-4" />
            Fournisseurs
          </TabsTrigger>
          <TabsTrigger value="iso" className="gap-2">
            <Shield className="w-4 h-4" />
            Plan ISO
          </TabsTrigger>
          <TabsTrigger value="personnel" className="gap-2">
            <Users className="w-4 h-4" />
            Personnel
          </TabsTrigger>
          <TabsTrigger value="defauts" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Défauts
          </TabsTrigger>
          <TabsTrigger value="logistique" className="gap-2">
            <Clock className="w-4 h-4" />
            Logistique
          </TabsTrigger>
          <TabsTrigger value="couts" className="gap-2">
            <DollarSign className="w-4 h-4" />
            Coûts
          </TabsTrigger>
        </TabsList>

        {/* 1. Contrôle de conformité globale */}
        <TabsContent value="conformite" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-800">Répartition par Statut</CardTitle>
                <CardDescription>État actuel des lots reçus</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                    <span className="font-medium">En attente</span>
                    <Badge className="bg-yellow-500 text-white">{stats.lots_par_statut.en_attente}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <span className="font-medium">En cours d'inspection</span>
                    <Badge className="bg-blue-500 text-white">{stats.lots_par_statut.en_cours_inspection}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                    <span className="font-medium">Accepté</span>
                    <Badge className="bg-green-500 text-white">{stats.lots_par_statut.accepte}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                    <span className="font-medium">Rejeté</span>
                    <Badge className="bg-red-500 text-white">{stats.lots_par_statut.rejete}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
                    <span className="font-medium">Bloqué</span>
                    <Badge className="bg-gray-500 text-white">{stats.lots_par_statut.bloque}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-800">Conformité par Produit</CardTitle>
                <CardDescription>Taux de conformité par matière première</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.conformite_par_produit}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="produit" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="taux_conformite" fill="#8b5cf6" name="Taux (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. Suivi des fournisseurs */}
        <TabsContent value="fournisseurs" className="space-y-4">
          <Card className="border-2 border-indigo-200">
            <CardHeader className="bg-indigo-50">
              <CardTitle className="text-indigo-800">Performance Fournisseurs</CardTitle>
              <CardDescription>Classement par taux de conformité et non-conformités</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {stats.fournisseurs_top.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-gray-300'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-semibold">{f.fournisseur}</div>
                        <div className="text-sm text-muted-foreground">{f.total_lots} lots • {f.nb_non_conformites} non-conformités</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl font-bold ${f.taux_acceptation >= 90 ? 'text-green-600' : f.taux_acceptation >= 70 ? 'text-orange-600' : 'text-red-600'}`}>
                        {f.taux_acceptation}%
                      </div>
                      <Badge variant={f.taux_acceptation >= 90 ? 'default' : f.taux_acceptation >= 70 ? 'secondary' : 'destructive'}>
                        {f.taux_acceptation >= 90 ? 'Excellent' : f.taux_acceptation >= 70 ? 'Moyen' : 'Critique'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Application du plan ISO 2859-1 */}
        <TabsContent value="iso" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-800">États de Contrôle ISO 2859-1</CardTitle>
                <CardDescription>Répartition des lots par niveau de contrôle</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Normal', value: stats.lots_par_etat.normal },
                        { name: 'Renforcé', value: stats.lots_par_etat.renforce },
                        { name: 'Réduit', value: stats.lots_par_etat.reduit },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS_ETAT.normal} />
                      <Cell fill={COLORS_ETAT.renforce} />
                      <Cell fill={COLORS_ETAT.reduit} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-200">
              <CardHeader className="bg-teal-50">
                <CardTitle className="text-teal-800">Détails des États</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-green-800">Contrôle Normal</span>
                      <Badge className="bg-green-600 text-white">{stats.lots_par_etat.normal}</Badge>
                    </div>
                    <p className="text-sm text-green-700">État standard de contrôle</p>
                  </div>

                  <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-red-800">Contrôle Renforcé</span>
                      <Badge className="bg-red-600 text-white">{stats.lots_par_etat.renforce}</Badge>
                    </div>
                    <p className="text-sm text-red-700">Contrôle intensifié suite à des non-conformités</p>
                  </div>

                  <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-blue-800">Contrôle Réduit</span>
                      <Badge className="bg-blue-600 text-white">{stats.lots_par_etat.reduit}</Badge>
                    </div>
                    <p className="text-sm text-blue-700">Fournisseur fiable avec historique excellent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 4. Suivi du personnel */}
        <TabsContent value="personnel" className="space-y-4">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-purple-800">Performance des Inspecteurs</CardTitle>
              <CardDescription>Nombre d'inspections et taux de conformité par opérateur</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {stats.performance_inspecteurs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune donnée d'inspection disponible</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.performance_inspecteurs}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="inspecteur" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="nb_inspections" fill="#8884d8" name="Nb Inspections" />
                    <Bar yAxisId="right" dataKey="taux_conformite" fill="#82ca9d" name="Taux Conformité (%)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 5. Analyse des non-conformités */}
        <TabsContent value="defauts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-2 border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-800">Classification des Défauts</CardTitle>
                <CardDescription>Répartition par niveau de gravité</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                    <div>
                      <div className="font-semibold text-red-800">Défauts Critiques</div>
                      <p className="text-sm text-red-600">Risque sécurité/réglementaire</p>
                    </div>
                    <div className="text-3xl font-bold text-red-700">{stats.defauts_par_type.critiques}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                    <div>
                      <div className="font-semibold text-orange-800">Défauts Majeurs</div>
                      <p className="text-sm text-orange-600">Impact fonctionnel important</p>
                    </div>
                    <div className="text-3xl font-bold text-orange-700">{stats.defauts_par_type.majeurs}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <div>
                      <div className="font-semibold text-yellow-800">Défauts Mineurs</div>
                      <p className="text-sm text-yellow-600">Impact esthétique/mineur</p>
                    </div>
                    <div className="text-3xl font-bold text-yellow-700">{stats.defauts_par_type.mineurs}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200">
              <CardHeader className="bg-pink-50">
                <CardTitle className="text-pink-800">Graphique de Gravité</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Critiques', value: stats.defauts_par_type.critiques },
                        { name: 'Majeurs', value: stats.defauts_par_type.majeurs },
                        { name: 'Mineurs', value: stats.defauts_par_type.mineurs },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill={COLORS_DEFAUTS.critiques} />
                      <Cell fill={COLORS_DEFAUTS.majeurs} />
                      <Cell fill={COLORS_DEFAUTS.mineurs} />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 6. Suivi logistique */}
        <TabsContent value="logistique" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-2 border-cyan-200 bg-gradient-to-br from-cyan-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-cyan-700">Temps Moyen de Traitement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-cyan-700">{stats.temps_moyen_traitement}h</div>
                <p className="text-xs text-muted-foreground mt-1">Réception → Libération</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-teal-700">Stock Bloqué</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-teal-700">{stats.lots_bloques}</div>
                <p className="text-xs text-muted-foreground mt-1">Lots en attente de contrôle</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-emerald-700">Taux de Réactivité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-700">
                  {stats.lots_en_attente > 0 ? '⚠️' : '✅'}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.lots_en_attente === 0 ? 'Tous les lots traités' : `${stats.lots_en_attente} lots en attente`}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 7. Coûts et impact qualité */}
        <TabsContent value="couts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="border-2 border-emerald-200">
              <CardHeader className="bg-emerald-50">
                <CardTitle className="text-emerald-800">Coûts de Contrôle</CardTitle>
                <CardDescription>Analyse des dépenses qualité</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div>
                      <div className="font-semibold">Coût Moyen par Lot</div>
                      <p className="text-sm text-muted-foreground">Inspection standard</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-700">{stats.cout_moyen_controle}€</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 border-2 border-red-200 rounded-lg">
                    <div>
                      <div className="font-semibold">Coût des Non-Conformités</div>
                      <p className="text-sm text-muted-foreground">Rejets, re-tests, destructions</p>
                    </div>
                    <div className="text-2xl font-bold text-red-700">{stats.cout_non_conformites}€</div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                    <div>
                      <div className="font-semibold">Coût Total</div>
                      <p className="text-sm text-muted-foreground">Contrôle + Non-conformités</p>
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {(stats.cout_moyen_controle * stats.total_lots + stats.cout_non_conformites).toFixed(0)}€
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-800">Indicateurs ROI Qualité</CardTitle>
                <CardDescription>Retour sur investissement des actions qualité</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Taux d'Amélioration</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Les fournisseurs en contrôle réduit permettent des économies d'inspection
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-orange-800">Points d'Attention</span>
                    </div>
                    <p className="text-sm text-orange-700">
                      {stats.lots_par_etat.renforce} fournisseur(s) en contrôle renforcé nécessitent un suivi
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Économies Potentielles</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Amélioration de 1% du taux de conformité = {(stats.cout_non_conformites * 0.01).toFixed(0)}€ économisés
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
