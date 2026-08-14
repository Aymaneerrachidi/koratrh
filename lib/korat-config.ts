export const KORAT_CONTRACT_ADDRESS = "0x548bd8c1e77f647d6fe6c6f85e2dcb7310287777";

export function getKoratContractAddress() {
  return process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim() || KORAT_CONTRACT_ADDRESS;
}

export function isKoratContractQuestion(input: string) {
  return /\bca\b|\bcontract(?:\s+address)?\b/i.test(input);
}

export function getKoratContractReply() {
  return `Confirmed $KORAT CA:\n${getKoratContractAddress()}`;
}
