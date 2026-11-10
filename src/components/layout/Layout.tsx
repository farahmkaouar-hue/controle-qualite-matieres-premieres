import { ReactNode, useState, useEffect } from 'react';
import { createClient, callServer } from '../../utils/supabase/client';
import { Button } from '../ui/button';
import { Bell, LogOut, User, Package, ClipboardCheck, BarChart3, Settings, History } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { User as UserType, Alerte } from '../../types';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  user: UserType | null;
}

export function Layout({ children, currentPage, onPageChange, onLogout, user }: LayoutProps) {
  const [alertes, setAlertes] = useState<Alerte[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadAlertes();
    // Recharger les alertes toutes les 30 secondes
    const interval = setInterval(loadAlertes, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlertes = async () => {
    const { data } = await callServer<Alerte[]>('/alertes');
    if (data) {
      setAlertes(data.filter(a => a.statut !== 'resolue'));
    }
  };

  const getMenuItems = () => {
    if (!user) return [];

    if (user.role === 'magasinier') {
      return [
        { id: 'reception', label: 'Réception', icon: Package },
        { id: 'inspection', label: 'Inspection', icon: ClipboardCheck },
        { id: 'historique', label: 'Historique', icon: History },
      ];
    }

    if (user.role === 'responsable' || user.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
        { id: 'alertes', label: 'Alertes', icon: Bell },
        { id: 'historique', label: 'Historique', icon: History },
        { id: 'reception', label: 'Réception', icon: Package },
        { id: 'inspection', label: 'Inspection', icon: ClipboardCheck },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();
  const initiales = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg">Gestion Matières Premières</h1>
                <p className="text-xs text-muted-foreground">ISO 2859-1</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentPage === item.id ? 'secondary' : 'ghost'}
                    onClick={() => onPageChange(item.id)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {alertes.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                      {alertes.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications ({alertes.length})</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {alertes.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Aucune notification
                  </div>
                ) : (
                  alertes.slice(0, 5).map((alerte) => (
                    <DropdownMenuItem key={alerte.id} className="flex flex-col items-start p-3">
                      <div className="flex items-center gap-2 w-full mb-1">
                        <Badge variant={alerte.severite === 'critical' ? 'destructive' : alerte.severite === 'warning' ? 'default' : 'secondary'}>
                          {alerte.severite === 'critical' ? 'Critique' : alerte.severite === 'warning' ? 'Attention' : 'Info'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alerte.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-sm">{alerte.titre}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alerte.message}</p>
                    </DropdownMenuItem>
                  ))
                )}
                {alertes.length > 5 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onPageChange('alertes')} className="justify-center">
                      Voir toutes les alertes
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback>{initiales}</AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
