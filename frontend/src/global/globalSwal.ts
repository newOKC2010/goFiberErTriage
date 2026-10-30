import Swal from 'sweetalert2';

// Custom class สำหรับฟอนต์ bold ทั้งหมด
const boldCustomClass = {
  popup: '!font-bold',
  title: '!font-bold',
  htmlContainer: '!font-bold',
  content: '!font-bold',
  confirmButton: '!font-bold',
  cancelButton: '!font-bold',
  actions: '!font-bold',
  container: '!font-bold'
};

export const showToast = (title: string, type: 'success' | 'error' | 'info' = 'error') => {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });

    Toast.fire({
      icon: type,
      title,
      customClass: boldCustomClass,
      didOpen: () => {
        const popup = Swal.getPopup();
        if (popup) {
          popup.style.fontWeight = 'bold';
          const title = popup.querySelector('.swal2-title');
          if (title) (title as HTMLElement).style.fontWeight = 'bold';
        }
      }
    });
  };

export function showAlert(
  title: string, 
  text: string, 
  icon: 'info' | 'success' | 'warning' | 'error' = 'info', 
  options: Partial<{
    allowOutsideClick: boolean;
    allowEscapeKey: boolean;
    allowEnterKey: boolean;
    timer?: number;
    timerProgressBar?: boolean;
  }> = {}, 
  buttonColors?: { confirm?: string; cancel?: string },
  lang: 'th' | 'en' = 'th'
) {
    const defaultOptions = {
        allowOutsideClick: true,
        allowEscapeKey: true,
        allowEnterKey: true
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonText: lang === 'th' ? 'ตกลง' : 'OK',
        confirmButtonColor: buttonColors?.confirm || '#667eea',
        cancelButtonColor: buttonColors?.cancel,
        allowOutsideClick: finalOptions.allowOutsideClick,
        allowEscapeKey: finalOptions.allowEscapeKey,
        allowEnterKey: finalOptions.allowEnterKey,
        timer: finalOptions.timer,
        timerProgressBar: finalOptions.timerProgressBar,
        customClass: boldCustomClass,
        didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) {
                popup.style.fontWeight = 'bold';
                const title = popup.querySelector('.swal2-title');
                const content = popup.querySelector('.swal2-html-container');
                const confirmBtn = popup.querySelector('.swal2-confirm');
                const cancelBtn = popup.querySelector('.swal2-cancel');
                
                if (title) (title as HTMLElement).style.fontWeight = 'bold';
                if (content) (content as HTMLElement).style.fontWeight = 'bold';
                if (confirmBtn) (confirmBtn as HTMLElement).style.fontWeight = 'bold';
                if (cancelBtn) (cancelBtn as HTMLElement).style.fontWeight = 'bold';
                
                // กำหนดสีปุ่มตามที่กำหนด
                if (buttonColors?.confirm && confirmBtn) {
                    (confirmBtn as HTMLElement).style.backgroundColor = buttonColors.confirm;
                }
                if (buttonColors?.cancel && cancelBtn) {
                    (cancelBtn as HTMLElement).style.backgroundColor = buttonColors.cancel;
                }
                
                // เพิ่ม hover effects ให้ปุ่ม
                const buttons = popup.querySelectorAll('.swal2-confirm, .swal2-cancel');
                buttons.forEach(button => {
                    const btn = button as HTMLElement;  
                    btn.style.borderRadius = '10px'; // เพิ่มความโค้งของปุ่ม
                    btn.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
                    btn.addEventListener('mouseenter', () => {
                        btn.style.transform = 'scale(1.05)';
                        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    });
                    btn.addEventListener('mouseleave', () => {
                        btn.style.transform = 'scale(1)';
                        btn.style.boxShadow = 'none';
                    });
                });
            }
        }
    });
}

export async function showConfirm(
  text: string, 
  customClass: Record<string, string> = {}, 
  buttonColors?: { confirm?: string; cancel?: string },
  buttonTexts?: { confirm?: string; cancel?: string }
) {
    const result = await Swal.fire({
        text: text,
        showCancelButton: true,
        confirmButtonText: buttonTexts?.confirm || 'ออกจากระบบ',
        cancelButtonText: buttonTexts?.cancel || 'ยกเลิก',
        confirmButtonColor: buttonColors?.confirm,
        cancelButtonColor: buttonColors?.cancel,
        customClass: { ...boldCustomClass, ...customClass },
        didOpen: () => {
            const popup = Swal.getPopup();
            if (popup) {
                popup.style.fontWeight = 'bold';
                const content = popup.querySelector('.swal2-html-container');
                const confirmBtn = popup.querySelector('.swal2-confirm');
                const cancelBtn = popup.querySelector('.swal2-cancel');
                
                if (content) (content as HTMLElement).style.fontWeight = 'bold';
                if (confirmBtn) (confirmBtn as HTMLElement).style.fontWeight = 'bold';
                if (cancelBtn) (cancelBtn as HTMLElement).style.fontWeight = 'bold';
                
                // กำหนดสีปุ่มตามที่กำหนด
                if (buttonColors?.confirm && confirmBtn) {
                    (confirmBtn as HTMLElement).style.backgroundColor = buttonColors.confirm;
                }
                if (buttonColors?.cancel && cancelBtn) {
                    (cancelBtn as HTMLElement).style.backgroundColor = buttonColors.cancel;
                }
                
                // เพิ่ม hover effects ให้ปุ่ม
                const buttons = popup.querySelectorAll('.swal2-confirm, .swal2-cancel');
                buttons.forEach(button => {
                    const btn = button as HTMLElement;
                    btn.style.borderRadius = '10px'; // เพิ่มความโค้งของปุ่ม
                    btn.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';
                    btn.addEventListener('mouseenter', () => {
                        btn.style.transform = 'scale(1.05)';
                        btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    });
                    btn.addEventListener('mouseleave', () => {
                        btn.style.transform = 'scale(1)';
                        btn.style.boxShadow = 'none';
                    });
                });
            }
        }
    });

    return result.isConfirmed;
}

/**
 * แสดง loading dialog
 * @param {string} text - ข้อความ loading
 */
export function showLoading(text: string = 'กำลังโหลดข้อมูล...') {
    Swal.fire({
        text: text,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        customClass: {
            ...boldCustomClass,
            htmlContainer: 'font-bold text-lg'
        },
        didOpen: () => {
            Swal.showLoading();
            const popup = Swal.getPopup();
            if (popup) {
                popup.style.fontWeight = 'bold';
                const content = popup.querySelector('.swal2-html-container');
                const loader = popup.querySelector('.swal2-loader');
                
                if (content) (content as HTMLElement).style.fontWeight = 'bold';
                if (loader) {
                    (loader as HTMLElement).style.fontWeight = 'bold';
                    // แก้ไข loading text ด้วย
                    const loaderText = popup.querySelector('.swal2-loading');
                    if (loaderText) (loaderText as HTMLElement).style.fontWeight = 'bold';
                }
            }
        }
    });
}

