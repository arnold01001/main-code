"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { WalletTermsModal } from "./WalletTermsModal";

type WalletContextValue = {
  connected: boolean;
  address: string;
  termsAccepted: boolean;
  connect: () => void;
  disconnect: () => void;
  acceptTerms: () => void;
};

const WalletContext = createContext<WalletContextValue | null>(null);

const demoAddress = "0x4c91aa7700de12bb3318e774c0ff21aa";
const TERMS_KEY = "looting-wallet-terms-v1";

function readAccepted(address: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(`${TERMS_KEY}:${address.toLowerCase()}`) === "1";
  } catch {
    return false;
  }
}

function writeAccepted(address: string) {
  try {
    window.localStorage.setItem(`${TERMS_KEY}:${address.toLowerCase()}`, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setTermsAccepted(readAccepted(demoAddress));
    setHydrated(true);
  }, []);

  const connect = useCallback(() => {
    setConnected(true);
    setTermsAccepted(readAccepted(demoAddress));
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
  }, []);

  const acceptTerms = useCallback(() => {
    writeAccepted(demoAddress);
    setTermsAccepted(true);
  }, []);

  const needsTerms = hydrated && connected && !termsAccepted;

  const value = useMemo(
    () => ({
      connected,
      address: demoAddress,
      termsAccepted,
      connect,
      disconnect,
      acceptTerms,
    }),
    [connected, termsAccepted, connect, disconnect, acceptTerms],
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletTermsModal open={needsTerms} onAccept={acceptTerms} onDisconnect={disconnect} />
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const value = useContext(WalletContext);
  if (!value) throw new Error("useWallet must be used inside WalletProvider");
  return value;
}
