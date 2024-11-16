import { createContext } from "react";

const WalletContext = createContext({
  account: null,
  balancce: null,
  isWalletConnected: false,
  provider: null,
  signer: null,
  connectWallet: () => {},
  disconnectWallet: () => {},
});

export default WalletContext;
