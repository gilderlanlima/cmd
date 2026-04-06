import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  Suspense,
} from "react";
import api from "../../services/api";
import useWhatsApps from "../../hooks/useWhatsApps";
import { AuthContext } from "../Auth/AuthContext";

const WhatsAppsContext = createContext();

const WhatsAppsProvider = ({ children }) => {
  // Add fallback values to prevent destructuring errors
  const whatsAppData = useWhatsApps();
  const { loading = false, whatsApps = [] } = whatsAppData || {};
  const { user } = useContext(AuthContext);
  
  const [wavoipToken, setWavoipToken] = useState(null);
  const [WavoipPhoneWidget, setWavoipPhoneWidget] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [error, setError] = useState(null);

  const canLoadWavoipWidget = () => {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname;
    const isLocalhost =
      host === "localhost" || host === "127.0.0.1" || host === "::1";
    const isSecureOrigin = window.isSecureContext || isLocalhost;
    const hasMediaDevices =
      !!navigator?.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function";
    return isSecureOrigin && hasMediaDevices;
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/call/historical/user/whatsapp");

        // let wavoipToken  = "";
        // for(const d of data){
        //   if(d?.wavoip){
        //     wavoipToken = d.wavoip;
        //     break;
        //   }
        // }
        console.log('whavoip token', data)
        setWavoipToken(data?.whatsapp?.wavoip || null);
      } catch (err) {
        console.error("Erro fetchSession:", err);
        setWavoipToken(null);
      } finally {
        setLoadingSession(false);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (!wavoipToken) {
      setWavoipPhoneWidget(null);
      return;
    }

    if (!canLoadWavoipWidget()) {
      console.warn(
        "[Wavoip] Ambiente sem contexto seguro para mídia. Widget desabilitado."
      );
      setWavoipPhoneWidget(null);
      return;
    }

    let cancelled = false;
    import("../../components/WavoipCall")
      .then((module) => {
        if (!cancelled) {
          setWavoipPhoneWidget(() => module.default);
        }
      })
      .catch((importError) => {
        if (!cancelled) {
          console.error("[Wavoip] Erro ao carregar widget:", importError);
          setWavoipPhoneWidget(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [wavoipToken]);


  // Log error state for debugging
  if (error) {
    console.warn("WhatsAppsProvider error:", error);
  }

  return (
    <WhatsAppsContext.Provider value={{ whatsApps, loading, error }}>
      {children}
      {wavoipToken && WavoipPhoneWidget && (
        <Suspense fallback={null}>
          <WavoipPhoneWidget
            token={wavoipToken}
            position="bottom-right"
            name={user?.company?.name || "waVoip"}
            country="BR"
            autoConnect={true}
            onCallStarted={(data) => console.log("Chamada iniciada:", data)}
            onCallEnded={(data) => console.log("Chamada finalizada:", data)}
            onConnectionStatus={(status) => console.log("Status:", status)}
            onError={(widgetError) => console.error("Erro:", widgetError)}
          />
        </Suspense>
      )}
    </WhatsAppsContext.Provider>
  );
};

export { WhatsAppsContext, WhatsAppsProvider };
