import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Global error handler to prevent generic "Script error" messages
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error:', { message, source, lineno, colno, error });
  // Return true to prevent the default browser error handling
  return true;
};

// Handle unhandled promise rejections
window.onunhandledrejection = function(event) {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
