import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { getAuthToken } from "@/utils/auth";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  
  if (baseUrl) {
    console.log('tRPC Base URL:', baseUrl);
    return baseUrl;
  }

  console.error('EXPO_PUBLIC_RORK_API_BASE_URL not found in environment');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('EXPO_PUBLIC')));
  
  throw new Error(
    "No base url found, please set EXPO_PUBLIC_RORK_API_BASE_URL"
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      async headers() {
        const token = await getAuthToken();
        return {
          authorization: token ? `Bearer ${token}` : "",
        };
      },
    }),
  ],
});
