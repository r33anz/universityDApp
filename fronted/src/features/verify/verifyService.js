import apiClient from "../../shared/lib/apiClient";

const verifyStudentByWallet = async (walletAddress) => {
  const response = await apiClient.get(`/api/verify-wallet/${walletAddress}`);
  return response.data;
};

export { verifyStudentByWallet };
