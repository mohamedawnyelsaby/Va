22:36:36.767 Running build in Washington, D.C., USA (East) – iad1
22:36:36.768 Build machine configuration: 2 cores, 8 GB
22:36:37.095 Cloning github.com/mohamedawnyelsaby/Va (Branch: main, Commit: a04d535)
22:36:38.543 Cloning completed: 1.448s
22:36:39.453 Restored build cache from previous deployment (AF72zwZSQrxBnHVQkMWSo8f4NeQu)
22:36:39.828 Running "vercel build"
22:36:40.710 Vercel CLI 50.4.9
22:36:40.973 Installing dependencies...
22:36:41.203 npm warn Unknown project config "auto-install-peers". This will stop working in the next major version of npm.
22:36:42.105 
22:36:42.106 > va-travel@1.0.1 postinstall
22:36:42.106 > prisma generate
22:36:42.107 
22:36:42.589 Prisma schema loaded from prisma/schema.prisma
22:36:43.280 
22:36:43.281 ✔ Generated Prisma Client (v5.8.0) to ./node_modules/@prisma/client in 320ms
22:36:43.281 
22:36:43.281 Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
22:36:43.281 ```
22:36:43.281 import { PrismaClient } from '@prisma/client'
22:36:43.282 const prisma = new PrismaClient()
22:36:43.282 ```
22:36:43.282 or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)
22:36:43.282 ```
22:36:43.282 import { PrismaClient } from '@prisma/client/edge'
22:36:43.282 const prisma = new PrismaClient()
22:36:43.282 ```
22:36:43.282 
22:36:43.282 See other ways of importing Prisma Client: http://pris.ly/d/importing-client
22:36:43.282 
22:36:43.282 ┌─────────────────────────────────────────────────────────────┐
22:36:43.282 │  Deploying your app to serverless or edge functions?        │
22:36:43.282 │  Try Prisma Accelerate for connection pooling and caching.  │
22:36:43.282 │  https://pris.ly/cli/accelerate                             │
22:36:43.282 └─────────────────────────────────────────────────────────────┘
22:36:43.282 
22:36:43.321 
22:36:43.321 up to date in 2s
22:36:43.321 
22:36:43.322 169 packages are looking for funding
22:36:43.322   run `npm fund` for details
22:36:43.367 Detected Next.js version: 16.1.3
22:36:43.370 Running "npm run build"
22:36:43.468 npm warn Unknown project config "auto-install-peers". This will stop working in the next major version of npm.
22:36:43.491 
22:36:43.492 > va-travel@1.0.1 build
22:36:43.492 > prisma generate && next build
22:36:43.492 
22:36:43.892 Prisma schema loaded from prisma/schema.prisma
22:36:44.466 
22:36:44.467 ✔ Generated Prisma Client (v5.8.0) to ./node_modules/@prisma/client in 262ms
22:36:44.468 
22:36:44.468 Start using Prisma Client in Node.js (See: https://pris.ly/d/client)
22:36:44.468 ```
22:36:44.468 import { PrismaClient } from '@prisma/client'
22:36:44.468 const prisma = new PrismaClient()
22:36:44.469 ```
22:36:44.469 or start using Prisma Client at the edge (See: https://pris.ly/d/accelerate)
22:36:44.469 ```
22:36:44.469 import { PrismaClient } from '@prisma/client/edge'
22:36:44.469 const prisma = new PrismaClient()
22:36:44.469 ```
22:36:44.470 
22:36:44.470 See other ways of importing Prisma Client: http://pris.ly/d/importing-client
22:36:44.470 
22:36:44.470 ┌─────────────────────────────────────────────────────────────┐
22:36:44.470 │  Deploying your app to serverless or edge functions?        │
22:36:44.470 │  Try Prisma Accelerate for connection pooling and caching.  │
22:36:44.470 │  https://pris.ly/cli/accelerate                             │
22:36:44.471 └─────────────────────────────────────────────────────────────┘
22:36:44.471 
22:36:44.502 ┌─────────────────────────────────────────────────────────┐
22:36:44.502 │  Update available 5.8.0 -> 7.3.0                        │
22:36:44.503 │                                                         │
22:36:44.505 │  This is a major update - please follow the guide at    │
22:36:44.505 │  https://pris.ly/d/major-version-upgrade                │
22:36:44.505 │                                                         │
22:36:44.506 │  Run the following to update                            │
22:36:44.506 │    npm i --save-dev prisma@latest                       │
22:36:44.506 │    npm i @prisma/client@latest                          │
22:36:44.506 └─────────────────────────────────────────────────────────┘
22:36:45.331 ▲ Next.js 16.1.3 (Turbopack)
22:36:45.331 - Experiments (use with caution):
22:36:45.332   ✓ scrollRestoration
22:36:45.332 
22:36:45.391   Creating an optimized production build ...
22:37:01.004 
22:37:01.005 > Build error occurred
22:37:01.007 Error: Turbopack build failed with 1 errors:
22:37:01.007 ./src/proxy.ts
22:37:01.007 Proxy is missing expected function export name
22:37:01.007 This function is what Next.js runs for every request handled by this proxy (previously called middleware).
22:37:01.007 
22:37:01.007 Why this happens:
22:37:01.008 - You are migrating from `middleware` to `proxy`, but haven't updated the exported function.
22:37:01.008 - The file exists but doesn't export a function.
22:37:01.008 - The export is not a function (e.g., an object or constant).
22:37:01.008 - There's a syntax error preventing the export from being recognized.
22:37:01.008 
22:37:01.009 To fix it:
22:37:01.009 - Ensure this file has either a default or "proxy" function export.
22:37:01.009 
22:37:01.010 Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
22:37:01.010 
22:37:01.010 
22:37:01.010     at ignore-listed frames
22:37:01.062 Error: Command "npm run build" exited with 1
