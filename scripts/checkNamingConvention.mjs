import { readdir } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, "src");
const appRoot = path.join(sourceRoot, "app");

const kebabCasePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pascalCasePattern = /^[A-Z][A-Za-z0-9]*$/;
const hookFilePattern = /^use[A-Z][A-Za-z0-9]*$/;

const nextReservedFileNames = new Set([
  "page",
  "layout",
  "loading",
  "error",
  "global-error",
  "not-found",
  "template",
  "default",
  "route",
  "icon",
  "apple-icon",
  "opengraph-image",
  "twitter-image",
  "robots",
  "sitemap",
  "manifest",
  "proxy",
  "instrumentation",
  "instrumentation-client",
  "mdx-components",
]);

const allowedFileExtensions = new Set([".ts", ".tsx"]);
const violations = [];

function isInsideAppDirectory(targetPath) {
  return targetPath === appRoot || targetPath.startsWith(`${appRoot}${path.sep}`);
}

function isNextSpecialFolderName(folderName) {
  return (
    /^\(.+\)$/.test(folderName) ||
    /^\[[^\]]+\]$/.test(folderName) ||
    /^\[\[\.\.\.[^\]]+\]\]$/.test(folderName) ||
    /^\[\.\.\.[^\]]+\]$/.test(folderName) ||
    /^@.+$/.test(folderName)
  );
}

function isAllowedFolderName(folderPath, folderName) {
  if (kebabCasePattern.test(folderName)) {
    return true;
  }

  return isInsideAppDirectory(folderPath) && isNextSpecialFolderName(folderName);
}

function isAllowedFileName(filePath, fileName) {
  const extension = path.extname(fileName);
  const baseName = fileName.slice(0, -extension.length);

  if (!allowedFileExtensions.has(extension) || fileName.endsWith(".d.ts")) {
    return true;
  }

  if (isInsideAppDirectory(filePath) && nextReservedFileNames.has(baseName)) {
    return true;
  }

  if (filePath.startsWith(path.join(sourceRoot, "hooks")) && hookFilePattern.test(baseName)) {
    return true;
  }

  return pascalCasePattern.test(baseName);
}

async function scanDirectory(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    const relativePath = path.relative(projectRoot, entryPath);

    if (entry.isDirectory()) {
      if (!isAllowedFolderName(entryPath, entry.name)) {
        violations.push(
          `Folder must use kebab-case: ${relativePath.replaceAll("\\", "/")}`,
        );
      }

      await scanDirectory(entryPath);
      continue;
    }

    if (!isAllowedFileName(entryPath, entry.name)) {
      violations.push(
        `File must use PascalCase unless it is a Next.js reserved file: ${relativePath.replaceAll("\\", "/")}`,
      );
    }
  }
}

async function main() {
  await scanDirectory(sourceRoot);

  if (violations.length === 0) {
    console.log("Naming convention check passed.");
    return;
  }

  console.error("Naming convention check failed:");

  for (const violation of violations) {
    console.error(`- ${violation}`);
  }

  process.exitCode = 1;
}

await main();
