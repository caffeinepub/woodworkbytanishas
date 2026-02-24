import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Loader2 } from 'lucide-react';

export default function Login() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } = useGetCallerUserProfile();
  const { mutateAsync: saveProfile, isPending: savingProfile } = useSaveCallerUserProfile();
  const navigate = useNavigate();

  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [profileName, setProfileName] = useState('');

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  // Check if profile setup is needed after authentication
  useEffect(() => {
    if (isAuthenticated && profileFetched && userProfile === null && !profileLoading) {
      setShowProfileSetup(true);
    }
  }, [isAuthenticated, profileFetched, userProfile, profileLoading]);

  // Redirect to admin panel after successful authentication and profile setup
  useEffect(() => {
    if (isAuthenticated && profileFetched && userProfile !== null) {
      navigate({ to: '/admin' });
    }
  }, [isAuthenticated, profileFetched, userProfile, navigate]);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleProfileSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;

    try {
      await saveProfile({ name: profileName.trim() });
      setShowProfileSetup(false);
      setProfileName('');
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-card rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
              {isAuthenticated ? 'Welcome Back' : 'Admin Login'}
            </h1>
            <p className="text-muted-foreground">
              {isAuthenticated
                ? 'You are currently logged in'
                : 'Sign in to access the admin panel'}
            </p>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              className="w-full py-6 text-lg font-semibold"
              size="lg"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Logging in...
                </>
              ) : isAuthenticated ? (
                'Logout'
              ) : (
                'Login with Internet Identity'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Setup Modal */}
      <Dialog open={showProfileSetup} onOpenChange={setShowProfileSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Please provide your name to complete the setup.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileName">Name *</Label>
              <Input
                id="profileName"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Enter your name"
                required
                autoFocus
              />
            </div>
            <Button type="submit" disabled={savingProfile || !profileName.trim()} className="w-full">
              {savingProfile ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Saving...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
