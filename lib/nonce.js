/**
 * AUREX — Nonce Manager
 * Prevents nonce conflicts when multiple MCP transactions fire simultaneously
 */

import { getXLayerProvider } from './xlayer.js';

const nonces = {};

export async function getNextNonce(address) {
  const provider = getXLayerProvider();
  const key = address.toLowerCase();
  const onchainNonce = await provider.getTransactionCount(address, 'latest');
  if (!nonces[key] || nonces[key] < onchainNonce) {
    nonces[key] = onchainNonce;
  }
  const nextNonce = nonces[key];
  nonces[key]++;
  return nextNonce;
}

export function resetNonce(address) {
  delete nonces[address.toLowerCase()];
}
