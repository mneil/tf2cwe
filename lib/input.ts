import fs from "fs/promises";
import path from "path";

interface WalkOptions {
  depth?: number;
  extensions?: string[];
}

type entries = { [key: string]: string[] };

function supportedExtension(list: string[], ext: string) {
  return list[0] === "*" || list.includes(ext);
}

async function run(folder: string, depth = -1, opts: Required<WalkOptions>): Promise<entries> {
  depth++;
  let inputs: entries = {};
  const dirents = await fs.readdir(folder, { withFileTypes: true });
  for (const stat of dirents) {
    const child = path.resolve(folder, stat.name);
    if (stat.isDirectory()) {
      if (depth > opts.depth) {
        continue;
      }
      const extGroups = await run(child, depth, opts);
      for (const [ext, arr] of Object.entries(extGroups)) {
        !inputs[ext] && (inputs[ext] = []);
        inputs[ext] = inputs[ext].concat(arr);
      }
      continue;
    }
    const ext = path.extname(stat.name);
    if (!supportedExtension(opts.extensions, ext)) {
      continue;
    }
    !inputs[ext] && (inputs[ext] = []);
    inputs[ext].push(child);
  }
  return inputs;
}

export async function walk(input: string, opts: WalkOptions = {}): Promise<entries> {
  const options = {
    depth: Infinity,
    extensions: ["*"],
    ...opts,
  };
  const abs = path.resolve(input);
  const dirent = await fs.stat(abs);
  if (!dirent.isDirectory()) {
    const ext = path.extname(abs);
    if (!supportedExtension(options.extensions, ext)) {
      throw new Error(`input must be a directory or file of type ${options.extensions.join(", ")}`);
    }
    return { [ext]: [abs] };
  }
  return run(abs, options.depth, options);
}
