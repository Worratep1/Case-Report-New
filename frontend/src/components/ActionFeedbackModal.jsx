import React from 'react';
import { X, CheckCircle, AlertCircle, Trash2, Save, AlertTriangle } from 'lucide-react';
// ✅ Import Framer Motion
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
  showSecondaryButton = false
}) {
  

  let IconComponent, iconColor, buttonColor;
  let isConfirmation = false;

  switch (type) {
    case 'success':
      IconComponent = CheckCircle;
      iconColor = 'text-green-500 bg-green-100';
      buttonColor = 'bg-slate-900 hover:bg-slate-800'; 
      break;
    
    case 'warning': 
    case 'error':
      IconComponent = AlertCircle; 
      iconColor = 'text-red-500 bg-red-100';
      buttonColor = 'bg-red-600 hover:bg-red-700';
      break;

    case 'confirm-delete':
      IconComponent = Trash2;
      iconColor = 'text-red-500 bg-red-100';
      buttonColor = 'bg-red-600 hover:bg-red-700';
      isConfirmation = true;
      break;

    case 'confirm':
    case 'confirm-save':
    default:
      IconComponent = Save;
      iconColor = 'text-blue-500 bg-blue-100';
      buttonColor = 'bg-blue-600 hover:bg-blue-700';
      isConfirmation = true;
  }

  const showTwoButtons = isConfirmation || showSecondaryButton;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    if (!onConfirm) onClose(); 
  };

  // -----------------------------------------------------
  //  Animation Config (ปรับความเด้งได้ที่นี่)
  // -----------------------------------------------------
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.5, 
      y: 20 // เริ่มต้นอยู่ต่ำลงมานิดนึง
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        type: "spring", // ใช้ระบบสปริง
        stiffness: 500, // ความแข็งของสปริง (ยิ่งเยอะยิ่งเด้งเร็ว)
        damping: 25     // แรงต้าน (ยิ่งน้อยยิ่งเด้งดึ๋งๆ นาน)
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9, 
      transition: { duration: 0.2 } 
    }
  };
  
  return (
    // ✅ AnimatePresence จะช่วยเล่น Animation ตอนปิด (Unmount) ให้
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
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            variants={modalVariants}
            // ป้องกันการคลิกที่ Modal แล้วทะลุไปปิด Backdrop
            onClick={(e) => e.stopPropagation()} 
          >
            
            <div className="p-4 flex justify-end">
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="text-center px-6 pb-6">
              <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconColor}`}>
                <IconComponent size={24} />
              </div>
              
              <h3 className="font-bold text-xl text-slate-800 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 mb-6">{message}</p>

              <div className="flex gap-3">
                {showTwoButtons && (
                  <button 
                    type="button"
                    onClick={onClose} 
                    className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    {cancelText}
                  </button>
                )}
                
                <button 
                  type="button"
                  onClick={showTwoButtons ? handleConfirm : onClose}
                  className={`flex-1 py-2.5 text-white rounded-lg font-medium shadow-md transition-colors text-sm flex items-center justify-center gap-2 ${buttonColor} ${showTwoButtons ? '' : 'w-full'}`}
                >
                  {confirmText}
                </button>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}