// =============================================
// وظائف المساعدة والأدوات
// =============================================

class Utils {
  // توليد معرف فريد
  static generateId(prefix = '') {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${prefix}${timestamp}${random}`.toUpperCase();
  }
  
  // توليد معرف مستخدم فريد
  static generateUserId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
  
  // توليد معرف منشور فريد
  static generatePostId() {
    return this.generateId('P');
  }
  
  // توليد معرف تعليق فريد
  static generateCommentId() {
    return this.generateId('C');
  }
  
  // توليد معرف إيداع فريد
  static generateDepositId() {
    return this.generateId('DEP');
  }
  
  // تنسيق التاريخ
  static formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      if (minutes < 1) return 'الآن';
      if (minutes < 60) return `منذ ${minutes} دقيقة`;
      if (hours < 24) return `منذ ${hours} ساعة`;
      if (days < 7) return `منذ ${days} يوم`;
      
      return date.toLocaleDateString('ar-SA');
    } catch (error) {
      return 'غير محدد';
    }
  }
  
  // عرض رسالة للمستخدم
  static showMessage(elementId, text, type = 'success') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    element.textContent = text;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        element.style.display = 'none';
      }, 4000);
    }
  }
  
  // التحقق من صحة البريد الإلكتروني
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  // التحقق من قوة كلمة المرور
  static isStrongPassword(password) {
    return password.length >= 6;
  }
  
  // نسخ النص إلى الحافظة
  static async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // طريقة بديلة
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    }
  }
  
  // تنسيق الأرقام
  static formatNumber(number) {
    return new Intl.NumberFormat('ar-SA').format(number);
  }
  
  // إظهار تحميل
  static showLoading(button) {
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<span class="loading"></span> جاري المعالجة...';
    return originalText;
  }
  
  // إخفاء تحميل
  static hideLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
  }
  
  // التحقق من اتصال الإنترنت
  static checkOnlineStatus() {
    return navigator.onLine;
  }
  
  // إضافة تأخير
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  // تنظيف النص من الأحرف الخطرة
  static sanitizeText(text) {
    if (!text) return '';
    return text.replace(/[<>&"']/g, '');
  }
  
  // تقليم النص إذا كان طويلاً
  static truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }
}