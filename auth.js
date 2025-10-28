// =============================================
// وظائف المصادقة وإدارة المستخدمين
// =============================================

class AuthManager {
  constructor(supabase) {
    this.supabase = supabase;
    this.currentUser = null;
  }
  
  // تسجيل مستخدم جديد
  async registerUser(userData) {
    try {
      console.log('جاري تسجيل مستخدم جديد:', userData);
      
      const { data, error } = await this.supabase
        .from('users')
        .insert([userData])
        .select();
      
      if (error) {
        console.error('خطأ في التسجيل:', error);
        throw error;
      }
      
      console.log('تم التسجيل بنجاح:', data);
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('خطأ في تسجيل المستخدم:', error);
      return { success: false, error: error.message };
    }
  }
  
  // تسجيل الدخول
  async loginUser(email, password) {
    try {
      console.log('جاري تسجيل الدخول:', email);
      
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();
      
      if (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        throw error;
      }
      
      this.currentUser = data;
      localStorage.setItem('zawajni_current_user', JSON.stringify(data));
      console.log('تم تسجيل الدخول بنجاح:', data);
      
      return { success: true, data };
    } catch (error) {
      console.error('فشل تسجيل الدخول:', error);
      return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
    }
  }
  
  // تسجيل الخروج
  logoutUser() {
    console.log('جاري تسجيل الخروج');
    this.currentUser = null;
    localStorage.removeItem('zawajni_current_user');
    console.log('تم تسجيل الخروج بنجاح');
  }
  
  // الحصول على المستخدم الحالي
  getCurrentUser() {
    return this.currentUser;
  }
  
  // تحديث ملف المستخدم
  async updateUserProfile(userId, updates) {
    try {
      console.log('جاري تحديث ملف المستخدم:', userId, updates);
      
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('user_id', userId)
        .select();
      
      if (error) throw error;
      
      if (this.currentUser && this.currentUser.user_id === userId) {
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('zawajni_current_user', JSON.stringify(this.currentUser));
      }
      
      console.log('تم تحديث الملف بنجاح');
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('خطأ في تحديث الملف:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على مستخدم بواسطة المعرف
  async getUserById(userId) {
    try {
      console.log('جاري جلب بيانات المستخدم:', userId);
      
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      console.log('تم جلب بيانات المستخدم');
      return { success: true, data };
    } catch (error) {
      console.error('خطأ في جلب بيانات المستخدم:', error);
      return { success: false, error: error.message };
    }
  }
  
  // الحصول على جميع المستخدمين
  async getAllUsers() {
    try {
      console.log('جاري جلب جميع المستخدمين');
      
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });
      
      if (error) throw error;
      
      console.log('تم جلب المستخدمين:', data.length);
      return { success: true, data };
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      return { success: false, error: error.message };
    }
  }
  
  // التحقق من صحة الجلسة
  async validateSession() {
    const savedUser = localStorage.getItem('zawajni_current_user');
    if (!savedUser) return false;
    
    try {
      const user = JSON.parse(savedUser);
      const result = await this.getUserById(user.user_id);
      
      if (result.success) {
        this.currentUser = result.data;
        return true;
      }
      return false;
    } catch (error) {
      console.error('خطأ في التحقق من الجلسة:', error);
      return false;
    }
  }
  
  // تحديث نقاط المستخدم
  async updateUserPoints(userId, pointsChange) {
    try {
      const user = await this.getUserById(userId);
      if (!user.success) throw new Error('المستخدم غير موجود');
      
      const newPoints = (user.data.points || 0) + pointsChange;
      if (newPoints < 0) throw new Error('النقاط غير كافية');
      
      return await this.updateUserProfile(userId, { points: newPoints });
    } catch (error) {
      console.error('خطأ في تحديث النقاط:', error);
      return { success: false, error: error.message };
    }
  }
  
  // تحديث رصيد المستخدم
  async updateUserBalance(userId, balanceChange) {
    try {
      const user = await this.getUserById(userId);
      if (!user.success) throw new Error('المستخدم غير موجود');
      
      const newBalance = (user.data.balance || 0) + balanceChange;
      if (newBalance < 0) throw new Error('الرصيد غير كافي');
      
      return await this.updateUserProfile(userId, { balance: newBalance });
    } catch (error) {
      console.error('خطأ في تحديث الرصيد:', error);
      return { success: false, error: error.message };
    }
  }
}