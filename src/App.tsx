import { useState, useEffect } from 'react';
import { createClient, callServer } from './utils/supabase/client';
import { LoginPage } from './components/auth/LoginPage';
import { Layout } from './components/layout/Layout';
import { WelcomePage } from './components/shared/WelcomePage';
import { HistoriquePage } from './components/shared/HistoriquePage';
import { ReceptionForm } from './components/magasinier/ReceptionForm';
import { InspectionForm } from './components/magasinier/InspectionForm';
import { DashboardEnhanced } from './components/responsable/DashboardEnhanced';
import { AlertesPanel } from './components/responsable/AlertesPanel';
import { Loader2 } from 'lucide-react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import type { User } from './types';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<string>('welcome');
  const [initializing, setInitializing] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Récupérer le profil utilisateur
        const { data: profile } = await callServer<User>('/auth/profile');
        if (profile) {
          setUser(profile);
          // Commencer par la page de bienvenue
          setCurrentPage('welcome');
        }
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async () => {
    await checkAuth();
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setCurrentPage('');
  };

  const handleInitializeData = async () => {
    setInitializing(true);
    const { data } = await callServer('/seed', { method: 'POST' });
    if (data) {
      alert('Données de test créées ! Vous pouvez maintenant vous connecter avec les comptes fournis.');
    }
    setInitializing(false);
  };

  // Écran de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  // Page de connexion
  if (!user) {
    return (
      <>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
        {/* Bouton d'initialisation des données (visible uniquement si pas encore initialisé) */}
        <div className="fixed bottom-4 right-4">
          <Card className="w-80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Première utilisation ?</CardTitle>
              <CardDescription className="text-xs">
                Cliquez pour initialiser les données de test
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleInitializeData} 
                disabled={initializing}
                size="sm"
                className="w-full"
              >
                {initializing ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Initialisation...
                  </>
                ) : (
                  'Initialiser les données'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Application principale
  const handleGetStarted = () => {
    if (user?.role === 'magasinier') {
      setCurrentPage('reception');
    } else {
      setCurrentPage('dashboard');
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
      user={user}
    >
      {currentPage === 'welcome' && <WelcomePage user={user} onGetStarted={handleGetStarted} />}
      {currentPage === 'reception' && <ReceptionForm onReceptionSuccess={() => setCurrentPage('inspection')} onBack={() => setCurrentPage('welcome')} />}
      {currentPage === 'inspection' && <InspectionForm />}
      {currentPage === 'dashboard' && <DashboardEnhanced />}
      {currentPage === 'alertes' && <AlertesPanel />}
      {currentPage === 'historique' && <HistoriquePage onBack={() => setCurrentPage(user?.role === 'magasinier' ? 'welcome' : 'dashboard')} />}
      
      {currentPage === '' && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Sélectionnez une page dans le menu</p>
        </div>
      )}
    </Layout>
  );
}
