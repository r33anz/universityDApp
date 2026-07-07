import { io } from "socket.io-client";
import apiClient from "../../../shared/lib/apiClient";

const webSocketServer = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

const socket = io(webSocketServer, {
  transports: ["websocket", "polling"],
  autoConnect: false
});

const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

const listenForNotifications = (callback) => {
  connectSocket();

  const notificationListener = (notification) => {
    callback(notification);
  };

  socket.on("newNotification", notificationListener);

  return () => {
    socket.off("newNotification", notificationListener);
  };
};

const recoverAllNotifications = async ({ page = 1, pageSize = 10, statusFilter = null }) => {
  const response = await apiClient.get("/api/allNotifications", {
    params: {
      page,
      limit: pageSize,
      status: statusFilter !== 'ALL' ? statusFilter : undefined
    }
  });
  return {
    notifications: response.data.data || [],
    total: response.data.total || 0,
    page: response.data.page || 1,
    pageSize: response.data.pageSize || 10,
    totalPages: response.data.totalPages || 1
  };
};

const attendNotifications = async (notificationIds) => {
  const response = await apiClient.post("/api/attend-multiple", {
    notificationIds
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export {
  listenForNotifications,
  recoverAllNotifications,
  attendNotifications,
  disconnectSocket
};
