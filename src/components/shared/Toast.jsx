import {
  useState,
  useCallback,
  useContext,
  createContext,
  useEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";

const ToastContext = createContext(null);

const TOAST_TYPES = {
  success: {
    Icon: CheckCircle2,
    borderColor: "border-l-green",
    bgColor: "bg-green-light",
    iconColor: "text-green",
    progressColor: "bg-green",
  },
  error: {
    Icon: XCircle,
    borderColor: "border-l-red",
    bgColor: "bg-red-light",
    iconColor: "text-red",
    progressColor: "bg-red",
  },
  warning: {
    Icon: AlertTriangle,
    borderColor: "border-l-amber",
    bgColor: "bg-amber-light",
    iconColor: "text-amber",
    progressColor: "bg-amber",
  },
  info: {
    Icon: Info,
    borderColor: "border-l-blue-90",
    bgColor: "bg-blue-10",
    iconColor: "text-blue-90",
    progressColor: "bg-blue-90",
  },
};

const MAX_TOASTS = 5;
const AUTO_DISMISS_MS = 4000;

function ToastItem({ toast, onRemove }) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const typeConfig = TOAST_TYPES[toast.type] ?? TOAST_TYPES.info;
  const { Icon, borderColor, bgColor, iconColor, progressColor } = typeConfig;

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  }, [toast.id, onRemove]);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + AUTO_DISMISS_MS;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, ((endTime - Date.now()) / AUTO_DISMISS_MS) * 100);
      setProgress(remaining);
      if (elapsed >= AUTO_DISMISS_MS) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);
    return () => clearInterval(interval);
  }, [handleClose]);

  return (
    <div
      role="alert"
      className={`
        relative overflow-hidden
        flex items-start gap-3
        bg-white rounded-xl shadow-xl
        border border-grey-20
        border-l-[3px] ${borderColor} ${bgColor}
        min-w-[280px] max-w-[380px]
        animate-slide-in
        transition-opacity duration-200 ${isExiting ? "opacity-0" : ""}
      `}
      data-toast-id={toast.id}
    >
      <Icon className={`shrink-0 w-5 h-5 mt-3 ml-3 ${iconColor}`} aria-hidden />
      <div className="flex-1 py-3 pr-2 min-w-0">
        {toast.title && (
          <p className="text-[13px] font-semibold text-grey-95">{toast.title}</p>
        )}
        {toast.description && (
          <p className="text-[12px] text-grey-60 mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 p-1.5 rounded-lg hover:bg-white/60 transition-colors text-grey-60 hover:text-grey-95 mt-0.5"
        aria-label="Close notification"
      >
        <X className="size-4" />
      </button>
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${progressColor} opacity-60 transition-all duration-50`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return createPortal(
    <div
      className="fixed bottom-4 right-4 flex flex-col gap-3 z-[9999]"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>,
    document.body
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(({ title, description, type }) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      title,
      description,
      type: type ?? "info",
    };
    setToasts((prev) => {
      const next = [...prev, newToast];
      if (next.length > MAX_TOASTS) {
        return next.slice(-MAX_TOASTS);
      }
      return next;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
