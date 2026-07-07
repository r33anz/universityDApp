const ERROR_MESSAGES = {
  NETWORK: "No se pudo conectar con el servidor",
  UNKNOWN: "Ocurrió un error inesperado",
};

export function getApiErrorMessage(error) {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.request && !error.response) {
    return ERROR_MESSAGES.NETWORK;
  }

  if (error.message) {
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN;
}
