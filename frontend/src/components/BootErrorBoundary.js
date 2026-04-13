import React from "react";

class BootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: "",
      errorStack: "",
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || "Erro desconhecido ao iniciar a aplicacao.",
    };
  }

  componentDidCatch(error, info) {
    this.setState({
      errorStack: info?.componentStack || "",
    });
    try {
      console.error("BootErrorBoundary", error, info);
    } catch (_) {}
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "24px",
          background: "#111827",
          color: "#f9fafb",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1 style={{ marginTop: 0 }}>Erro ao iniciar o frontend</h1>
        <p style={{ fontSize: "16px", lineHeight: 1.5 }}>
          O ambiente carregou, mas o React falhou durante a renderizacao.
        </p>
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            background: "#1f2937",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #374151",
          }}
        >
          {this.state.errorMessage}
        </pre>
        {this.state.errorStack ? (
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#1f2937",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #374151",
              marginTop: "16px",
            }}
          >
            {this.state.errorStack}
          </pre>
        ) : null}
      </div>
    );
  }
}

export default BootErrorBoundary;
