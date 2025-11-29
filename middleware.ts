import { auth } from './auth';

export default auth((req) => {
  // Your middleware logic here
  return;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
