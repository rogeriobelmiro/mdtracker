import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface DialogOptions {
  title?: string;
  message: string;
  type?: 'alert' | 'confirm' | 'success';
}

interface DialogContextProps {
  alert: (message: string, title?: string) => Promise<void>;
  success: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextProps | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [resolvePromise, setResolvePromise] = useState<((val: boolean) => void) | null>(null);

  const showAlert = (message: string, title?: string, type: 'alert' | 'success' = 'alert'): Promise<void> => {
    return new Promise((resolve) => {
      setOptions({ title, message, type });
      setIsOpen(true);
      setResolvePromise(() => (val: boolean) => resolve());
    });
  };

  const alert = (message: string, title?: string) => showAlert(message, title, 'alert');
  const success = (message: string, title?: string) => showAlert(message, title, 'success');

  const confirm = (message: string, title?: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions({ title, message, type: 'confirm' });
      setIsOpen(true);
      setResolvePromise(() => resolve);
    });
  };

  const handleClose = (result: boolean) => {
    setIsOpen(false);
    if (resolvePromise) {
      resolvePromise(result);
      setResolvePromise(null);
    }
  };

  return (
    <DialogContext.Provider value={{ alert, success, confirm }}>
      {children}
      
      {isOpen && options && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full flex-shrink-0 ${
                  options.type === 'confirm' ? 'bg-amber-100 text-amber-600' :
                  options.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {options.type === 'confirm' ? <AlertCircle className="w-6 h-6" /> :
                   options.type === 'success' ? <CheckCircle className="w-6 h-6" /> :
                   <Info className="w-6 h-6" />}
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  {options.title && (
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{options.title}</h3>
                  )}
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{options.message}</p>
                </div>

                <button 
                  onClick={() => handleClose(false)}
                  className="text-slate-400 hover:text-slate-600 transition -mt-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-slate-100">
              {options.type === 'confirm' && (
                <button
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200 bg-slate-100 rounded transition"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => handleClose(true)}
                className={`px-4 py-2 text-sm font-semibold text-white rounded transition shadow-sm ${
                  options.type === 'confirm' ? 'bg-amber-600 hover:bg-amber-700' :
                  options.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {options.type === 'confirm' ? 'Confirmar' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
};
