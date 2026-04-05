import io from "socket.io-client";
import api from "../services/api";


class SocketWorker {
  constructor(companyId , userId) {
    const sessionToken = api.defaults.headers.Authorization
    const hasValidSocketContext = companyId !== undefined && companyId !== null && companyId !== "" &&
      userId !== undefined && userId !== null && userId !== "";

    if (!SocketWorker.instance) {
      this.companyId = companyId
      this.userId = userId
      this.token = sessionToken
      this.socket = null;
      this.eventListeners = {}; // Armazena os ouvintes de eventos registrados
      if (hasValidSocketContext) {
        this.configureSocket();
      }
      SocketWorker.instance = this;
    } else {
      if (!hasValidSocketContext) {
        return SocketWorker.instance;
      }

      const shouldReconfigure =
        SocketWorker.instance.companyId !== companyId ||
        SocketWorker.instance.userId !== userId ||
        SocketWorker.instance.token !== sessionToken;

      if (shouldReconfigure) {
        SocketWorker.instance.companyId = companyId;
        SocketWorker.instance.userId = userId;
        SocketWorker.instance.token = sessionToken;
        SocketWorker.instance.reconfigureSocket();
      }
    }

    return SocketWorker.instance;
  }

  reconfigureSocket() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.eventListeners = {};

    if (!this.hasValidConnectionConfig()) {
      return;
    }

    this.configureSocket();
  }

  hasValidConnectionConfig() {
    return this.companyId !== undefined &&
      this.companyId !== null &&
      this.companyId !== "" &&
      this.userId !== undefined &&
      this.userId !== null &&
      this.userId !== "";
  }

  configureSocket() {
    if (!this.hasValidConnectionConfig()) {
      return;
    }

    this.socket = io(`${process.env.REACT_APP_BACKEND_URL}/${this?.companyId}` , {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      // transports: ["websocket", "polling", "flashsocket"],
      // pingTimeout: 18000,
      // pingInterval: 18000,
      query: { userId: this.userId, token: this.token }
    });

    this.socket.on("connect", () => {
      console.log("Conectado ao servidor Socket.IO");
    });

    this.socket.on("disconnect", () => {
      console.log("Desconectado do servidor Socket.IO");
      this.reconnectAfterDelay();
    });
  }

  // Adiciona um ouvinte de eventos
  on(event, callback) {

    this.connect();
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }

    const alreadyRegistered = this.eventListeners[event].includes(callback);
    if (alreadyRegistered) {
      return;
    }

    this.socket.on(event, callback);

    // Armazena o ouvinte no objeto de ouvintes
    this.eventListeners[event].push(callback);
  }

  // Emite um evento
  emit(event, data) {
    this.connect();
    this.socket.emit(event, data);
  }

  // Desconecta um ou mais ouvintes de eventos
  off(event, callback) {
    // console.log(event, callback)
    this.connect();

    if (callback) {
      this.socket.off(event, callback);
      if (this.eventListeners[event]) {
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
        if (this.eventListeners[event].length === 0) {
          delete this.eventListeners[event];
        }
      }
      return;
    }

    this.socket.off(event);
    if (this.eventListeners[event]) {
      delete this.eventListeners[event];
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null
      SocketWorker.instance = null
      console.log("Socket desconectado manualmente");
    }
  }

  reconnectAfterDelay() {
    setTimeout(() => {
      if (!this.socket || !this.socket.connected) {
        console.log("Tentando reconectar após desconexão");
        this.connect();
      }
    }, 1000);
  }

  // Garante que o socket esteja conectado
  connect() {
    if (!this.hasValidConnectionConfig()) {
      return;
    }

    if (!this.socket) {
      this.configureSocket();
      return;
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }
  }

  forceReconnect() {

  }
}

// const instance = (companyId, userId) => new SocketWorker(companyId,userId);
const instance = (companyId, userId) => new SocketWorker(companyId, userId);

export default instance;
