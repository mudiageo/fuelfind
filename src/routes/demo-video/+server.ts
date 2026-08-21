import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	// TODO: Update this URL to the exact YouTube video URL later
	redirect(302, 'https://www.youtube.com');
};
