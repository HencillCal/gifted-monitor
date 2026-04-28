import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] center">
          <motion.div onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/50 z-40 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 80 }} className="rounded-xl shadow-md bg-background w-[90%] max-w-[480px] mx-auto p-4 z-50 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold font-outfit">{title}</h2>
              <button onClick={onClose} className="bg-foreground btn h-9 w-9 rounded-full"><X size={18} /></button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
