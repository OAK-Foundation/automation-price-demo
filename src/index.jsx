import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { NetworkContextProvider } from './context/Network';
import { WalletEthereumContextProvider } from './context/WalletEthereum';
import { WalletPolkadotContextProvider } from './context/WalletPolkadot';

import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HashRouter>
      <NetworkContextProvider>
        <WalletEthereumContextProvider>
          <WalletPolkadotContextProvider>
            <App />
          </WalletPolkadotContextProvider>
        </WalletEthereumContextProvider>
      </NetworkContextProvider>
    </HashRouter>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
