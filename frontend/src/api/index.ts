import api from "./axios";

export const reportsApi = {
  create: (data: unknown) => api.post("/reports", data),
  uploadPhoto: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/reports/upload-photo", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getMine: (page = 0) => api.get(`/reports/mine?page=${page}`),
  getAll: (page = 0, status?: string) =>
    api.get(`/reports?page=${page}${status ? `&status=${status}` : ""}`),
  getById: (id: string) => api.get(`/reports/${id}`),
  cancel: (id: string) => api.put(`/reports/${id}/cancel`),
};

export const tasksApi = {
  // Enterprise
  getPendingReports: (page = 0) =>
    api.get(`/enterprise/reports/pending?page=${page}`),
  acceptReport: (reportId: string) =>
    api.put(`/enterprise/reports/${reportId}/accept`),
  rejectReport: (reportId: string, reason?: string) =>
    api.put(
      `/enterprise/reports/${reportId}/reject${reason ? `?reason=${encodeURIComponent(reason)}` : ""}`,
    ),
  getEnterpriseTasks: (page = 0, status?: string) =>
    api.get(
      `/enterprise/tasks?page=${page}${status ? `&status=${status}` : ""}`,
    ),
  getEnterpriseTaskById: (taskId: string) =>
    api.get(`/enterprise/tasks/${taskId}`),
  assignTask: (taskId: string, collectorUserId: string) =>
    api.post(`/enterprise/tasks/${taskId}/assign`, { collectorUserId }),

  // Collector
  getMyTasks: (page = 0) => api.get(`/collector/tasks?page=${page}`),
  getCollectorTaskById: (taskId: string) =>
    api.get(`/collector/tasks/${taskId}`),
  updateStatus: (taskId: string, status: string) =>
    api.put(`/collector/tasks/${taskId}/status?status=${status}`),
  completeTask: (taskId: string, data: unknown) =>
    api.post(`/collector/tasks/${taskId}/complete`, data),
  uploadEvidence: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/collector/evidence/upload", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const rewardsApi = {
  getBalance: () => api.get("/rewards/balance"),
  getTransactions: (page = 0) => api.get(`/rewards/transactions?page=${page}`),
  getLeaderboard: (limit = 20) =>
    api.get(`/rewards/leaderboard?limit=${limit}`),
  getItems: () => api.get("/rewards/items"),
  redeem: (itemId: string) => api.post("/rewards/redeem", { itemId }),
};

export const complaintsApi = {
  create: (data: unknown) => api.post("/complaints", data),
  getMine: (page = 0) => api.get(`/complaints/mine?page=${page}`),
  getById: (id: string) => api.get(`/complaints/${id}`),
  getAll: (page = 0, status?: string) =>
    api.get(`/complaints?page=${page}${status ? `&status=${status}` : ""}`),
  resolve: (id: string, data: unknown) =>
    api.put(`/complaints/${id}/resolve`, data),
};

export const notificationsApi = {
  getForUser: (page = 0) => api.get(`/notifications?page=${page}`),
  getAll: (page = 0) => api.get(`/admin/notifications?page=${page}`),
  create: (data: unknown) => api.post("/admin/notifications", data),
  deactivate: (id: string) => api.put(`/admin/notifications/${id}/deactivate`),
};

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getEnterprises: (page = 0, size = 20) =>
    api.get(`/admin/enterprises?page=${page}&size=${size}`),
  getUsers: (page = 0, role?: string, status?: string) =>
    api.get(
      `/admin/users?page=${page}${role ? `&role=${role}` : ""}${status ? `&status=${status}` : ""}`,
    ),
  getUserById: (id: string) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: string, status: string) =>
    api.put(`/admin/users/${id}/status?status=${status}`),
  updateUserRole: (id: string, role: string) =>
    api.put(`/admin/users/${id}/role?role=${role}`),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  getRewardItems: (page = 0) => api.get(`/admin/reward-items?page=${page}`),
  createRewardItem: (data: unknown) => api.post("/admin/reward-items", data),
  updateRewardItem: (id: string, data: unknown) =>
    api.put(`/admin/reward-items/${id}`, data),
  deactivateRewardItem: (id: string) => api.delete(`/admin/reward-items/${id}`),
  getSettings: () => api.get("/admin/settings"),
  getSettingByKey: (key: string) => api.get(`/admin/settings/${key}`),
  createSetting: (data: unknown) => api.post("/admin/settings", data),
  updateSetting: (key: string, value: string) =>
    api.put(`/admin/settings/${key}`, { settingValue: value }),
  deleteSetting: (key: string) => api.delete(`/admin/settings/${key}`),
};

export const serviceAreasApi = {
  getAll: () => api.get("/service-areas"),
  getById: (id: string) => api.get(`/service-areas/${id}`),
  create: (data: unknown) => api.post("/admin/service-areas", data),
  update: (id: string, data: unknown) =>
    api.put(`/admin/service-areas/${id}`, data),
  delete: (id: string) => api.delete(`/admin/service-areas/${id}`),
};

export const wasteTypesApi = {
  getAll: () => api.get("/waste-types"),
  getById: (id: string) => api.get(`/waste-types/${id}`),
  create: (data: unknown) => api.post("/admin/waste-types", data),
  update: (id: string, data: unknown) =>
    api.put(`/admin/waste-types/${id}`, data),
  deactivate: (id: string) => api.delete(`/admin/waste-types/${id}`),
};

export const userApi = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data: unknown) => api.put("/users/me", data),
  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return api.post("/users/me/avatar", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const enterpriseCapabilitiesApi = {
  getAll: () => api.get("/enterprise/capabilities"),
  create: (data: unknown) => api.post("/enterprise/capabilities", data),
  delete: (id: string) => api.delete(`/enterprise/capabilities/${id}`),
};

export const enterpriseCollectorsApi = {
  getAll: () => api.get("/enterprise/collectors"),
  update: (
    collectorUserId: string,
    data: {
      firstName?: string;
      lastName?: string;
      displayName?: string;
      phone?: string;
    },
  ) => api.put(`/enterprise/collectors/${collectorUserId}`, data),
  deactivate: (collectorUserId: string) =>
    api.delete(`/enterprise/collectors/${collectorUserId}`),
};

export const enterpriseRewardRulesApi = {
  getAll: () => api.get("/enterprise/reward-rules"),
  create: (data: unknown) => api.post("/enterprise/reward-rules", data),
  update: (id: string, data: unknown) =>
    api.put(`/enterprise/reward-rules/${id}`, data),
  delete: (id: string) => api.delete(`/enterprise/reward-rules/${id}`),
};

export const enterpriseKpiApi = {
  getCollectors: () => api.get("/enterprise/collectors"),
  calculateKpi: (data: unknown) => api.post("/enterprise/collectors/kpi", data),
  getCollectorKpi: (collectorId: string) =>
    api.get(`/enterprise/collectors/${collectorId}/kpi`),
};

export const collectorKpiApi = {
  getToday: () => api.get("/collector/kpi/today"),
};
