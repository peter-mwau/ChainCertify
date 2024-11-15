import { createContext } from "react";

const WalletContext = createContext({
  account: null,
  balancce: null,
  isWalletConnected: false,
  connectWallet: () => {},
  disconnectWallet: () => {},
});

export default WalletContext;
