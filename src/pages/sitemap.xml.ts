import { getCollection } from "astro:content";
import createSlug from "../lib/createSlug";

export async function GET(context) {
  const site = (context.site?.toString() ?? "https://vnaoussi-djoumessi.com").replace(/\/$/, "");

  const posts = await getCollection("blog");
  const paths = [
    "/",
    "/cv/",
    "/projects/",
    "/research/",
    "/blog/",
    ...posts.map((p) => `/blog/${createSlug(p.data.title, p.slug)}/`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${site}${p}</loc></url>`).join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
