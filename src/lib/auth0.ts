import { Auth0Client } from '@auth0/nextjs-auth0/server';

const {
  AUTH0_DOMAIN,
  AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET,
  AUTH0_SECRET,
  APP_BASE_URL,
} = process.env;

const missing = [
  ['AUTH0_DOMAIN', AUTH0_DOMAIN],
  ['AUTH0_CLIENT_ID', AUTH0_CLIENT_ID],
  ['AUTH0_CLIENT_SECRET', AUTH0_CLIENT_SECRET],
  ['AUTH0_SECRET', AUTH0_SECRET],
  ['APP_BASE_URL', APP_BASE_URL],
].filter(([, value]) => !value);

if (missing.length) {
  const names = missing.map(([name]) => name).join(', ');
  throw new Error(`Missing Auth0 environment variables: ${names}`);
}

export const auth0 = new Auth0Client({
  domain: AUTH0_DOMAIN!,
  clientId: AUTH0_CLIENT_ID!,
  clientSecret: AUTH0_CLIENT_SECRET!,
  secret: AUTH0_SECRET!,
  appBaseUrl: APP_BASE_URL!,
});
