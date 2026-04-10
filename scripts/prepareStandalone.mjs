import { access, cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = path.join(projectRoot, ".next", "standalone");

const copyTargets = [
  {
    source: path.join(projectRoot, "public"),
    destination: path.join(standaloneRoot, "public"),
  },
  {
    source: path.join(projectRoot, ".next", "static"),
    destination: path.join(standaloneRoot, ".next", "static"),
  },
];

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function prepareStandalone() {
  if (!(await pathExists(standaloneRoot))) {
    throw new Error("Standalone output is missing. Run `npm run build` first.");
  }

  for (const copyTarget of copyTargets) {
    if (!(await pathExists(copyTarget.source))) {
      continue;
    }

    await mkdir(path.dirname(copyTarget.destination), { recursive: true });
    await rm(copyTarget.destination, { recursive: true, force: true });
    await cp(copyTarget.source, copyTarget.destination, { recursive: true });
  }

  console.log("Standalone artifact prepared at .next/standalone");
}

await prepareStandalone();
