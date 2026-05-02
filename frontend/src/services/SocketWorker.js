import io from "socket.io-client";
import api from "../services/api";
import { getBackendUrl } from "../config";


class SocketWorker {
  constructor(companyId , userId) {
    const sessionToken =
      api.defaults.headers.Authorization ||
      (() => {
        try {
          const token = JSON.parse(localStorage.getItem("token"));
          return token ? `Bearer ${token}` : "";
        } catch (error) {
          return "";
        }
      })();

    if (!companyId || !userId || !sessionToken) {
      return SocketWorker.instance || null;
    }

    const shouldRecreateInstance =
      !SocketWorker.instance ||
      SocketWorker.instance.companyId !== companyId ||
      SocketWorker.instance.userId !== userId ||
      SocketWorker.instance.token !== sessionToken;

    if (shouldRecreateInstance) {
      if (SocketWorker.instance?.socket) {
        SocketWorker.instance.socket.disconnect();
      }

      this.companyId = companyId;
      this.userId = userId;
      this.token = sessionToken;
      this.socket = null;
      this.eventListeners = {};
      this.configureSocket();
      SocketWorker.instance = this;
    }

    return SocketWorker.instance;
  }

  configureSocket() {
    const backendUrl = getBackendUrl();
    const socketBaseUrl = (() => {
      try {
        return new URL(backendUrl, window.location.origin).origin;
      } catch (error) {
        return backendUrl.replace(/\/+$/, "");
      }
    })();

    this.socket = io(`${socketBaseUrl}/${this?.companyId}` , {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: ["websocket", "polling"],
      path: "/socket.io",
      query: { userId: this.userId, token: this.token }
    });

    this.socket.on("connect", () => {
      console.log("Conectado ao servidor Socket.IO");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Desconectado do servidor Socket.IO", reason);
      this.reconnectAfterDelay();
    });

    this.socket.on("connect_error", (error) => {
      console.error("Erro de conexão do Socket.IO", error?.message || error);
    });
  }

  // Adiciona um ouvinte de eventos
  on(event, callback) {

    this.connect();
    if (!this.socket) {
      return;
    }
    this.socket.on(event, callback);

    // Armazena o ouvinte no objeto de ouvintes
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  // Emite um evento
  emit(event, data) {
    this.connect();
    if (!this.socket) {
      return;
    }
    this.socket.emit(event, data);
  }

  // Desconecta um ou mais ouvintes de eventos
  off(event, callback) {
    // console.log(event, callback)
    this.connect();
    if (!this.socket) {
      return;
    }
    if (this.eventListeners[event]) {
      // console.log("Desconectando do servidor Socket.IO:", event, callback);
      if (callback) {
        // Desconecta um ouvinte específico
        this.socket.off(event, callback);
        this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
      } else {
        // console.log("DELETOU EVENTOS DO SOCKET:", this.eventListeners[event]);

        // Desconecta todos os ouvintes do evento
        this.eventListeners[event].forEach(cb => this.socket.off(event, cb));
        delete this.eventListeners[event];
      }
      // console.log("EVENTOS DO SOCKET:", this.eventListeners);
    }
  }

  disconnect() {
    if (this.socket) {
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
    if (!this.socket) {
      this.configureSocket();
      return;
    }

    if (!this.socket.connected && !this.socket.active) {
      this.socket.connect();
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
