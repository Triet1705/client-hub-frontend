import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, sep } from "node:path";

const projectRoot = process.cwd();
const scanRoots = [
  "src/app/(dashboard)",
  "src/app/(admin)",
  "src/components/layout",
  "src/components/shared",
  "src/components/skeletons",
  "src/components/ui",
  "src/components/icons/Branding",
  "src/features/admin",
  "src/features/audit",
  "src/features/certificates",
  "src/features/communication",
  "src/features/invoices",
  "src/features/notifications",
  "src/features/projects",
  "src/features/smart-tasks",
  "src/features/tasks",
];

const excludedFiles = new Set([
  // Auth is intentionally dark-only and is outside the internal theme surface.
  "src/components/ui/auth-input.tsx",
]);

const hardcodedUtility =
  /(?:^|[^a-zA-Z])(?:bg|text|border|ring|divide|from|via|to|stroke|fill)-(?:slate|gray|zinc|neutral|stone|white|black|emerald|green|red|rose|amber|yellow|orange|blue|indigo|violet|purple|cyan|sky)(?:-\d{2,3}|\/\d+|\b)/;
const arbitraryHexUtility =
  /(?:bg|text|border|ring|divide|from|via|to|stroke|fill)-\[#(?:[0-9a-f]{3}){1,2}\]/i;
const rawHex = /#[0-9a-f]{3,8}\b/i;

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(absolutePath)));
    } else if ([".ts", ".tsx"].includes(extname(entry.name))) {
      files.push(absolutePath);
    }
  }

  return files;
}

const files = (
  await Promise.all(scanRoots.map((root) => collectFiles(join(projectRoot, root))))
).flat();
const violations = [];

for (const file of files) {
  const relativePath = relative(projectRoot, file).split(sep).join("/");
  if (excludedFiles.has(relativePath)) continue;

  const lines = (await readFile(file, "utf8")).split(/\r?\n/);
  lines.forEach((line, index) => {
    if (
      hardcodedUtility.test(line) ||
      arbitraryHexUtility.test(line) ||
      rawHex.test(line)
    ) {
      violations.push(`${relativePath}:${index + 1}: ${line.trim()}`);
    }
  });
}

if (violations.length > 0) {
  console.error(
    "Theme hard-code guard failed. Use semantic theme/status/action tokens:\n",
  );
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log(`Theme hard-code guard passed (${files.length} files checked).`);
