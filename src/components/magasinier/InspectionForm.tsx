import { useState, useEffect } from 'react';
import { callServer } from '../../utils/supabase/client';
import { calculerEchantillonISO, determinerDecision, AQL_COMMUNS } from '../../utils/iso2859-data';
import { ISOHelper } from '../shared/ISOHelper';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { ClipboardCheck, Loader2, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import type { Lot, Inspection, Alerte, NiveauInspection } from '../../types';

export function InspectionForm() {
  const [lots, setLots] = useState<Lot[]>([]);
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculEnCours, setCalculEnCours] = useState(false);
  const [resultatCalcul, setResultatCalcul] = useState<any>(null);
  const [inspectionTerminee, setInspectionTerminee] = useState(false);
  const [alerteCreee, setAlerteCreee] = useState<Alerte | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    taille_lot: '',
    niveau_inspection: 'II' as NiveauInspection,
    aql: '1.0',
    nb_defauts: '',
    defauts_critique: '',
    defauts_majeur: '',
    defauts_mineur: '',
    type_defaut: '',
    commentaire: '',
  });

  useEffect(() => {
    loadLots();
  }, []);

  const loadLots = async () => {
    const { data } = await callServer<Lot[]>('/lots');
    if (data) {
      // Ne garder que les lots sans décision finale
      setLots(data.filter(l => !l.decision_finale));
    }
  };

  const handleCalculer = () => {
    setCalculEnCours(true);
    setError('');

    try {
      const tailleLot = parseInt(formData.taille_lot);
      const aql = parseFloat(formData.aql);

      const resultat = calculerEchantillonISO(
        tailleLot,
        formData.niveau_inspection,
        aql
      );

      if (!resultat) {
        setError('Impossible de calculer l\'échantillon avec ces paramètres');
        setCalculEnCours(false);
        return;
      }

      setResultatCalcul(resultat);
      setCalculEnCours(false);
    } catch (err) {
      setError('Erreur lors du calcul');
      setCalculEnCours(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLot || !resultatCalcul) return;

    setError('');
    setLoading(true);

    try {
      const { data, error } = await callServer<{ inspection: Inspection; alerte: Alerte | null }>('/inspections', {
        method: 'POST',
        body: JSON.stringify({
          lot_id: selectedLot.id,
          taille_lot: parseInt(formData.taille_lot),
          niveau_inspection: formData.niveau_inspection,
          aql: parseFloat(formData.aql),
          nb_defauts: parseInt(formData.nb_defauts),
          defauts_critique: parseInt(formData.defauts_critique) || 0,
          defauts_majeur: parseInt(formData.defauts_majeur) || 0,
          defauts_mineur: parseInt(formData.defauts_mineur) || 0,
          type_defaut: formData.type_defaut,
          commentaire: formData.commentaire,
        }),
      });

      if (error || !data) {
        setError('Erreur lors de l\'enregistrement de l\'inspection');
        setLoading(false);
        return;
      }

      setInspectionTerminee(true);
      setAlerteCreee(data.alerte);

      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setInspectionTerminee(false);
        setAlerteCreee(null);
        setSelectedLot(null);
        setResultatCalcul(null);
        setFormData({
          taille_lot: '',
          niveau_inspection: 'II',
          aql: '1.0',
          nb_defauts: '',
          defauts_critique: '',
          defauts_majeur: '',
          defauts_mineur: '',
          type_defaut: '',
          commentaire: '',
        });
        loadLots();
      }, 3000);
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  const decision = resultatCalcul && formData.nb_defauts 
    ? determinerDecision(
        parseInt(formData.nb_defauts),
        resultatCalcul.nbAcceptation,
        resultatCalcul.nbRejet
      )
    : null;

  return (
    <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
      <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-white">Inspection ISO 2859-1</CardTitle>
              <CardDescription className="text-green-100">Contrôle qualité par échantillonnage</CardDescription>
            </div>
          </div>
          <ISOHelper />
        </div>
      </CardHeader>
      <CardContent>
        {inspectionTerminee ? (
          <div className="space-y-4 text-center py-8">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
              decision === 'ACCEPTER' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {decision === 'ACCEPTER' ? (
                <CheckCircle className="w-8 h-8 text-green-600" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600" />
              )}
            </div>
            <div>
              <h3 className="text-xl mb-2">Inspection terminée</h3>
              <p className="text-muted-foreground">
                Lot {selectedLot?.numero_lot} : <strong>{decision}</strong>
              </p>
            </div>
            {alerteCreee && (
              <Alert className={alerteCreee.severite === 'critical' ? 'border-red-500' : 'border-yellow-500'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{alerteCreee.titre}</strong><br />
                  {alerteCreee.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Sélection du lot */}
            <div className="space-y-2">
              <Label htmlFor="lot" className="text-base font-semibold text-gray-700">Sélectionner un lot à inspecter *</Label>
              <Select
                value={selectedLot?.id || ''}
                onValueChange={(value) => {
                  const lot = lots.find(l => l.id === value);
                  setSelectedLot(lot || null);
                  if (lot && lot.quantite_recue) {
                    setFormData({ ...formData, taille_lot: lot.quantite_recue.toString() });
                  }
                }}
                disabled={loading}
              >
                <SelectTrigger id="lot" className="h-12 border-2 border-green-200 focus:border-green-400">
                  <SelectValue placeholder="Choisir un lot" />
                </SelectTrigger>
                <SelectContent>
                  {lots.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Aucun lot en attente d'inspection
                    </div>
                  ) : (
                    lots.map((lot) => (
                      <SelectItem key={lot.id} value={lot.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-semibold">{lot.numero_lot}</span>
                          <span>-</span>
                          <span>{lot.produit?.nom}</span>
                          <span className="text-muted-foreground">({lot.quantite_recue} unités)</span>
                          <Badge className="ml-2" variant={lot.etat_controle === 'normal' ? 'secondary' : lot.etat_controle === 'renforce' ? 'destructive' : 'default'}>
                            {lot.etat_controle}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {selectedLot && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Fournisseur:</strong> {selectedLot.fournisseur?.nom} | 
                    <strong className="ml-2">État contrôle:</strong> <span className="capitalize">{selectedLot.etat_controle}</span>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Paramètres ISO 2859-1 */}
            {selectedLot && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="taille_lot">Taille du lot</Label>
                    <Input
                      id="taille_lot"
                      type="number"
                      value={formData.taille_lot}
                      onChange={(e) => setFormData({ ...formData, taille_lot: e.target.value })}
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="niveau">Niveau d'inspection</Label>
                    <Select
                      value={formData.niveau_inspection}
                      onValueChange={(value: NiveauInspection) => setFormData({ ...formData, niveau_inspection: value })}
                      disabled={loading}
                    >
                      <SelectTrigger id="niveau">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="I">Niveau I (Réduit)</SelectItem>
                        <SelectItem value="II">Niveau II (Normal)</SelectItem>
                        <SelectItem value="III">Niveau III (Renforcé)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aql">AQL (%)</Label>
                    <Select
                      value={formData.aql}
                      onValueChange={(value) => setFormData({ ...formData, aql: value })}
                      disabled={loading}
                    >
                      <SelectTrigger id="aql">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AQL_COMMUNS.map((aql) => (
                          <SelectItem key={aql} value={aql.toString()}>
                            {aql}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="button" onClick={handleCalculer} variant="secondary" className="w-full">
                  Calculer la taille d'échantillon
                </Button>

                {/* Résultat du calcul */}
                {resultatCalcul && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <strong>Taille échantillon:</strong><br />
                          <span className="text-lg">{resultatCalcul.tailleEchantillon} unités</span>
                        </div>
                        <div>
                          <strong>Nombre d'acceptation (Ac):</strong><br />
                          <span className="text-lg">{resultatCalcul.nbAcceptation}</span>
                        </div>
                        <div>
                          <strong>Nombre de rejet (Re):</strong><br />
                          <span className="text-lg">{resultatCalcul.nbRejet}</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Résultats de l'inspection */}
                {resultatCalcul && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nb_defauts">Nombre total de défauts trouvés *</Label>
                        <Input
                          id="nb_defauts"
                          type="number"
                          placeholder="0"
                          value={formData.nb_defauts}
                          onChange={(e) => {
                            const total = parseInt(e.target.value) || 0;
                            setFormData({ ...formData, nb_defauts: e.target.value });
                          }}
                          required
                          disabled={loading}
                          className="border-2 border-blue-200"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="type_defaut">Type de défaut (optionnel)</Label>
                        <Input
                          id="type_defaut"
                          placeholder="Ex: Rayure, fissure..."
                          value={formData.type_defaut}
                          onChange={(e) => setFormData({ ...formData, type_defaut: e.target.value })}
                          disabled={loading}
                          className="border-2 border-blue-200"
                        />
                      </div>
                    </div>

                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-3">Classification des défauts (optionnel)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="defauts_critique" className="text-red-700 font-semibold">Défauts Critiques</Label>
                          <Input
                            id="defauts_critique"
                            type="number"
                            placeholder="0"
                            value={formData.defauts_critique}
                            onChange={(e) => setFormData({ ...formData, defauts_critique: e.target.value })}
                            disabled={loading}
                            className="border-2 border-red-300 bg-red-50"
                          />
                          <p className="text-xs text-muted-foreground">Risque sécurité/réglementaire</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="defauts_majeur" className="text-orange-700 font-semibold">Défauts Majeurs</Label>
                          <Input
                            id="defauts_majeur"
                            type="number"
                            placeholder="0"
                            value={formData.defauts_majeur}
                            onChange={(e) => setFormData({ ...formData, defauts_majeur: e.target.value })}
                            disabled={loading}
                            className="border-2 border-orange-300 bg-orange-50"
                          />
                          <p className="text-xs text-muted-foreground">Impact fonctionnel important</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="defauts_mineur" className="text-yellow-700 font-semibold">Défauts Mineurs</Label>
                          <Input
                            id="defauts_mineur"
                            type="number"
                            placeholder="0"
                            value={formData.defauts_mineur}
                            onChange={(e) => setFormData({ ...formData, defauts_mineur: e.target.value })}
                            disabled={loading}
                            className="border-2 border-yellow-300 bg-yellow-50"
                          />
                          <p className="text-xs text-muted-foreground">Impact esthétique/mineur</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="commentaire">Commentaires</Label>
                      <Textarea
                        id="commentaire"
                        placeholder="Observations complémentaires..."
                        value={formData.commentaire}
                        onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                        disabled={loading}
                        rows={3}
                      />
                    </div>

                    {/* Décision prévisionnelle */}
                    {decision && (
                      <Alert className={decision === 'ACCEPTER' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                        {decision === 'ACCEPTER' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <AlertDescription>
                          <strong>Décision prévisionnelle : {decision}</strong>
                          <br />
                          {decision === 'ACCEPTER' 
                            ? `${formData.nb_defauts} défaut(s) ≤ ${resultatCalcul.nbAcceptation} (Ac)`
                            : `${formData.nb_defauts} défaut(s) ≥ ${resultatCalcul.nbRejet} (Re)`
                          }
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setSelectedLot(null);
                          setResultatCalcul(null);
                          setFormData({
                            taille_lot: '',
                            niveau_inspection: 'II',
                            aql: '1.0',
                            nb_defauts: '',
                            defauts_critique: '',
                            defauts_majeur: '',
                            defauts_mineur: '',
                            type_defaut: '',
                            commentaire: '',
                          });
                        }}
                        disabled={loading}
                      >
                        Annuler
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={loading || !formData.nb_defauts}
                        className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Valider l'inspection
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </form>
        )}
      </CardContent>
    </Card>
  );
}
