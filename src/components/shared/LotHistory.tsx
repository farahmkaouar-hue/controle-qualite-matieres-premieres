import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, User, FileText, TrendingUp, TrendingDown } from 'lucide-react';
import type { Lot, Inspection } from '../../types';

interface LotHistoryProps {
  lot: Lot;
  inspection?: Inspection;
}

export function LotHistory({ lot, inspection }: LotHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Détails du Lot {lot.numero_lot}
        </CardTitle>
        <CardDescription>Traçabilité et historique complet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Produit</h4>
            <p>{lot.produit?.nom || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{lot.produit?.code}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Fournisseur</h4>
            <p>{lot.fournisseur?.nom || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{lot.fournisseur?.code}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Quantité</h4>
            <p>{lot.quantite} unités</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Date de réception</h4>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <p>{new Date(lot.date_reception).toLocaleString('fr-FR')}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Magasinier</h4>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <p>{lot.magasinier?.prenom} {lot.magasinier?.nom}</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">État de contrôle</h4>
            <Badge variant={
              lot.etat_controle === 'normal' ? 'secondary' :
              lot.etat_controle === 'renforce' ? 'destructive' :
              'default'
            }>
              {lot.etat_controle}
            </Badge>
          </div>
        </div>

        {/* Résultat de l'inspection */}
        {inspection && (
          <>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Résultat de l'inspection
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Niveau inspection</p>
                  <p className="font-medium">Niveau {inspection.niveau_inspection}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">AQL</p>
                  <p className="font-medium">{inspection.aql}%</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Taille échantillon</p>
                  <p className="font-medium">{inspection.taille_echantillon} unités</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Défauts trouvés</p>
                  <p className="font-medium">{inspection.nb_defauts}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Date inspection</p>
                  <p className="font-medium">{new Date(inspection.date_inspection).toLocaleDateString('fr-FR')}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Décision</p>
                  <Badge variant={inspection.decision === 'ACCEPTER' ? 'default' : 'destructive'}>
                    {inspection.decision}
                  </Badge>
                </div>
              </div>

              {inspection.type_defaut && (
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-muted-foreground">Type de défaut</p>
                  <p>{inspection.type_defaut}</p>
                </div>
              )}

              {inspection.commentaire && (
                <div className="mt-4 space-y-1">
                  <p className="text-sm text-muted-foreground">Commentaires</p>
                  <p className="text-sm">{inspection.commentaire}</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Décision finale */}
        {lot.decision_finale && (
          <div className="border-t pt-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {lot.decision_finale === 'ACCEPTER' ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-500" />
                )}
                <div>
                  <p className="font-semibold">Décision finale</p>
                  <p className="text-sm text-muted-foreground">
                    Lot {lot.decision_finale === 'ACCEPTER' ? 'accepté' : 'rejeté'}
                  </p>
                </div>
              </div>
              <Badge
                variant={lot.decision_finale === 'ACCEPTER' ? 'default' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {lot.decision_finale}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
