import { useState, useEffect } from 'react';
import { callServer } from '../../utils/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { History, Package, ClipboardCheck, Search, Filter, Calendar, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { Lot, Inspection } from '../../types';

interface HistoriquePageProps {
  onBack?: () => void;
}

export function HistoriquePage({ onBack }: HistoriquePageProps) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState<string>('tous');
  const [filterDecision, setFilterDecision] = useState<string>('tous');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [lotsRes, inspectionsRes] = await Promise.all([
      callServer<Lot[]>('/lots'),
      callServer<Inspection[]>('/inspections'),
    ]);

    if (lotsRes.data) {
      setLots(lotsRes.data.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    }
    if (inspectionsRes.data) {
      setInspections(inspectionsRes.data.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    }
    setLoading(false);
  };

  const lotsFiltres = lots.filter(lot => {
    const matchSearch = lot.numero_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lot.produit?.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       lot.fournisseur?.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatut = filterStatut === 'tous' || lot.statut_reception === filterStatut;
    const matchDecision = filterDecision === 'tous' || lot.decision_finale === filterDecision;
    
    return matchSearch && matchStatut && matchDecision;
  });

  const getStatutBadge = (statut: string) => {
    const variants: Record<string, { variant: any; color: string; label: string }> = {
      'en_attente': { variant: 'secondary', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'En attente' },
      'en_cours_inspection': { variant: 'default', color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'En cours' },
      'accepte': { variant: 'default', color: 'bg-green-100 text-green-800 border-green-300', label: 'Accepté' },
      'rejete': { variant: 'destructive', color: 'bg-red-100 text-red-800 border-red-300', label: 'Rejeté' },
      'bloque': { variant: 'destructive', color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Bloqué' },
    };
    const config = variants[statut] || variants['en_attente'];
    return <Badge className={`${config.color} border-2`}>{config.label}</Badge>;
  };

  const getEtatBadge = (etat: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      'normal': { color: 'bg-green-100 text-green-800 border-green-300', label: 'Normal' },
      'renforce': { color: 'bg-red-100 text-red-800 border-red-300', label: 'Renforcé' },
      'reduit': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Réduit' },
    };
    const config = variants[etat] || variants['normal'];
    return <Badge className={`${config.color} border-2`}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      )}

      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-lg">
                <History className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-white">Historique Complet</CardTitle>
                <CardDescription className="text-purple-100">
                  Réceptions et inspections des matières premières
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Rechercher par lot, produit ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-purple-200 focus:border-purple-400"
                />
              </div>
            </div>
            
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="border-2 border-purple-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="en_cours_inspection">En cours</SelectItem>
                <SelectItem value="accepte">Accepté</SelectItem>
                <SelectItem value="rejete">Rejeté</SelectItem>
                <SelectItem value="bloque">Bloqué</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterDecision} onValueChange={setFilterDecision}>
              <SelectTrigger className="border-2 border-purple-200">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Décision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tous">Toutes les décisions</SelectItem>
                <SelectItem value="ACCEPTER">Accepté</SelectItem>
                <SelectItem value="REJETER">Rejeté</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="receptions" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 bg-purple-100">
              <TabsTrigger value="receptions" className="gap-2">
                <Package className="w-4 h-4" />
                Réceptions ({lots.length})
              </TabsTrigger>
              <TabsTrigger value="inspections" className="gap-2">
                <ClipboardCheck className="w-4 h-4" />
                Inspections ({inspections.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="receptions">
              <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-purple-100">
                    <TableRow>
                      <TableHead>Numéro de Lot</TableHead>
                      <TableHead>Produit</TableHead>
                      <TableHead>Fournisseur</TableHead>
                      <TableHead>Quantité</TableHead>
                      <TableHead>Date/Heure</TableHead>
                      <TableHead>Magasinier</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>État</TableHead>
                      <TableHead>Décision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lotsFiltres.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          Aucune réception trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      lotsFiltres.map((lot) => (
                        <TableRow key={lot.id} className="hover:bg-purple-50">
                          <TableCell className="font-mono font-semibold text-purple-700">{lot.numero_lot}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{lot.produit?.nom}</span>
                              <span className="text-xs text-muted-foreground">{lot.produit?.code}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{lot.fournisseur?.nom}</span>
                              <span className="text-xs text-muted-foreground">{lot.fournisseur?.pays}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">{lot.quantite_recue}</TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span>{lot.date_reception}</span>
                              <span className="text-xs text-muted-foreground">{lot.heure_reception}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {lot.magasinier?.prenom} {lot.magasinier?.nom}
                          </TableCell>
                          <TableCell>{getStatutBadge(lot.statut_reception)}</TableCell>
                          <TableCell>{getEtatBadge(lot.etat_controle)}</TableCell>
                          <TableCell>
                            {lot.decision_finale ? (
                              <Badge variant={lot.decision_finale === 'ACCEPTER' ? 'default' : 'destructive'}>
                                {lot.decision_finale === 'ACCEPTER' ? (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                ) : (
                                  <XCircle className="w-3 h-3 mr-1" />
                                )}
                                {lot.decision_finale}
                              </Badge>
                            ) : (
                              <Badge variant="secondary">
                                <Clock className="w-3 h-3 mr-1" />
                                En attente
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="inspections">
              <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-purple-100">
                    <TableRow>
                      <TableHead>Lot</TableHead>
                      <TableHead>Date/Heure</TableHead>
                      <TableHead>Inspecteur</TableHead>
                      <TableHead>Niveau</TableHead>
                      <TableHead>AQL</TableHead>
                      <TableHead>Échantillon</TableHead>
                      <TableHead>Défauts</TableHead>
                      <TableHead>Décision</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          Aucune inspection trouvée
                        </TableCell>
                      </TableRow>
                    ) : (
                      inspections.map((inspection) => (
                        <TableRow key={inspection.id} className="hover:bg-purple-50">
                          <TableCell className="font-mono font-semibold text-purple-700">
                            {inspection.lot?.numero_lot}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span>{inspection.date_inspection}</span>
                              <span className="text-xs text-muted-foreground">{inspection.heure_inspection}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {inspection.inspecteur?.prenom} {inspection.inspecteur?.nom}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Niveau {inspection.niveau_inspection}</Badge>
                          </TableCell>
                          <TableCell>{inspection.aql}%</TableCell>
                          <TableCell className="font-medium">{inspection.taille_echantillon}</TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span className="font-semibold">Total: {inspection.nb_defauts}</span>
                              {(inspection.defauts_critique > 0 || inspection.defauts_majeur > 0 || inspection.defauts_mineur > 0) && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="text-red-600">C:{inspection.defauts_critique}</span>
                                  {' '}
                                  <span className="text-orange-600">Maj:{inspection.defauts_majeur}</span>
                                  {' '}
                                  <span className="text-yellow-600">Min:{inspection.defauts_mineur}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={inspection.decision === 'ACCEPTER' ? 'default' : 'destructive'} className="gap-1">
                              {inspection.decision === 'ACCEPTER' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              {inspection.decision}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
