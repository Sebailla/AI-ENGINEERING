export interface PackageFileEntry {
  path: string;
}

export interface PackageAuditResult {
  complete: boolean;
  errors: string[];
  files: string[];
}

const ALLOWED_ROOTS = ["dist/src/", "templates/"];
const ALLOWED_FILES = new Set(["package.json", "README.md", "LICENSE"]);
const FORBIDDEN_SEGMENTS = [".ai/", ".codex/", ".claude/", ".pi/", ".opencode/"];

export function auditPackageFiles(entries: PackageFileEntry[], packageVersion: string, harnessVersion: string): PackageAuditResult {
  const files = entries.map((entry) => entry.path).sort();
  const errors: string[] = [];
  if (packageVersion !== harnessVersion) errors.push(`Version mismatch: package.json=${packageVersion}, harness=${harnessVersion}.`);
  for (const file of files) {
    if (file.startsWith("/") || file.includes("..")) {
      errors.push(`Unsafe package path: ${file}.`);
    } else if (FORBIDDEN_SEGMENTS.some((segment) => file.includes(segment)) || file.startsWith("src/") || file.startsWith("test/") || file.startsWith("dist/test/")) {
      errors.push(`Forbidden package path: ${file}.`);
    } else if (!ALLOWED_FILES.has(file) && !ALLOWED_ROOTS.some((root) => file.startsWith(root))) {
      errors.push(`Unowned package path: ${file}.`);
    }
  }
  return { complete: errors.length === 0, errors, files };
}
