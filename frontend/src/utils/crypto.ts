import { arrayBufferToBase64, base64ToArrayBuffer } from "./encoding";

// utils/crypto.ts
const IV_LEN = 12; // bytes

export async function encryptJsonWithKey(obj: unknown, key: CryptoKey): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const plaintext = new TextEncoder().encode(JSON.stringify(obj));
  const ctBuf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  // concat iv + ciphertext
  const out = new Uint8Array(iv.byteLength + ctBuf.byteLength);
  out.set(iv, 0);
  out.set(new Uint8Array(ctBuf), iv.byteLength);
  return arrayBufferToBase64(out.buffer);
}

export async function decryptJsonWithKey(b64IvCt: string, key: CryptoKey): Promise<any> {
  const buf = base64ToArrayBuffer(b64IvCt);
  const u = new Uint8Array(buf);
  if (u.byteLength <= IV_LEN) throw new Error("ciphertext too small");
  const iv = u.subarray(0, IV_LEN);
  const ct = u.subarray(IV_LEN);
  const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct.buffer);
  const json = new TextDecoder().decode(plainBuf);
  return JSON.parse(json);
}
