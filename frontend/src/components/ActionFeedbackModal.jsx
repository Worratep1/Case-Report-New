import React from 'react';
import { X, CheckCircle, AlertCircle, Trash2, Save, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActionFeedbackModal({ 
  isOpen, 
  type, 
  title, 
  message, 
  onClose, 
  onConfirm, 
  confirmText = 'ตกลง', 
  cancelText = 'ยกเลิก',
  showSecondaryButton = false,
  isLoading = false // เพิ่ม prop isLoading
}) {
  

  let IconComponent, iconColor, buttonColor;
  let isConfirmation = false;

  switch (type) {
    case 'success':
      IconComponent = CheckCircle;
      iconColor = 'text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      buttonColor = 'bg-blue-600 hover:bg-blue-700'; 
      break;
    
    case 'warning': 
    case 'error':
      IconComponent = AlertCircle; 
      iconColor = 'text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      buttonColor = 'bg-red-600 hover:bg-red-700';
      if (onConfirm) isConfirmation = true;
      break;

    case 'confirm-delete':
      IconComponent = Trash2;
      iconColor = 'text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      buttonColor = 'bg-red-600 hover:bg-red-700';
      isConfirmation = true;
      break;

    case 'confirm':
    case 'confirm-save':
    default:
      IconComponent = Save;
      iconColor = 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      buttonColor = 'bg-blue-600 hover:bg-blue-700';
      isConfirmation = true;
      break;

      
  }

  const showTwoButtons = isConfirmation || showSecondaryButton;

 
const handleConfirm = () => {
  if (onConfirm) {
    onConfirm(); 
  } else {
    onClose();  
  }
};

  // -----------------------------------------------------
  //  Animation Config (คงไว้เหมือนเดิม)
  // -----------------------------------------------------
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 500, 
        damping: 25     
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      transition: { duration: 0.2 } 
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
        >
          {/* ตัว Modal */}
          <motion.div 
            className="rounded-xl shadow-2xl w-full max-w-sm overflow-hidden 
              bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700" 
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()} 
          >
            
            <div className="p-4 flex justify-end">
              <button onClick={onClose} className="transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>

            <div className="text-center px-6 pb-6">
              <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconColor}`}>
                <IconComponent size={24} />
              </div>
              
              <h3 className="font-bold text-xl mb-2 text-slate-800 dark:text-white">{title}</h3> 
              <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">{message}</p> 

              <div className="flex gap-3">
                {showTwoButtons && (
                  <button 
                    type="button"
                    onClick={onClose} 
                    className="flex-1 py-2.5 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2
                      border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700" 
                  >
                    {cancelText}
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={showTwoButtons ? handleConfirm : onClose}
                  disabled={isLoading} 
                  className={`flex-1 py-2.5 text-white rounded-lg font-medium shadow-md transition-colors text-sm flex items-center justify-center gap-2 ${buttonColor} ${showTwoButtons ? '' : 'w-full'} disabled:opacity-50`}
                >
                   {isLoading ? <Loader2 size={16} className="animate-spin" /> : confirmText}
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}