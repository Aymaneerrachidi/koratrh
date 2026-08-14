"use client";

import { Check, Copy, Plus, ShoppingBagOpen } from "@phosphor-icons/react";
import { useState } from "react";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const contract = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim();
const swapUrl = process.env.NEXT_PUBLIC_SWAP_URL?.trim();

export function NetworkPanel() {
  const [networkState, setNetworkState] = useState<"idle" | "working" | "done" | "error">("idle");
  const [copied, setCopied] = useState(false);

  async function addNetwork() {
    if (!window.ethereum) {
      setNetworkState("error");
      return;
    }
    setNetworkState("working");
    try {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: "0x1237",
            chainName: "Robinhood Chain",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://rpc.mainnet.chain.robinhood.com"],
            blockExplorerUrls: ["https://robinhoodchain.blockscout.com"],
          },
        ],
      });
      setNetworkState("done");
    } catch {
      setNetworkState("error");
    }
  }

  async function copyContract() {
    if (!contract) return;
    await navigator.clipboard.writeText(contract);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="network-panel">
      <div className="network-copy">
        <p className="mono-label">Robinhood Chain</p>
        <h2>Built where the hood meets the chain.</h2>
        <p>
          EVM compatible, chain ID 4663, with ETH for gas. Add the network now and keep your eyes on the verified contract.
        </p>
      </div>

      <div className="network-actions">
        <div className="contract-row">
          <span>Contract</span>
          <strong title={contract || "Not announced"}>{contract ? shortenAddress(contract) : "Coming soon"}</strong>
          <button type="button" onClick={copyContract} disabled={!contract} aria-label="Copy contract address">
            {copied ? <Check size={18} weight="bold" /> : <Copy size={18} weight="bold" />}
          </button>
        </div>
        <button className="button button-green" type="button" onClick={addNetwork} disabled={networkState === "working"}>
          {networkState === "done" ? <Check size={20} weight="bold" /> : <Plus size={20} weight="bold" />}
          {networkState === "working" ? "Opening wallet" : networkState === "done" ? "Network added" : "Add network"}
        </button>
        {swapUrl ? (
          <a className="button button-outline-dark" href={swapUrl} target="_blank" rel="noreferrer">
            <ShoppingBagOpen size={20} weight="bold" /> Trade $KORAT
          </a>
        ) : (
          <span className="launch-note">Trading link appears here after launch.</span>
        )}
        {networkState === "error" && (
          <p className="inline-error" role="status">
            No compatible wallet was found, or the request was cancelled.
          </p>
        )}
      </div>
    </div>
  );
}

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
