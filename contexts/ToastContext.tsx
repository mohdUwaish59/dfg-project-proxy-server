'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastConfig = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-success-50 border-success-200',
    iconColor: 'text-success-600',
    titleColor: 'text-success-800',
    descColor: 'text-success-700'
  },
  error: {
    icon: XCircle,
    bgColor: 'bg-error-50 border-error-200',
    iconColor: 'text-error-600',
    titleColor: 'text-error-800',
    descColor: 'text-error-700'
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-warning-50 border-warning-200',
    iconColor: 'text-warning-600',
    titleColor: 'text-warning-800',
    descColor: 'text-warning-700'
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50 border-blue-200',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-800',
    descColor: 'text-blue-700'
  }
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, title: string, description?: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, description };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map((toast) => {
            const config = toastConfig[toast.type];
            const Icon = config.icon;
            
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 300, scale: 0.3 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 300, scale: 0.5, transition: { duration: 0.2 } }}
                className={`${config.bgColor} border rounded-lg p-4 shadow-lg max-w-sm min-w-[300px] backdrop-blur-sm`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${config.titleColor}`}>
                      {toast.title}
                    </p>
                    {toast.description && (
                      <p className={`text-sm mt-1 ${config.descColor}`}>
                        {toast.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeToast(toast.id)}
                    className={`${config.iconColor} hover:opacity-70 transition-opacity flex-shrink-0`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};