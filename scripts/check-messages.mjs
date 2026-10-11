// Fails when messages/en.json and messages/pt-BR.json do not have the same keys.
import { readFileSync } from "node:fs";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    typeof value === "object" && value !== null
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

const load = (locale) =>
  new Set(flatten(JSON.parse(readFileSync(`messages/${locale}.json`, "utf8"))));
const en = load("en");
const ptBR = load("pt-BR");

const missingInPt = [...en].filter((key) => !ptBR.has(key));
const missingInEn = [...ptBR].filter((key) => !en.has(key));

if (missingInPt.length || missingInEn.length) {
  for (const key of missingInPt) console.error(`missing in pt-BR: ${key}`);
  for (const key of missingInEn) console.error(`missing in en: ${key}`);
  process.exit(1);
}
console.log(`messages OK (${en.size} keys)`);
