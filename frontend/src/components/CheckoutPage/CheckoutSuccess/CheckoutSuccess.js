import React, { useState, useEffect, useContext, useMemo } from "react";
import { useHistory } from "react-router-dom";
import QRCode from "react-qr-code";
import { SuccessContent, Total } from "./style";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { FaCopy, FaCheckCircle } from "react-icons/fa";
import { useDate } from "../../../hooks/useDate";
import { toast } from "react-toastify";
import { AuthContext } from "../../../context/Auth/AuthContext";
import { SocketContext } from "../../../context/Socket/SocketContext";

function CheckoutSuccess(props) {
  const { pix } = props;
  const socketManager = useContext(SocketContext);
  const [pixString] = useState(pix?.qrcode?.qrcode || "");
  const [stripeURL] = useState(pix.stripeURL);
  const [asaasURL] = useState(pix.asaasURL);
  const [mercadopagoURL] = useState(pix.mercadopagoURL);
  const [valorext] = useState(pix.valorext);
  const [copied, setCopied] = useState(false);
  const [hasOpenedAsaas, setHasOpenedAsaas] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const history = useHistory();

  const { dateToClient } = useDate();
  const { user, socket } = useContext(AuthContext);

  const companyId = user.companyId;
  const asaasSessionKey = useMemo(
    () => (asaasURL ? `asaas-checkout-opened:${asaasURL}` : null),
    [asaasURL]
  );

  useEffect(() => {
    const onCompanyPayment = (data) => {
      if (data.action === "CONCLUIDA") {
        toast.success(
          `Sua licenca foi renovada ate ${dateToClient(data.company.dueDate)}!`
        );
        setTimeout(() => {
          history.push("/");
        }, 4000);
      }
    };

    socket.on(`company-${companyId}-payment`, onCompanyPayment);

    return () => {
      socket.disconnect();
    };
  }, [companyId, dateToClient, history, socket, socketManager]);

  useEffect(() => {
    if (!asaasURL || !asaasSessionKey) {
      return;
    }

    const alreadyOpened = window.sessionStorage.getItem(asaasSessionKey);
    if (alreadyOpened) {
      setHasOpenedAsaas(true);
      return;
    }

    const openedWindow = window.open(asaasURL, "_blank", "noopener,noreferrer");
    if (openedWindow) {
      window.sessionStorage.setItem(asaasSessionKey, "true");
      setHasOpenedAsaas(true);
      setPopupBlocked(false);
      return;
    }

    setPopupBlocked(true);
  }, [asaasSessionKey, asaasURL]);

  const handleCopyQR = () => {
    setTimeout(() => {
      setCopied(false);
    }, 1000);
    setCopied(true);
  };

  const handleOpenAsaas = () => {
    const openedWindow = window.open(asaasURL, "_blank", "noopener,noreferrer");

    if (openedWindow) {
      if (asaasSessionKey) {
        window.sessionStorage.setItem(asaasSessionKey, "true");
      }
      setHasOpenedAsaas(true);
      setPopupBlocked(false);
      return;
    }

    setPopupBlocked(true);
  };

  return (
    <React.Fragment>
      <Total>
        <p>
          <span>TOTAL</span>
        </p>
        <strong>
          R${" "}
          {valorext.toLocaleString("pt-br", { minimumFractionDigits: 2 })}
        </strong>
      </Total>

      <SuccessContent>
        {pixString && (
          <>
            <QRCode value={pixString} />
            <CopyToClipboard text={pixString} onCopy={handleCopyQR}>
              <button className="copy-button" type="button">
                {copied ? (
                  <>
                    <span>Copiado</span>
                    <FaCheckCircle size={18} />
                  </>
                ) : (
                  <>
                    <span>Copiar codigo QR PIX</span>
                    <FaCopy size={18} />
                  </>
                )}
              </button>
            </CopyToClipboard>
            <span>
              Para finalizar, basta realizar o pagamento escaneando ou colando
              o codigo Pix acima ou escolher o pagamento por cartao logo abaixo.
            </span>
            <span>
              <p> </p>
            </span>
          </>
        )}

        {stripeURL && (
          <>
            <button
              onClick={() => window.open(stripeURL, "_blank")}
              type="button"
              style={{
                color: "#3c6afb",
                background: "#ffffff",
                border: "1px solid #3c6afb",
                padding: "6px 16px",
                fontSize: "18px",
                minWidth: "50%",
                boxSizing: "border-box",
                transition:
                  "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: "500",
                lineHeight: "1.75",
                borderRadius: "4px",
                letterSpacing: "0.02857em",
                textTransform: "uppercase",
              }}
            >
              Pagar com cartao de credito
            </button>
            <span>
              <p> </p>
            </span>
          </>
        )}

        {mercadopagoURL && (
          <>
            <button
              onClick={() => window.open(mercadopagoURL, "_blank")}
              type="button"
              style={{
                color: "#3c6afb",
                background: "#ffffff",
                border: "1px solid #3c6afb",
                padding: "6px 16px",
                fontSize: "18px",
                minWidth: "50%",
                boxSizing: "border-box",
                transition:
                  "background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: "500",
                lineHeight: "1.75",
                borderRadius: "4px",
                letterSpacing: "0.02857em",
                textTransform: "uppercase",
              }}
            >
              Pagar com MercadoPago
            </button>
            <span>
              <p> </p>
            </span>
          </>
        )}

        {asaasURL && (
          <>
            <div className="embedded-checkout-shell">
              <div className="embedded-checkout-card">
                <div className="embedded-checkout-icon">
                  <FaCheckCircle size={28} />
                </div>
                <div className="embedded-checkout-copy">
                  <strong>Checkout seguro liberado</strong>
                  <span>
                    O pagamento acontece em uma nova aba segura do Asaas.
                    Mantemos o CRM limpo e sem tela quebrada quando o navegador
                    bloqueia paginas externas dentro do sistema.
                  </span>
                </div>
              </div>

              <div className="checkout-status-list">
                <div className="checkout-status-item">
                  <span className="status-dot" />
                  <p>1. Abra o checkout do Asaas.</p>
                </div>
                <div className="checkout-status-item">
                  <span className="status-dot" />
                  <p>2. Finalize o pagamento com seguranca.</p>
                </div>
                <div className="checkout-status-item">
                  <span className="status-dot" />
                  <p>3. Volte ao CRM e aguarde a confirmacao automatica.</p>
                </div>
              </div>
            </div>

            <span className="checkout-hint">
              {hasOpenedAsaas
                ? "O checkout ja foi aberto em uma nova aba segura. Se precisar, voce pode abrir novamente."
                : "Seu navegador pode bloquear a abertura automatica. Se isso acontecer, use o botao abaixo para continuar."}
            </span>

            <button
              onClick={handleOpenAsaas}
              type="button"
              className="checkout-action-button"
            >
              {hasOpenedAsaas
                ? "Abrir checkout novamente"
                : "Abrir checkout seguro"}
            </button>

            {popupBlocked && (
              <span className="checkout-hint">
                O navegador bloqueou a nova aba automaticamente. Clique no
                botao acima para continuar o pagamento.
              </span>
            )}
            <span>
              <p> </p>
            </span>
          </>
        )}
      </SuccessContent>
    </React.Fragment>
  );
}

export default CheckoutSuccess;
