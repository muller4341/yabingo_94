import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import { store, persistor } from "./redux/store.js"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"
import "./index.css"
import ThemeProvider from "./components/ThemeProvider.jsx"

// Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope)
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error)
      })
  })
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </PersistGate>,
)
