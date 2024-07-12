let socket: WebSocket | null = null;
let onMessageCallback: (message: string) => void = () => {};

export const connectWebSocket = (
  url: string,
  onMessage: (message: string) => void
) => {
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log("Connected to WebSocket server");
  };

  socket.onmessage = async (event) => {
    if (typeof event.data === "string") {
      onMessage(event.data);
    } else if (event.data instanceof Blob) {
      const text = await event.data.text();
      onMessage(text);
    }
  };

  socket.onclose = () => {
    console.log("Disconnected from WebSocket server");
  };

  onMessageCallback = onMessage;
};

export const sendMessage = (message: string) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(message);
  } else {
    console.error("WebSocket is not connected");
  }
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }
};
