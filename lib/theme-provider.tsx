'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import { createClient }
from '@/lib/supabase/client';

const ThemeContext =
  createContext<any>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {

  const supabase =
    createClient();

  const [theme, setTheme] =
    useState({
      primary:
        '#FF4FA3',

      secondary:
        '#1A1F5E',

      logo: '',
    });

  useEffect(() => {

    async function loadTheme() {

      const {
        data: userData,
      } = await supabase.auth.getUser();

      if (
        !userData.user
      ) return;

      const {
        data,
      } = await supabase
        .from('companies')
        .select('*')
        .eq(
          'user_id',
          userData.user.id
        )
        .single();

      if (!data) return;

      setTheme({

        primary:
          data.primary_color ||
          '#FF4FA3',

        secondary:
          data.secondary_color ||
          '#1A1F5E',

        logo:
          data.logo_url || '',
      });

      document.documentElement.style.setProperty(
        '--primary-color',
        data.primary_color
      );

      document.documentElement.style.setProperty(
        '--secondary-color',
        data.secondary_color
      );
    }

    loadTheme();

  }, []);

  return (

    <ThemeContext.Provider
      value={theme}
    >

      {children}

    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(
    ThemeContext
  );
}