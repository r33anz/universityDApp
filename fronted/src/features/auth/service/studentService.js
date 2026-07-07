import apiClient from "../../../shared/lib/apiClient";

export const loginStudent = async (credential) => {
    const response = await apiClient.post("/api/verify", credential);
    return response.data;
};

/**
 * Read-only lookup used by the form on input-blur to tell the admin
 * whether the SIS already has a credential — avoids paying the full
 * emission round-trip just to discover a conflict.
 */
export const getStudentStatus = async (sisCode) => {
    const response = await apiClient.get(`/api/students/${encodeURIComponent(sisCode)}/status`);
    return response.data;
};
