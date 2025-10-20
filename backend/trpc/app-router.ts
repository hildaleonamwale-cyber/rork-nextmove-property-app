import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { signupProcedure } from "./routes/auth/signup/route";
import { loginProcedure } from "./routes/auth/login/route";
import { logoutProcedure } from "./routes/auth/logout/route";
import { meProcedure } from "./routes/auth/me/route";
import { refreshProcedure } from "./routes/auth/refresh/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  auth: createTRPCRouter({
    signup: signupProcedure,
    login: loginProcedure,
    logout: logoutProcedure,
    me: meProcedure,
    refresh: refreshProcedure,
  }),
});

export type AppRouter = typeof appRouter;
