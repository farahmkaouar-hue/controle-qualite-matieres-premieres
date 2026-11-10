import { useState, useEffect } from 'react';
import { callServer } from '../../utils/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Package, Loader2, CheckCircle, ArrowLeft, Sparkles } from 'lucide-react';
import type { Produit, Fournisseur, Lot } from '../../types';

interface ReceptionFormProps {
  onReceptionSuccess: (lot: Lot) => void;
  onBack?: () => void;
}

export function ReceptionForm({ onReceptionSuccess, onBack }: ReceptionFormProps) {
  const [produits, setProduits] = useState<Produit[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    numero_lot: '',
    produit_id: '',
    fournisseur_id: '',
    quantite_recue: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [produitsRes, fournisseursRes] = await Promise.all([
      callServer<Produit[]>('/produits'),
      callServer<Fournisseur[]>('/fournisseurs'),
    ]);

    if (produitsRes.data) setProduits(produitsRes.data);
    if (fournisseursRes.data) setFournisseurs(fournisseursRes.data);
  };

  const genererNumeroLot = async () => {
    if (!formData.produit_id || !formData.fournisseur_id) {
      setError('Veuillez sélectionner un produit et un fournisseur d\'abord');
      return;
    }

    const { data } = await callServer<{ numero_lot: string }>('/lots/generer-numero', {
      method: 'POST',
      body: JSON.stringify({
        produit_id: formData.produit_id,
        fournisseur_id: formData.fournisseur_id,
      }),
    });

    if (data) {
      setFormData({ ...formData, numero_lot: data.numero_lot });
    }
  };

  useEffect(() => {
    if (formData.produit_id && formData.fournisseur_id) {
      genererNumeroLot();
    }
  }, [formData.produit_id, formData.fournisseur_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const { data, error } = await callServer<Lot>('/lots', {
        method: 'POST',
        body: JSON.stringify({
          ...formData,
          quantite_recue: parseInt(formData.quantite_recue),
        }),
      });

      if (error || !data) {
        setError('Erreur lors de l\'enregistrement de la réception');
        setLoading(false);
        return;
      }

      setSuccess(true);
      setFormData({
        numero_lot: '',
        produit_id: '',
        fournisseur_id: '',
        quantite_recue: '',
      });

      setTimeout(() => {
        setSuccess(false);
        onReceptionSuccess(data);
      }, 1500);
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {onBack && (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Button>
      )}

      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-white">Nouvelle Réception</CardTitle>
              <CardDescription className="text-blue-100">
                Enregistrer l'arrivée d'une matière première
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-50 text-green-900 border-green-300 border-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-900 font-medium">
                  ✅ Réception enregistrée avec succès !
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="produit" className="text-base font-semibold text-gray-700">
                  Produit / Matière Première *
                </Label>
                <Select
                  value={formData.produit_id}
                  onValueChange={(value) => setFormData({ ...formData, produit_id: value })}
                  disabled={loading}
                >
                  <SelectTrigger id="produit" className="h-12 border-2 border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    {produits.map((produit) => (
                      <SelectItem key={produit.id} value={produit.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{produit.nom}</span>
                          <span className="text-xs text-muted-foreground">
                            {produit.code} • {produit.categorie}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fournisseur" className="text-base font-semibold text-gray-700">
                  Fournisseur *
                </Label>
                <Select
                  value={formData.fournisseur_id}
                  onValueChange={(value) => setFormData({ ...formData, fournisseur_id: value })}
                  disabled={loading}
                >
                  <SelectTrigger id="fournisseur" className="h-12 border-2 border-blue-200 focus:border-blue-400">
                    <SelectValue placeholder="Sélectionner un fournisseur" />
                  </SelectTrigger>
                  <SelectContent>
                    {fournisseurs.map((fournisseur) => (
                      <SelectItem key={fournisseur.id} value={fournisseur.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{fournisseur.nom}</span>
                          <span className="text-xs text-muted-foreground">
                            {fournisseur.code} • {fournisseur.pays}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="numero_lot" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                  Numéro de Lot
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </Label>
                <Input
                  id="numero_lot"
                  value={formData.numero_lot}
                  readOnly
                  className="h-12 border-2 border-green-200 bg-green-50 font-mono font-semibold text-green-700"
                  placeholder="Auto-généré..."
                />
                <p className="text-xs text-muted-foreground">
                  Généré automatiquement après sélection du produit et fournisseur
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantite" className="text-base font-semibold text-gray-700">
                  Quantité Reçue *
                </Label>
                <Input
                  id="quantite"
                  type="number"
                  placeholder="Ex: 1000"
                  value={formData.quantite_recue}
                  onChange={(e) => setFormData({ ...formData, quantite_recue: e.target.value })}
                  required
                  disabled={loading}
                  className="h-12 border-2 border-blue-200 focus:border-blue-400"
                />
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-blue-800">
                <Package className="w-4 h-4" />
                <span className="font-medium">Informations automatiques :</span>
              </div>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Date et heure de réception enregistrées automatiquement</li>
                <li>• Statut initial : En attente d'inspection</li>
                <li>• État de contrôle : Normal</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              {onBack && (
                <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
                  Annuler
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={loading || !formData.numero_lot}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Enregistrer la Réception
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
