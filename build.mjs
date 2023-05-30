import * as esbuild from "esbuild";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";

const envSchema = z.object({
    NODE_ENV: z.string().optional().default("development"),
});
const { NODE_ENV } = envSchema.parse(process.env);
const isDevelopment = NODE_ENV === "development";

const cwd = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf-8"));
const dependencies = Object.keys(pkg.dependencies || {});
const devDependencies = Object.keys(pkg.devDependencies || {});

await esbuild.build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "node18",
    outfile: "dist/bundle.cjs",
    sourcemap: isDevelopment,
    minify: !isDevelopment,
    external: [...dependencies, ...devDependencies],
});
