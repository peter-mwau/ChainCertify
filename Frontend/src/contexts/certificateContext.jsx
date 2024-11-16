import { createContext } from "react";

const CertificateContext = createContext({
  getCertifiedDetails: (userId) => {},
});

export default CertificateContext;
