export const BASE_REGEX = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^[0-9]+$/,
  16: /^[0-9a-fA-F]+$/,
};

export function isValidInBase(str, base) {
  if (str === "") return true;
  return BASE_REGEX[base]?.test(str) ?? false;
}

export function toAllBases(value, fromBase) {
  if (value === "" || !isValidInBase(value, fromBase)) return null;
  const dec = parseInt(value, fromBase);
  if (Number.isNaN(dec)) return null;
  return {
    2: dec.toString(2),
    8: dec.toString(8),
    10: dec.toString(10),
    16: dec.toString(16).toUpperCase(),
  };
}

export const gates = {
  AND: (a, b) => a & b,
  OR: (a, b) => a | b,
  XOR: (a, b) => a ^ b,
  NAND: (a, b) => (a & b ? 0 : 1),
  NOR: (a, b) => (a | b ? 0 : 1),
  XNOR: (a, b) => (a ^ b ? 0 : 1),
  NOT: (a) => (a ? 0 : 1),
};

export async function shaHash(algo, text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest(algo, enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function ipToInt(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => Number.isNaN(p) || p < 0 || p > 255)) {
    return null;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

export function intToIp(int) {
  return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join(".");
}

export function ipClass(firstOctet) {
  if (firstOctet >= 0 && firstOctet <= 127) return { label: "A", defaultCidr: 8 };
  if (firstOctet >= 128 && firstOctet <= 191) return { label: "B", defaultCidr: 16 };
  if (firstOctet >= 192 && firstOctet <= 223) return { label: "C", defaultCidr: 24 };
  if (firstOctet >= 224 && firstOctet <= 239) return { label: "D (multicast)", defaultCidr: null };
  if (firstOctet >= 240 && firstOctet <= 255) return { label: "E (reserved)", defaultCidr: null };
  return { label: "—", defaultCidr: null };
}

export function addressScope(ipInt) {
  const a = (ipInt >>> 24) & 255;
  const b = (ipInt >>> 16) & 255;
  if (a === 10) return "Private (RFC1918)";
  if (a === 172 && b >= 16 && b <= 31) return "Private (RFC1918)";
  if (a === 192 && b === 168) return "Private (RFC1918)";
  if (a === 127) return "Loopback";
  if (a === 169 && b === 254) return "Link-local (APIPA)";
  if (a >= 224 && a <= 239) return "Multicast";
  return "Public";
}

export function calcSubnet(ipInt, cidr) {
  if (ipInt === null || cidr < 0 || cidr > 32) return null;
  const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const network = (ipInt & maskInt) >>> 0;
  const broadcast = (network | (~maskInt >>> 0)) >>> 0;
  const totalAddresses = Math.pow(2, 32 - cidr);
  const hostCount = cidr >= 31 ? 0 : totalAddresses - 2;
  const firstOctet = (ipInt >>> 24) & 255;
  const cls = ipClass(firstOctet);
  const wildcard = (~maskInt) >>> 0;
  return {
    mask: intToIp(maskInt),
    wildcard: intToIp(wildcard),
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: hostCount > 0 ? intToIp(network + 1) : "—",
    lastHost: hostCount > 0 ? intToIp(broadcast - 1) : "—",
    hostCount: Math.max(hostCount, 0),
    totalAddresses,
    classLabel: cls.label,
    classDefaultCidr: cls.defaultCidr,
    scope: addressScope(ipInt),
  };
}

export function allocateVLSM(baseIpInt, baseCidr, requirements) {
  const totalSpace = Math.pow(2, 32 - baseCidr);
  const baseEnd = baseIpInt + totalSpace;
  const sorted = [...requirements]
    .map((r, i) => ({ ...r, origIndex: i }))
    .sort((a, b) => b.hosts - a.hosts);

  let cursor = baseIpInt;
  const results = [];

  for (const req of sorted) {
    let hostBits = 0;
    while (Math.pow(2, hostBits) - 2 < req.hosts) hostBits++;
    const cidr = 32 - hostBits;
    const size = Math.pow(2, hostBits);
    const aligned = Math.ceil(cursor / size) * size;

    if (aligned + size > baseEnd) {
      results.push({ ...req, error: true });
      continue;
    }

    const network = aligned;
    const broadcast = network + size - 1;
    results.push({
      ...req,
      cidr,
      size,
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      firstHost: size > 2 ? intToIp(network + 1) : "—",
      lastHost: size > 2 ? intToIp(broadcast - 1) : "—",
    });
    cursor = aligned + size;
  }

  return results.sort((a, b) => a.origIndex - b.origIndex);
}
