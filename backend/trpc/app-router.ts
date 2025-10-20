import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { signupProcedure } from "./routes/auth/signup/route";
import { loginProcedure } from "./routes/auth/login/route";
import { logoutProcedure } from "./routes/auth/logout/route";
import { meProcedure } from "./routes/auth/me/route";
import { refreshProcedure } from "./routes/auth/refresh/route";
import { getProfileProcedure } from "./routes/users/get-profile/route";
import { updateProfileProcedure } from "./routes/users/update-profile/route";
import { uploadAvatarProcedure } from "./routes/users/upload-avatar/route";
import { getAgentProfileProcedure } from "./routes/agents/get-profile/route";
import { createAgentProfileProcedure } from "./routes/agents/create-profile/route";
import { updateAgentProfileProcedure } from "./routes/agents/update-profile/route";
import { upgradePackageProcedure } from "./routes/agents/upgrade-package/route";
import { listUsersProcedure } from "./routes/admin/list-users/route";
import { updateUserRoleProcedure } from "./routes/admin/update-user-role/route";
import { blockUserProcedure } from "./routes/admin/block-user/route";
import { unblockUserProcedure } from "./routes/admin/unblock-user/route";
import { verifyUserProcedure } from "./routes/admin/verify-user/route";
import { getUserStatsProcedure } from "./routes/admin/get-user-stats/route";
import { createPropertyProcedure } from "./routes/properties/create-property/route";
import { getPropertyProcedure } from "./routes/properties/get-property/route";
import { listPropertiesProcedure } from "./routes/properties/list-properties/route";
import { updatePropertyProcedure } from "./routes/properties/update-property/route";
import { deletePropertyProcedure } from "./routes/properties/delete-property/route";
import { incrementViewsProcedure } from "./routes/properties/increment-views/route";
import { incrementInquiriesProcedure } from "./routes/properties/increment-inquiries/route";
import { uploadImageProcedure } from "./routes/uploads/upload-image/route";
import { uploadMultipleProcedure } from "./routes/uploads/upload-multiple/route";
import { deleteImageProcedure } from "./routes/uploads/delete-image/route";

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
  users: createTRPCRouter({
    getProfile: getProfileProcedure,
    updateProfile: updateProfileProcedure,
    uploadAvatar: uploadAvatarProcedure,
  }),
  agents: createTRPCRouter({
    getProfile: getAgentProfileProcedure,
    createProfile: createAgentProfileProcedure,
    updateProfile: updateAgentProfileProcedure,
    upgradePackage: upgradePackageProcedure,
  }),
  admin: createTRPCRouter({
    listUsers: listUsersProcedure,
    updateUserRole: updateUserRoleProcedure,
    blockUser: blockUserProcedure,
    unblockUser: unblockUserProcedure,
    verifyUser: verifyUserProcedure,
    getUserStats: getUserStatsProcedure,
  }),
  properties: createTRPCRouter({
    create: createPropertyProcedure,
    get: getPropertyProcedure,
    list: listPropertiesProcedure,
    update: updatePropertyProcedure,
    delete: deletePropertyProcedure,
    incrementViews: incrementViewsProcedure,
    incrementInquiries: incrementInquiriesProcedure,
  }),
  uploads: createTRPCRouter({
    uploadImage: uploadImageProcedure,
    uploadMultiple: uploadMultipleProcedure,
    deleteImage: deleteImageProcedure,
  }),
});

export type AppRouter = typeof appRouter;
