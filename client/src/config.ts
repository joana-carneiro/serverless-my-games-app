const apiId = 'p3w0ko5ex1'
const region = 'east-2'
export const apiEndpoint = `https://${apiId}.execute-api.us-${region}.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-0c7sbbrb.auth0.com',            // Auth0 domain
  clientId: 'fQxH1kjSncUZ0qKdso57hc07Gd48jGY3',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
