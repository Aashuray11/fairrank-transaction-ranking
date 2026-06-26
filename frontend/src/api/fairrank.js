import api from "./client";

export const fetchDashboard = async () => (await api.get("/dashboard")).data.data;
export const fetchAnalytics = async () => (await api.get("/analytics")).data.data;
export const fetchRanking = async ({ page = 1, limit = 10, search = "" } = {}) =>
  (await api.get("/ranking", { params: { page, limit, search } })).data;
export const fetchUserSummary = async (userId) => (await api.get(`/summary/${encodeURIComponent(userId)}`)).data.data;
export const submitTransaction = async (payload) => (await api.post("/transaction", payload)).data;
