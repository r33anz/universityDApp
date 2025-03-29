import { io } from "socket.io-client";
import axios from "axios";

const apiUrl = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;
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
    console.log("Received Notification:", notification);
    callback(notification);
  };
  
  socket.on("newNotification", notificationListener);
  
  
  return () => {
    socket.off("newNotification", notificationListener);
  };
};

const recoverAllNotifications = async ({ page = 1, pageSize = 10, statusFilter = null }) => {
  try {
    const response = await axios.get(`${apiUrl}/api/allNotifications`, {
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
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export { 
  socket, 
  listenForNotifications, 
  recoverAllNotifications,
  connectSocket,
  disconnectSocket
};