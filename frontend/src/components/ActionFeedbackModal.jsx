import React from 'react';
import { X, CheckCircle, AlertCircle, Trash2, Save } from 'lucide-react';

export default function ActionFeedbackModal({ isOpen, type, title, message, onClose, onConfirm }) {
  if (!isOpen) return null;

  // 1. กำหนด Icon และสีตาม Type
  let IconComponent, iconColor, buttonColor;
  let confirmButtonText = 'ตกลง';
  let isConfirmation = false;

  switch (type) {
    case 'success': // บันทึก/แก้ไข/ลบ สำเร็จ
      IconComponent = CheckCircle;
      iconColor = 'text-green-500 bg-green-100';
      buttonColor = 'bg-green-600 hover:bg-green-700';
      break;
    case 'error': // ผิดพลาด/กรอกข้อมูลไม่ครบ
      IconComponent = AlertCircle;
      iconColor = 'text-red-500 bg-red-100';
      buttonColor = 'bg-red-600 hover:bg-red-700';
      break;
    case 'confirm-delete': // ยืนยันการลบ
      IconComponent = Trash2;
      iconColor = 'text-red-500 bg-red-100';
      buttonColor = 'bg-red-600 hover:bg-red-700';
      confirmButtonText = 'ยืนยันการลบ';
      isConfirmation = true;
      break;
    case 'confirm-save': // ยืนยันการบันทึก (ถ้าต้องการให้มีขั้นตอนยืนยันก่อน)
    default:
      IconComponent = Save;
      iconColor = 'text-blue-500 bg-blue-100';
      buttonColor = 'bg-blue-600 hover:bg-blue-700';
      isConfirmation = true;
      confirmButtonText = 'ตกลง';
  }

  // Handler สำหรับปุ่ม "ยืนยัน"
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(); // เรียกฟังก์ชันที่ถูกส่งเข้ามา (เช่น deleteMember)
    }
    onClose(); // ปิด Modal
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div className="p-4 flex justify-end">
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="text-center px-6 pb-6">
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-4 ${iconColor}`}>
            <IconComponent size={24} />
          </div>
          
          <h3 className="font-bold text-xl text-slate-800 mb-2">
            {title}
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            {message}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            {/* แสดงปุ่มยกเลิกเฉพาะกรณีที่เป็น Confirmation */}
            {isConfirmation && (
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors text-sm"
              >
                ยกเลิก
              </button>
            )}
            {/* ปุ่มหลัก (ตกลง/ยืนยันการลบ) */}
            <button 
              type="button"
              onClick={isConfirmation ? handleConfirm : onClose}
              className={`flex-1 py-2.5 text-white rounded-lg font-medium shadow-md transition-colors text-sm flex items-center justify-center gap-2 ${buttonColor} ${isConfirmation ? '' : 'w-full'}`}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}