import {RECAPTCHA_SECRETKEY} from '$env/static/private'
import { success } from '$lib/utils/response.js';

export async function GET({params}) {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      secret: RECAPTCHA_SECRETKEY, // Replace with your actual secret key
      response: params.token,
      // remoteip: request.headers.get('x-forwarded-for') || request.ip // Optional: Get user's IP address
    }),
  });
  const responseBody = await response.json()
  return success({data: responseBody})
}