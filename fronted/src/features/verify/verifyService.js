import axios from 'axios';

const apiUrl = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

const verifyStudentByWallet = async (walletAddress) => {
  try {
    const response = await axios.get(`${apiUrl}/api/verify-wallet/${walletAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error verificando wallet:', error);
    
    if (error.response) {
      throw new Error(error.response.data.message || 'Error del servidor');
    } else if (error.request) {
      throw new Error('No se pudo conectar con el servidor');
    } else {
      throw new Error('Error en la petición');
    }
  }
};

export { verifyStudentByWallet };