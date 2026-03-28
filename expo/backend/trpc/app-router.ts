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
import { getDashboardAnalyticsProcedure } from "./routes/admin/get-dashboard-analytics/route";
import { listBannersProcedure } from "./routes/admin/banners/list/route";
import { createBannerProcedure } from "./routes/admin/banners/create/route";
import { updateBannerProcedure } from "./routes/admin/banners/update/route";
import { deleteBannerProcedure } from "./routes/admin/banners/delete/route";
import { listSectionsProcedure } from "./routes/admin/sections/list/route";
import { createSectionProcedure } from "./routes/admin/sections/create/route";
import { updateSectionProcedure } from "./routes/admin/sections/update/route";
import { deleteSectionProcedure } from "./routes/admin/sections/delete/route";
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
import { createBookingProcedure } from "./routes/bookings/create-booking/route";
import { listBookingsProcedure } from "./routes/bookings/list-bookings/route";
import { updateBookingStatusProcedure } from "./routes/bookings/update-booking-status/route";
import { getBookingProcedure } from "./routes/bookings/get-booking/route";
import { sendMessageProcedure } from "./routes/messages/send-message/route";
import { getConversationProcedure } from "./routes/messages/get-conversation/route";
import { listConversationsProcedure } from "./routes/messages/list-conversations/route";
import { markAsReadProcedure as markMessageAsReadProcedure } from "./routes/messages/mark-as-read/route";
import { createNotificationProcedure } from "./routes/notifications/create-notification/route";
import { listNotificationsProcedure } from "./routes/notifications/list-notifications/route";
import { markAsReadProcedure as markNotificationAsReadProcedure } from "./routes/notifications/mark-as-read/route";
import { deleteNotificationProcedure } from "./routes/notifications/delete-notification/route";
import { addToWishlistProcedure } from "./routes/wishlists/add/route";
import { removeFromWishlistProcedure } from "./routes/wishlists/remove/route";
import { listWishlistProcedure } from "./routes/wishlists/list/route";
import { addStaffProcedure } from "./routes/staff/add/route";
import { listStaffProcedure } from "./routes/staff/list/route";
import { updateStaffProcedure } from "./routes/staff/update/route";
import { removeStaffProcedure } from "./routes/staff/remove/route";
import { addManagedPropertyProcedure } from "./routes/managed-properties/add/route";
import { listManagedPropertiesProcedure } from "./routes/managed-properties/list/route";
import { updateManagedPropertyProcedure } from "./routes/managed-properties/update/route";
import { deleteManagedPropertyProcedure } from "./routes/managed-properties/delete/route";
import { getAnalyticsProcedure } from "./routes/agents/get-analytics/route";

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
    getAnalytics: getAnalyticsProcedure,
  }),
  admin: createTRPCRouter({
    listUsers: listUsersProcedure,
    updateUserRole: updateUserRoleProcedure,
    blockUser: blockUserProcedure,
    unblockUser: unblockUserProcedure,
    verifyUser: verifyUserProcedure,
    getUserStats: getUserStatsProcedure,
    getDashboardAnalytics: getDashboardAnalyticsProcedure,
    banners: createTRPCRouter({
      list: listBannersProcedure,
      create: createBannerProcedure,
      update: updateBannerProcedure,
      delete: deleteBannerProcedure,
    }),
    sections: createTRPCRouter({
      list: listSectionsProcedure,
      create: createSectionProcedure,
      update: updateSectionProcedure,
      delete: deleteSectionProcedure,
    }),
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
  bookings: createTRPCRouter({
    create: createBookingProcedure,
    list: listBookingsProcedure,
    updateStatus: updateBookingStatusProcedure,
    get: getBookingProcedure,
  }),
  messages: createTRPCRouter({
    send: sendMessageProcedure,
    getConversation: getConversationProcedure,
    listConversations: listConversationsProcedure,
    markAsRead: markMessageAsReadProcedure,
  }),
  notifications: createTRPCRouter({
    create: createNotificationProcedure,
    list: listNotificationsProcedure,
    markAsRead: markNotificationAsReadProcedure,
    delete: deleteNotificationProcedure,
  }),
  wishlists: createTRPCRouter({
    add: addToWishlistProcedure,
    remove: removeFromWishlistProcedure,
    list: listWishlistProcedure,
  }),
  staff: createTRPCRouter({
    add: addStaffProcedure,
    list: listStaffProcedure,
    update: updateStaffProcedure,
    remove: removeStaffProcedure,
  }),
  managedProperties: createTRPCRouter({
    add: addManagedPropertyProcedure,
    list: listManagedPropertiesProcedure,
    update: updateManagedPropertyProcedure,
    delete: deleteManagedPropertyProcedure,
  }),
});

export type AppRouter = typeof appRouter;
