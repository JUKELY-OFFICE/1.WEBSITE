'use client';

export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { supabase } from '@/api/supabaseClient';

const NUIT     = '#0F2748';
const ARDOISE  = '#1E4976';
const CRAIE    = '#FDFBF5';
const MOUTARDE = '#F4C542';
const BRUME    = '#94A5BC';
const BRIQUE   = '#E56A4E';

function WebFrontLoginInner() {
  const router      = useRouter();
  const params      = useParams();
  const locale      = params.locale || 'fr';
  const searchParams = useSearchParams();
  const [isForgot, setIsForgot]       = useState(false);
  const [isReset, setIsReset]         = useState(false);
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type      = searchParams.get('type');
    if (tokenHash && type === 'recovery') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }).then(({ error }) => {
        if (!error) setIsReset(true);
        else setError('Lien invalide ou expiré.');
      });
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsReset(true);
    });
    return () => subscription.unsubscribe();
  }, [searchParams]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) { setError('Email ou mot de passe incorrect'); setLoading(false); return; }
    const { data: wfUser, error: wfError } = await supabase
      .from('wf_users').select('id').eq('user_id', data.user.id).single();
    if (wfError || !wfUser) {
      setError('Accès non autorisé. Aucun restaurant associé à ce compte.');
      setLoading(false); return;
    }
    router.push(`/${locale}/WebFrontDashboard`);
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/${locale}/WebFrontLogin`,
    });
    setLoading(false);
    if (authError) setError(authError.message);
    else setSuccess('Un email de réinitialisation vous a été envoyé.');
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (updateError) setError(updateError.message);
    else router.push(`/${locale}/WebFrontDashboard`);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid rgba(148,165,188,0.3)`,
    borderRadius: '8px',
    color: CRAIE,
    fontFamily: 'var(--font-display)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-display)',
    fontSize: '0.78rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: BRUME,
    marginBottom: '0.5rem',
  };

  const btnPrimary = {
    width: '100%',
    padding: '0.85rem',
    background: MOUTARDE,
    color: NUIT,
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'var(--font-display)',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.7 : 1,
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: '0.02em',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: NUIT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          fontWeight: 800,
          color: CRAIE,
          letterSpacing: '-0.03em',
        }}>
          Jukely
        </span>
        <span style={{
          display: 'block',
          fontFamily: 'var(--font-display)',
          fontSize: '0.72rem',
          fontWeight: 500,
          color: BRUME,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: '0.2rem',
        }}>
          {isReset ? 'Nouveau mot de passe' : isForgot ? 'Réinitialisation' : 'Espace restaurateur'}
        </span>
      </div>

      {/* Card */}
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(148,165,188,0.15)',
        borderRadius: '16px',
        padding: '2.5rem',
        backdropFilter: 'blur(8px)',
      }}>

        {/* Trait décoratif moutarde */}
        <div style={{
          width: '2.5rem',
          height: '3px',
          background: MOUTARDE,
          borderRadius: '2px',
          marginBottom: '2rem',
        }} />

        {isReset ? (
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Nouveau mot de passe</label>
              <input style={inputStyle} type="password" value={newPassword}
                onChange={e => setNewPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            {error && <p style={{ color: BRIQUE, fontSize: '0.85rem', fontFamily: 'var(--font-sans)' }}>{error}</p>}
            <button type="submit" style={btnPrimary} disabled={loading}>
              {loading ? 'Mise à jour…' : 'Changer le mot de passe'}
            </button>
          </form>

        ) : isForgot ? (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            {error   && <p style={{ color: BRIQUE,   fontSize: '0.85rem' }}>{error}</p>}
            {success && <p style={{ color: MOUTARDE, fontSize: '0.85rem' }}>{success}</p>}
            <button type="submit" style={btnPrimary} disabled={loading}>
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
            <button type="button" onClick={() => { setIsForgot(false); setError(''); setSuccess(''); }}
              style={{ background: 'none', border: 'none', color: BRUME, fontSize: '0.85rem',
                fontFamily: 'var(--font-display)', cursor: 'pointer', textAlign: 'center' }}>
              ← Retour à la connexion
            </button>
          </form>

        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="votre@email.com" required />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Mot de passe</label>
                <button type="button" onClick={() => { setIsForgot(true); setError(''); }}
                  style={{ background: 'none', border: 'none', color: BRUME, fontSize: '0.75rem',
                    fontFamily: 'var(--font-display)', cursor: 'pointer', letterSpacing: '0.02em' }}>
                  Mot de passe oublié ?
                </button>
              </div>
              <input style={inputStyle} type="password" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            {error && <p style={{ color: BRIQUE, fontSize: '0.85rem', fontFamily: 'var(--font-sans)' }}>{error}</p>}
            <button type="submit" style={btnPrimary} disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function WebFrontLogin() {
  return (
    <Suspense>
      <WebFrontLoginInner />
    </Suspense>
  );
}
