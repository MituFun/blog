import sitemap from '@astrojs/sitemap';
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import swup from '@swup/astro';
import Compress from "astro-compress";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import vercel from '@astrojs/vercel/serverless';
import Color from "colorjs.io";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeComponents from "rehype-components"; /* Render the custom directive content */
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkDirective from "remark-directive"; /* Handle directives */
import remarkGithubAdmonitionsToDirectives from "remark-github-admonitions-to-directives";
import remarkMath from "remark-math";
import { AdmonitionComponent } from "./src/plugins/rehype-component-admonition.mjs";
import { GithubCardComponent } from "./src/plugins/rehype-component-github-card.mjs";
import { parseDirectiveNode } from "./src/plugins/remark-directive-rehype.js";
import { remarkReadingTime } from "./src/plugins/remark-reading-time.mjs";
import { remarkExcerpt } from "./src/plugins/remark-excerpt.js";
import vercel from "@astrojs/vercel/serverless";
const oklchToHex = str => {
  const DEFAULT_HUE = 250;
  const regex = /-?\d+(\.\d+)?/g;
  const matches = str.string.match(regex);
  const lch = [matches[0], matches[1], DEFAULT_HUE];
  return new Color("oklch", lch).to("srgb").toString({
    format: "hex"
  });
};


// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: vercel()
});