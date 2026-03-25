import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedPage = createRouteMatcher(['/my-dashboards(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedPage(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)',],
}
