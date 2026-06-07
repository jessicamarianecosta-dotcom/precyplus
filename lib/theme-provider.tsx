'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createClient } from '@/lib/supabase/client';

const THEME_STORAGE_KEY = 'precy_theme';

const DEFAULT_THEME = {
  primary: '#FF4FA3',
  secondary: '#1A1F5E',
  logo: '',
};

type ThemeState = {
  primary: string;
  secondary: string;
  logo: string;
};

const ThemeContext = createContext<ThemeState>(DEFAULT_THEME);

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function adjustColor(hex: string, amount: number) {
  let color = hex.replace('#', '');
  if (color.length === 3) {
    color = color.split('').map((char) => char + char).join('');
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) + amount;
  let g = ((num >> 8) & 0x00ff) + amount;
  let b = (num & 0x0000ff) + amount;
  r = clamp(r, 0, 255);
  g = clamp(g, 0, 255);
  b = clamp(b, 0, 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function applyTheme(theme: ThemeState) {
  const root = document.documentElement;
  const primary = theme.primary || DEFAULT_THEME.primary;
  const secondary = theme.secondary || DEFAULT_THEME.secondary;

  root.style.setProperty('--primary-color', primary);
  root.style.setProperty('--secondary-color', secondary);
  root.style.setProperty('--primary-hover', adjustColor(primary, 22));
  root.style.setProperty('--primary-light', adjustColor(primary, 60));
  root.style.setProperty('--primary-soft', adjustColor(primary, 110));
  root.style.setProperty('--secondary-hover', adjustColor(secondary, 18));
  root.style.setProperty('--secondary-soft', adjustColor(secondary, 70));
}

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [theme, setTheme] = useState<ThemeState>(DEFAULT_THEME);

  useEffect(() => {
    let initialTheme = DEFAULT_THEME;

    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        try {
          initialTheme = JSON.parse(stored) as ThemeState;
        } catch {
          initialTheme = DEFAULT_THEME;
        }
      }

      setTheme(initialTheme);
      applyTheme(initialTheme);
    }

    async function loadTheme() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('companies')
        .select('logo_url')
        .eq('user_id', userData.user.id)
        .single();

      if (error || !data) return;

      const loadedTheme = {
        ...initialTheme,
        logo: data.logo_url || initialTheme.logo,
      };

      setTheme(loadedTheme);
      applyTheme(loadedTheme);

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(loadedTheme));
      }
    }

    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
