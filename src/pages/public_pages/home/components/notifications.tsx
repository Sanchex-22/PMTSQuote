import type { FC } from "react";

interface NotificationProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  onClose: () => void;
}

const typeStyles = {
  success: { bg: "bg-green-100", border: "border-green-500", text: "text-green-800", icon: "✅" },
  error: { bg: "bg-red-100", border: "border-red-500", text: "text-red-800", icon: "❌" },
  warning: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-800", icon: "⚠️" },
  info: { bg: "bg-blue-100", border: "border-blue-500", text: "text-blue-800", icon: "ℹ️" },
};

const Notification: FC<NotificationProps> = ({ type, title, message, onClose }) => {
  const styles = typeStyles[type];

  return (
    <div className={`fixed top-5 right-5 z-50 w-full max-w-sm rounded-lg border-l-4 p-4 shadow-lg animate-fade-in-right ${styles.bg} ${styles.border} ${styles.text}`} role="alert">
      <div className="flex">
        <div className="py-1"><span className="mr-3 text-2xl">{styles.icon}</span></div>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm">{message}</p>
        </div>
        <button onClick={onClose} className="ml-auto pl-3 pr-1 text-xl font-bold" aria-label="Close">×</button>
      </div>
    </div>
  );
};

export default Notification;