import { access, readFile } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const css = await readFile("styles.css", "utf8");
const failures = [];

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
if (duplicateIds.length) failures.push(`IDs duplicados: ${duplicateIds.join(", ")}`);

const images = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
for (const image of images) {
  if (!/\salt="[^"]*"/.test(image)) failures.push(`Imagem sem alt: ${image}`);
  if (!/\swidth="\d+"/.test(image) || !/\sheight="\d+"/.test(image)) {
    failures.push(`Imagem sem dimensões: ${image}`);
  }
}

const localAssets = [...html.matchAll(/(?:src|href)="(assets\/[^"]+)"/g)].map((match) => match[1]);
for (const asset of new Set(localAssets)) {
  try {
    await access(asset);
  } catch {
    failures.push(`Asset ausente: ${asset}`);
  }
}

const requiredCopy = [
  "Polimento técnico",
  "Vitrificação",
  "Higienização interna",
  "Lavagem detalhada",
  "Proteção de pintura",
  "Revitalização de faróis",
  "Outros serviços",
  "Agendar pelo WhatsApp",
];

for (const copy of requiredCopy) {
  if (!html.includes(copy)) failures.push(`Conteúdo obrigatório ausente: ${copy}`);
}

if (!html.includes('type="range"') || !html.includes("data-comparison")) {
  failures.push("Comparador interativo não encontrado");
}

if (!css.includes("prefers-reduced-motion: reduce")) {
  failures.push("Tratamento de movimento reduzido ausente");
}

if (!html.includes('loading="lazy"')) failures.push("Lazy loading ausente");
if (!html.includes("[LINK DO WHATSAPP]")) failures.push("Placeholder do WhatsApp ausente");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`QA estrutural aprovado: ${images.length} imagens, ${ids.length} IDs e ${new Set(localAssets).size} assets locais.`);
}
