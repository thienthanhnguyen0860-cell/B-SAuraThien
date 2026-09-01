import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot, collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { SiteSettings, PaymentSettings } from '../types';
import {
  INITIAL_SITE_SETTINGS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_PROPERTIES,
  INITIAL_PROJECTS,
  INITIAL_AGENTS,
} from '../lib/seedData';

interface SiteContextType {
  siteSettings: SiteSettings;
  paymentSettings: PaymentSettings;
  loading: boolean;
  updateSiteSettingsState: (settings: Partial<SiteSettings>) => void;
  updatePaymentSettingsState: (settings: Partial<PaymentSettings>) => void;
  refreshSettings: () => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(INITIAL_PAYMENT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const siteRef = doc(db, 'siteSettings', 'global');
      const siteSnap = await getDoc(siteRef);
      if (siteSnap.exists()) {
        setSiteSettings(siteSnap.data() as SiteSettings);
      }

      const paymentRef = doc(db, 'paymentSettings', 'main');
      const paymentSnap = await getDoc(paymentRef);
      if (paymentSnap.exists()) {
        setPaymentSettings(paymentSnap.data() as PaymentSettings);
      }
    } catch (err) {
      console.error('Error refreshing settings:', err);
    }
  }, []);

  // Initialize and seed database if empty
  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // 1. Fetch site settings
        const siteRef = doc(db, 'siteSettings', 'global');
        const siteSnap = await getDoc(siteRef);
        if (siteSnap.exists()) {
          setSiteSettings(siteSnap.data() as SiteSettings);
        }

        // 2. Fetch payment settings
        const paymentRef = doc(db, 'paymentSettings', 'main');
        const paymentSnap = await getDoc(paymentRef);
        if (paymentSnap.exists()) {
          setPaymentSettings(paymentSnap.data() as PaymentSettings);
        }
      } catch (err) {
        // Gracefully use local cache/defaults
      } finally {
        setLoading(false);
      }
    };

    initializeDatabase();

    // Listen to real-time siteSettings updates
    const unsubSite = onSnapshot(
      doc(db, 'siteSettings', 'global'),
      (docSnap) => {
        if (docSnap.exists()) {
          setSiteSettings(docSnap.data() as SiteSettings);
        }
      },
      (err) => {
        // Ignore real-time permission errors for anonymous visitors
      }
    );

    // Listen to real-time paymentSettings updates
    const unsubPayment = onSnapshot(
      doc(db, 'paymentSettings', 'main'),
      (docSnap) => {
        if (docSnap.exists()) {
          setPaymentSettings(docSnap.data() as PaymentSettings);
        }
      },
      (err) => {
        // Ignore real-time permission errors for anonymous visitors
      }
    );

    return () => {
      unsubSite();
      unsubPayment();
    };
  }, []);

  const updateSiteSettingsState = (newSettings: Partial<SiteSettings>) => {
    setSiteSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updatePaymentSettingsState = (newSettings: Partial<PaymentSettings>) => {
    setPaymentSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <SiteContext.Provider
      value={{
        siteSettings,
        paymentSettings,
        loading,
        updateSiteSettingsState,
        updatePaymentSettingsState,
        refreshSettings,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
};
