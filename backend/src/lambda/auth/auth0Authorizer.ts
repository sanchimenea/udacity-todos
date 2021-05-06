import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
// import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = '...'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJIjYqRF3lILxJMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1rMzU2eWt5MS51cy5hdXRoMC5jb20wHhcNMjEwNDA4MDUzNjEwWhcN
MzQxMjE2MDUzNjEwWjAkMSIwIAYDVQQDExlkZXYtazM1NnlreTEudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuUXXHQrN2NYfTtWA
9p30C2wL0C1FKYI/n9mQfT0i7OMXJ3CU9XtG4nFPODE2ZmsLjfFeRtOTUoKYJqxC
HCHFhyRTz1FSdSJE7DPkFwTnfW510M+miG2oxzXVOgF1zsByjx7Rcya9+9KhGag7
0J1W2JAx1XC8UjEYGV/R5h8otsaohWsb/3MqtgyHaYxlnKqyB0gJzRyZceyZjP2+
HJZr9lbXQOHOOyCiOcRK1E1Z7pEy7hqYh6Knk2RrIZlyDOttsibvuFohcK6AE4J2
EN6OMa1NBWF8lTBVflgucXe2d3k+MQypdOrL/l+5RXFh6O/3v2l19acsUaf/CnRl
fDA9DQIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRsNKwVBqKA
2wXne9Yw7dpYtvXfGjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
AGxoM09BTOFlPoDi45f2o9lvu013lEx7HZw3EtaA/LG+CLXSmZ08LS9GNSv1Fz6T
7I0vbnA+dOA9hMJ3iw6iNdqRjv+JtDnVrFc3vEPiKsU3xMbU8564LysxyKBku9iY
+Q4jaIsK8nuTq26QK6XgZdV91GzKkcE0Rj+607Remau5L7aru/nq0XMUfkoApCom
lZnuHNbKNsN1Iqp94u64KgoKYnYeqQFfC6sqOPTpnSeQFHkcrIJJPzyoc3GXH7Pq
2VFPmcurv7T1XXpfNRPHmjIy3eqFUvTvSX2BuXI5OEa5hUP4BdDrjhUOStjGKxDk
ajNd2USFudXcLOFD2V3d2Cs=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload;
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
