export const fakeClaims = [
  { id: 101, amount: 250_000, depth: 20, goldDust: 0.24, start: Date.now() - 86400000 * 5 },
  { id: 102, amount: 80_000, depth: 10, goldDust: 0.07, start: Date.now() - 86400000 * 2 },
];

export const fakeProspectors = [
  { name: "Miner_0xA1", compoundedEth: 2.14, bgld: 620000 },
  { name: "Miner_0x4B", compoundedEth: 1.02, bgld: 315000 },
  { name: "Miner_0xC7", compoundedEth: 0.44, bgld: 126000 },
];

export function simulateBuyPressure() {
  const eth = (Math.random() * 0.2 + 0.02).toFixed(3);
  const bgld = Math.floor(Math.random() * 200000 + 5000);
  return { eth, bgld, time: new Date().toLocaleTimeString() };
}
