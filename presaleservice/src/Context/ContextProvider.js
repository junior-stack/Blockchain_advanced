import { useState } from "react";
import Context from "./Context";

const ContextProvider = ({ children }) => {
  const [AccountAddress, setAccountAddress] = useState("");
  return (
    <Context.Provider value={{ AccountAddress, setAccountAddress }}>
      {children}
    </Context.Provider>
  );
};

export default ContextProvider;
