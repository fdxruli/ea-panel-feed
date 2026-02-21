// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type Props = {
  children: React.ReactNode;
};

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export function ProtectedRoute({ children }: Props) {
  const [authState, setAuthState] = useState<AuthState>('loading');

  useEffect(() => {
    // 1. Verificación inicial — getSession() es síncrona desde la caché local
    //    de Supabase, así que resuelve casi instantáneamente sin round-trip.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(session ? 'authenticated' : 'unauthenticated');
    });

    // 2. Suscripción reactiva — si el token expira o el usuario cierra sesión
    //    desde otra pestaña, redirige sin necesidad de recargar.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setAuthState(session ? 'authenticated' : 'unauthenticated');
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Mientras se verifica: pantalla en blanco (no el dashboard, no el login)
  // Puedes reemplazar null por un spinner si prefieres feedback visual
  if (authState === 'loading') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        color: 'var(--text-muted)',
        fontFamily: "'DM Mono', monospace",
        fontSize: '0.8rem',
        letterSpacing: '0.1em',
      }}>
        Verificando credenciales…
      </div>
    );
  }

  // Sin sesión: redirige al login. `replace` evita que /admin quede en el historial.
  if (authState === 'unauthenticated') {
    return <Navigate to="/admin/login" replace />;
  }

  // Con sesión válida: renderiza el hijo (AdminDashboard)
  return <>{children}</>;
}