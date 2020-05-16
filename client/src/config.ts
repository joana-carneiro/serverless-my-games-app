// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'p3w0ko5ex1'
const region = 'east-2'
export const apiEndpoint = `https://${apiId}.execute-api.us-${region}.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-0c7sbbrb.auth0.com',            // Auth0 domain
  clientId: 'PU2kuCb6ww5ZecttTwmG7eLJOaTCjnhl',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
