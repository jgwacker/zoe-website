import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';

export async function GET(context) {
	// The blog is the Astro starter's placeholder posts, hidden from the build (src/pages/_blog) until Zoe
	// writes a first post. Restore `getCollection('blog')` here and rename the folder back to `blog` then.
	const posts = [];
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site,
		items: posts.map((post) => ({
			...post.data,
			link: `/blog/${post.id}/`,
		})),
	});
}
