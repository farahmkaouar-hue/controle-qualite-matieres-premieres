import { useState } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';
import { HelpCircle, BookOpen, AlertCircle, TrendingUp } from 'lucide-react';

export function ISOHelper() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="w-4 h-4" />
          Assistant ISO
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Assistant Qualité ISO 2859-1
          </DialogTitle>
          <DialogDescription>
            Aide et explications sur les contrôles qualité par échantillonnage
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="norme" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="norme">La Norme</TabsTrigger>
            <TabsTrigger value="niveaux">Niveaux</TabsTrigger>
            <TabsTrigger value="etats">États</TabsTrigger>
            <TabsTrigger value="aql">AQL</TabsTrigger>
          </TabsList>

          <TabsContent value="norme" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold">Qu'est-ce que l'ISO 2859-1 ?</h3>
                <p className="text-sm text-muted-foreground">
                  La norme ISO 2859-1 définit les procédures d'échantillonnage pour les contrôles 
                  par attributs. Elle permet de décider d'accepter ou de rejeter un lot en inspectant 
                  seulement un échantillon.
                </p>

                <h4 className="font-semibold mt-4">Comment ça fonctionne ?</h4>
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Définir la taille du lot à contrôler</li>
                  <li>Choisir le niveau d'inspection (I, II ou III)</li>
                  <li>Sélectionner l'AQL (seuil de qualité acceptable)</li>
                  <li>Le système calcule la taille d'échantillon nécessaire</li>
                  <li>Inspecter l'échantillon et compter les défauts</li>
                  <li>Comparer avec les critères Ac (acceptation) et Re (rejet)</li>
                </ol>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-sm">
                    <strong>📊 Décision :</strong><br />
                    • Si défauts ≤ Ac → <strong className="text-green-600">ACCEPTER</strong><br />
                    • Si défauts ≥ Re → <strong className="text-red-600">REJETER</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="niveaux" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    Niveau I - Réduit
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Échantillon plus petit. Utilisé quand le fournisseur a un excellent historique 
                    (10 lots acceptés consécutifs). Nécessite validation du responsable.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-sm">
                    ✅ Moins d'inspection, plus d'efficacité
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    Niveau II - Normal (Recommandé)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Niveau standard pour la plupart des situations. Équilibre entre rigueur 
                    et efficacité. C'est le niveau par défaut.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-sm">
                    ⚖️ Équilibre optimal
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    Niveau III - Renforcé
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Échantillon plus grand. Appliqué automatiquement quand il y a des problèmes 
                    de qualité (2 rejets consécutifs ou 2 rejets sur 5 lots).
                  </p>
                  <div className="bg-red-50 border border-red-200 rounded p-2 text-sm">
                    ⚠️ Contrôle accru, surveillance renforcée
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="etats" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold">État Normal</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      État par défaut. Le fournisseur livre une qualité acceptable.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Passage en Renforcé si :</strong><br />
                      • 2 rejets consécutifs OU<br />
                      • 2 rejets sur 5 derniers lots
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Passage en Réduit si :</strong><br />
                      • 10 lots acceptés consécutifs (validation responsable)
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 mt-1.5"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold">État Renforcé</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Surveillance accrue. Le fournisseur a des problèmes de qualité.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Retour en Normal si :</strong><br />
                      • 5 lots acceptés consécutifs
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Alerte urgente si :</strong><br />
                      • Pas d'amélioration après 5 lots en renforcé
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5"></div>
                  <div className="flex-1">
                    <h4 className="font-semibold">État Réduit</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Contrôle allégé. Le fournisseur a prouvé sa fiabilité.
                    </p>
                    <p className="text-sm mt-2">
                      <strong>Retour en Normal si :</strong><br />
                      • 1 seul rejet
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aql" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold">Qu'est-ce que l'AQL ?</h3>
                <p className="text-sm text-muted-foreground">
                  L'AQL (Acceptable Quality Limit) est le taux de défauts maximum tolérable 
                  dans un lot pour qu'il soit encore considéré comme acceptable.
                </p>

                <h4 className="font-semibold mt-4">Valeurs AQL courantes :</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-green-50 border border-green-200 rounded p-2">
                    <strong>0.065% - 0.15%</strong><br />
                    <span className="text-muted-foreground">Très exigeant (médical, aéro)</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded p-2">
                    <strong>0.25% - 0.65%</strong><br />
                    <span className="text-muted-foreground">Exigeant (automobile)</span>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <strong>1.0% - 1.5%</strong><br />
                    <span className="text-muted-foreground">Standard (industrie)</span>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded p-2">
                    <strong>2.5% - 4.0%</strong><br />
                    <span className="text-muted-foreground">Tolérant (non critique)</span>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                  <p className="text-sm">
                    <strong>💡 Conseil :</strong> Commencez avec AQL 1.0% (standard industriel) 
                    et ajustez selon vos besoins et l'historique du fournisseur.
                  </p>
                </div>

                <h4 className="font-semibold mt-4">Exemple concret :</h4>
                <p className="text-sm text-muted-foreground">
                  AQL 1.0% signifie que dans 100 unités, on accepte jusqu'à 1 défaut. 
                  Si vous avez un lot de 500 unités avec AQL 1.0% niveau II, vous devrez 
                  inspecter un échantillon de 50 unités. Si vous trouvez 2 défauts ou moins → 
                  <strong className="text-green-600"> ACCEPTER</strong>. 
                  Si 3 défauts ou plus → <strong className="text-red-600"> REJETER</strong>.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-4">
          <Button onClick={() => setOpen(false)}>Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
