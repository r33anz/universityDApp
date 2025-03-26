import { io } from "socket.io-client";
import axios from "axios";

const apiUrl = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;
const webSocketServer = `${process.env.REACT_APP_API_PROTOCOL}://${process.env.REACT_APP_API_HOST}:${process.env.REACT_APP_API_PORT}`;

const socket = io(webSocketServer, {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Connected to WebSocket server:", socket.id);
});

socket.on("disconnect", () => {
  console.log("Disconnected from WebSocket server");
});

const listenForNotifications = (callback) => {
  socket.on("newNotification", (notification) => {
    console.log("Received Notification:", notification);
    callback(notification);
  });
};

const recoverAllNotifications = async () => {
  try {
      const response = await axios.get(`${apiUrl}/api/allNotifications`);
      //console.log(response)
      return response.data;
  } catch (error) {
      throw error;
  }   

}
export { socket, listenForNotifications,recoverAllNotifications};