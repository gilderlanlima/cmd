import styled from 'styled-components';

export const Container = styled.div`
  footer {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    @media (max-width: 768px) {
      flex-direction: column;
      .checkout-buttons {
        display: flex;
        flex-direction: column-reverse;
        width: 100%;

        button {
          width: 100%;
          margin-top: 16px;
          margin-left: 0;
        }
      }
    }

    button {
      margin-left: 16px;
    }
  }
`;
export const Total = styled.div`
  display: flex;
  align-items: baseline;

  span {
    color: #333;
    font-weight: bold;
  }

  strong {
    color: #333;
    font-size: 28px;
    margin-left: 5px;
  }

  @media (max-width: 768px) {
    min-width: 100%;
    justify-content: space-between;
  }
`;

export const SuccessContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  > h2 {
    text-align: center;
  }

  > svg {
    margin-top: 16px;
  }

  > span {
    margin-top: 24px;
    text-align: center;
  }

  > p,
  strong {
    margin-top: 8px;
    font-size: 9px;
    color: #999;
  }

  .copy-button {
    font-size: 14px;
    cursor: pointer;
    text-align: center;
    user-select: none;
    min-height: 56px;
    display: inline-flex;
    -webkit-box-pack: center;
    justify-content: center;
    -webkit-box-align: center;
    align-items: center;
    background-color: #f9f9f9;
    color: #000;
    -webkit-appearance: none !important;
    outline: none;
    margin-top: 16px;
    width: 256px;
    font-weight: 600;
    text-transform: uppercase;
    border: none;

    > span {
      margin-right: 8px;
    }
  }

  .embedded-checkout-shell {
    width: 100%;
    margin-top: 20px;
    border: 1px solid #e3e8f3;
    border-radius: 18px;
    overflow: hidden;
    background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
    box-shadow: 0 20px 45px rgba(15, 23, 42, 0.08);
    padding: 24px;
  }

  .embedded-checkout-card {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    text-align: left;
    padding: 18px 18px 16px;
    border-radius: 16px;
    background: rgba(37, 99, 235, 0.05);
    border: 1px solid rgba(37, 99, 235, 0.12);
  }

  .embedded-checkout-icon {
    width: 52px;
    height: 52px;
    min-width: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    color: #1d4ed8;
    background: #ffffff;
    box-shadow: 0 8px 18px rgba(29, 78, 216, 0.12);
  }

  .embedded-checkout-copy {
    display: flex;
    flex-direction: column;
    gap: 8px;

    strong {
      margin: 0;
      color: #0f172a;
      font-size: 1.08rem;
      font-weight: 700;
    }

    span {
      margin: 0;
      color: #475569;
      font-size: 0.94rem;
      line-height: 1.6;
    }
  }

  .checkout-status-list {
    margin-top: 18px;
    display: grid;
    gap: 12px;
  }

  .checkout-status-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 14px;
    background: #ffffff;
    border: 1px solid #e2e8f0;

    p {
      margin: 0;
      color: #334155;
      font-size: 0.92rem;
      font-weight: 500;
      line-height: 1.45;
    }
  }

  .status-dot {
    width: 10px;
    height: 10px;
    min-width: 10px;
    border-radius: 999px;
    background: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
  }

  .checkout-action-button {
    color: #1d4ed8;
    background: #ffffff;
    border: 1px solid #93c5fd;
    padding: 10px 18px;
    font-size: 15px;
    min-width: 320px;
    box-sizing: border-box;
    transition: background-color 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, border 250ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 700;
    line-height: 1.4;
    border-radius: 12px;
    letter-spacing: 0.02em;
    cursor: pointer;
    margin-top: 12px;
  }

  .checkout-hint {
    margin-top: 14px;
    font-size: 0.9rem;
    line-height: 1.55;
    color: #64748b;
    max-width: 640px;
  }

  @media (max-width: 768px) {
    .embedded-checkout-shell {
      padding: 16px;
    }

    .embedded-checkout-card {
      flex-direction: column;
      align-items: stretch;
      text-align: center;
    }

    .embedded-checkout-icon {
      margin: 0 auto;
    }

    .checkout-action-button {
      width: 100%;
      min-width: 0;
    }
  }
`;

export const CheckoutWrapper = styled.div`
  width: 100%;
  margin: 0 auto 0;
  max-width: 1110px;
  display: flex;
  flex-direction: column;
  -webkit-box-align: center;
  align-items: center;
  padding: 50px 95px;
  background: #fff;
  @media (max-width: 768px) {
    padding: 16px 24px;
  }
`;
