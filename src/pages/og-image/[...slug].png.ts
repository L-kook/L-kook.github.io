import type { APIContext, InferGetStaticPropsType } from "astro";
import satori, { type SatoriOptions } from "satori";
import sharp from "sharp";
import RobotoMonoBold from "@/assets/roboto-mono-700.ttf";
import RobotoMono from "@/assets/roboto-mono-regular.ttf";
import { getAllPosts } from "@/data/post";
import { siteConfig } from "@/site.config";
import { getFormattedDate } from "@/utils/date";
import { readCache, writeToCache } from "./_cacheUtil";
import { ogMarkup } from "./_ogMarkup";

async function loadCjkFonts(text: string): Promise<SatoriOptions["fonts"]> {
	// Only fetch subset if text contains non-ASCII characters
	if (!/[^\x00-\x7F]/.test(text)) return [];
	const uniqueChars = [...new Set(text)].join("");
	const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&text=${encodeURIComponent(uniqueChars)}`;
	try {
		const cssRes = await fetch(cssUrl, {
			headers: {
				// Request TTF format (Satori does not support WOFF2)
				"User-Agent":
					"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1",
			},
		});
		if (!cssRes.ok) return [];
		const css = await cssRes.text();
		const fonts: SatoriOptions["fonts"] = [];
		const blocks = css.matchAll(
			/font-weight:\s*(\d+);[\s\S]*?src:\s*url\((https:\/\/[^)]+)\)/g,
		);
		for (const [, weightStr, fontUrl] of blocks) {
			if (!fontUrl) continue;
			const fontRes = await fetch(fontUrl);
			if (!fontRes.ok) continue;
			const data = Buffer.from(await fontRes.arrayBuffer());
			fonts.push({
				data,
				name: "Noto Sans SC",
				style: "normal",
				weight: Number(weightStr) === 700 ? 700 : 400,
			});
		}
		return fonts;
	} catch {
		return [];
	}
}

const baseFonts: SatoriOptions["fonts"] = [
	{
		data: Buffer.from(RobotoMono),
		name: "Roboto Mono",
		style: "normal",
		weight: 400,
	},
	{
		data: Buffer.from(RobotoMonoBold),
		name: "Roboto Mono",
		style: "normal",
		weight: 700,
	},
];

type Props = InferGetStaticPropsType<typeof getStaticPaths>;

export async function GET(context: APIContext) {
	const { pubDate, title } = context.props as Props;

	// check the og-image cache
	let pngBuffer = readCache(title, pubDate);
	if (!pngBuffer) {
		console.info(`Generating new OG image for: ${title}`);
		const postDate = getFormattedDate(pubDate, {
			month: "long",
			weekday: "long",
		});
		const cjkFonts = await loadCjkFonts(`${title}${postDate}${siteConfig.title}${siteConfig.author}`);
		const svg = await satori(ogMarkup(title, postDate), {
			fonts: [...baseFonts, ...cjkFonts],
			height: 630,
			width: 1200,
		});
		pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
		writeToCache(title, pubDate, pngBuffer);
	}

	return new Response(new Uint8Array(pngBuffer), {
		headers: {
			"Cache-Control": "public, max-age=31536000, immutable",
			"Content-Type": "image/png",
		},
	});
}

export async function getStaticPaths() {
	const posts = await getAllPosts();
	return posts
		.values()
		.filter(({ data }) => !data.ogImage)
		.map((post) => ({
			params: { slug: post.id },
			props: {
				pubDate: post.data.updatedDate ?? post.data.publishDate,
				title: post.data.title,
			},
		}))
		.toArray();
}
