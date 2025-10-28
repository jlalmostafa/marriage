// =============================================
// التطبيق الرئيسي
// =============================================

class AppManager {
    constructor() {
        this.supabase = null;
        this.authManager = null;
        this.postsManager = null;
        this.wheelManager = null;
        this.exchangeManager = null;
        this.donationManager = null;
        this.currentSection = 'homepage';
        
        this.init();
    }

    // تهيئة التطبيق
    async init() {
        console.log('تهيئة التطبيق...');
        
        try {
            // تهيئة Supabase
            this.supabase = window.supabase.createClient(
                SUPABASE_CONFIG.url, 
                SUPABASE_CONFIG.key
            );
            
            // تهيئة المدراء
            this.authManager = new AuthManager(this.supabase);
            this.postsManager = new PostsManager(this.supabase, this.authManager);
            this.wheelManager = new WheelManager(this.supabase, this.authManager);
            this.exchangeManager = new ExchangeManager(this.supabase, this.authManager);
            this.donationManager = new DonationManager(this.supabase, this.authManager);
            
            // اختبار الاتصال
            const connectionTest = await this.testConnection();
            if (!connectionTest) {
                this.showError('فشل الاتصال بقاعدة البيانات');
                return;
            }
            
            // إعداد مستمعي الأحداث
            this.setupEventListeners();
            
            // استعادة جلسة المستخدم
            await this.restoreUserSession();
            
            console.log('✅ تم تهيئة التطبيق بنجاح');
            
        } catch (error) {
            console.error('❌ خطأ في تهيئة التطبيق:', error);
            this.showError('حدث خطأ في تهيئة التطبيق');
        }
    }

    // اختبار الاتصال بقاعدة البيانات
    async testConnection() {
        try {
            const { data, error } = await this.supabase
                .from('users')
                .select('count')
                .limit(1);
            
            if (error) throw error;
            
            console.log('✅ الاتصال بقاعدة البيانات ناجح');
            return true;
        } catch (error) {
            console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
            return false;
        }
    }

    // استعادة جلسة المستخدم
    async restoreUserSession() {
        const isValid = await this.authManager.validateSession();
        
        if (isValid) {
            this.showDashboard();
            this.startBalanceCheck();
        } else {
            this.showHomepage();
        }
    }

    // إعداد مستمعي الأحداث
    setupEventListeners() {
        console.log('جاري إعداد مستمعي الأحداث');
        
        // أزرار الصفحة الرئيسية
        this.setupHomepageListeners();
        
        // أحداث المصادقة
        this.setupAuthListeners();
        
        // أحداث التنقل
        this.setupNavigationListeners();
        
        // أحداث إضافية
        this.setupAdditionalListeners();
    }

    // إعداد مستمعي الصفحة الرئيسية
    setupHomepageListeners() {
        const registerBtn = document.getElementById('registerBtnHomepage');
        const loginBtn = document.getElementById('loginBtnHomepage');
        
        if (registerBtn) {
            registerBtn.addEventListener('click', () => {
                this.showAuthPage();
                this.switchTab('register');
            });
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                this.showAuthPage();
            });
        }
    }

    // إعداد مستمعي المصادقة
    setupAuthListeners() {
        // تبديل التبويبات
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabType = btn.getAttribute('data-tab');
                this.switchTab(tabType);
            });
        });
        
        // نموذج تسجيل الدخول
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLoginSubmit(e));
        }
        
        // نموذج التسجيل
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegisterSubmit(e));
        }
    }

    // إعداد مستمعي التنقل
    setupNavigationListeners() {
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.handleNavigation(section);
            });
        });

        // زر تسجيل الخروج
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation('logout');
            });
        }
    }

    // إعداد مستمعين إضافيين
    setupAdditionalListeners() {
        // زر نشر المنشور
        const publishPostBtn = document.getElementById('publishPostBtn');
        if (publishPostBtn) {
            publishPostBtn.addEventListener('click', () => {
                this.postsManager.handlePublishPost();
            });
        }

        // زر تحويل النقاط
        const transferBtn = document.getElementById('transferBtn');
        if (transferBtn) {
            transferBtn.addEventListener('click', () => {
                this.handleTransferPoints();
            });
        }

        // زر السحب
        const withdrawalBtn = document.getElementById('withdrawalBtn');
        if (withdrawalBtn) {
            withdrawalBtn.addEventListener('click', () => {
                this.handleWithdrawal();
            });
        }

        // زر نسخ رابط الدعوة
        const copyInvitationBtn = document.getElementById('copyInvitationLink');
        if (copyInvitationBtn) {
            copyInvitationBtn.addEventListener('click', () => {
                this.handleCopyInvitationLink();
            });
        }

        // إغلاق النوافذ عند النقر خارجها
        this.setupModalClosers();
        
        // اختصار Esc لإغلاق النوافذ
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // معالجة التنقل
    handleNavigation(section) {
        if (section === 'logout') {
            this.authManager.logoutUser();
            this.showHomepage();
        } else if (this.authManager.getCurrentUser() || section === 'dashboard') {
            this.showSection(section);
        } else {
            this.showAuthPage();
        }
    }

    // عرض الصفحة الرئيسية
    showHomepage() {
        this.hideAllSections();
        document.getElementById('homepage').style.display = 'block';
        document.getElementById('userSidebar').style.display = 'none';
        this.currentSection = 'homepage';
    }

    // عرض صفحة المصادقة
    showAuthPage() {
        this.hideAllSections();
        document.getElementById('authContainer').style.display = 'block';
        document.getElementById('userSidebar').style.display = 'none';
        this.currentSection = 'auth';
    }

    // عرض لوحة التحكم
    showDashboard() {
        this.hideAllSections();
        document.getElementById('dashboardSection').style.display = 'block';
        document.getElementById('userSidebar').style.display = 'block';
        this.currentSection = 'dashboard';
        
        this.updateUserInfo();
        this.updateNavigation();
    }

    // عرض قسم معين
    showSection(sectionName) {
        this.hideAllSections();
        
        const targetSection = document.getElementById(sectionName + 'Section') || 
                             document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
        }
        
        if (this.authManager.getCurrentUser()) {
            document.getElementById('userSidebar').style.display = 'block';
        }
        
        this.updateNavigation(sectionName);
        this.loadSectionData(sectionName);
    }

    // إخفاء جميع الأقسام
    hideAllSections() {
        const sections = [
            'homepage', 'authContainer', 'dashboardSection', 
            'donationSection', 'exchangeSection', 'luck-wheelSection',
            'postsSection', 'transferSection', 
            'withdrawalSection', 'inviteSection', 'profileSection'
        ];
        
        sections.forEach(section => {
            const element = document.getElementById(section);
            if (element) {
                element.style.display = 'none';
            }
        });
    }

    // تحديث معلومات المستخدم في الواجهة
    updateUserInfo() {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return;
        
        const elements = [
            { id: 'userPoints', value: currentUser.points || 0 },
            { id: 'userBalance', value: (currentUser.balance || 0).toFixed(2) },
            { id: 'userPosts', value: currentUser.posts_count || 0 },
            { id: 'userChats', value: currentUser.chats_count || 0 },
            { id: 'sidebarUserName', value: currentUser.username },
            { id: 'sidebarUserId', value: `ID: ${currentUser.user_id}` },
            { id: 'sidebarUserAvatar', value: currentUser.username?.charAt(0) || 'U' },
            { id: 'profileName', value: currentUser.username },
            { id: 'profileId', value: `ID: ${currentUser.user_id}` },
            { id: 'profilePoints', value: currentUser.points || 0 },
            { id: 'profileBalance', value: (currentUser.balance || 0).toFixed(2) },
            { id: 'profilePosts', value: currentUser.posts_count || 0 },
            { id: 'profileAvatar', value: currentUser.username?.charAt(0) || 'U' }
        ];
        
        elements.forEach(item => {
            const element = document.getElementById(item.id);
            if (element) {
                element.textContent = item.value;
            }
        });
    }

    // تحديث التنقل
    updateNavigation(activeSection = 'dashboard') {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === activeSection) {
                link.classList.add('active');
            }
        });
    }

    // تحميل بيانات القسم
    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'posts':
                this.postsManager.getAllPosts().then(result => {
                    if (result.success) {
                        this.postsManager.renderPosts(result.data);
                    }
                });
                break;
            case 'donation':
                this.donationManager.renderDepositAddresses();
                break;
            case 'exchange':
                this.exchangeManager.loadExchangeSection();
                break;
            case 'luck-wheel':
                this.wheelManager.setupWheel();
                break;
            case 'profile':
                this.updateProfileSection();
                break;
            case 'invite':
                this.updateInvitationSection();
                break;
        }
    }

    // تبديل التبويبات
    switchTab(tabType) {
        const loginBtn = document.querySelector('.tab-btn[data-tab="login"]');
        const registerBtn = document.querySelector('.tab-btn[data-tab="register"]');
        
        if (loginBtn && registerBtn) {
            if (tabType === 'login') {
                loginBtn.classList.add('active');
                registerBtn.classList.remove('active');
                document.getElementById('loginForm').style.display = 'block';
                document.getElementById('registerForm').style.display = 'none';
            } else {
                registerBtn.classList.add('active');
                loginBtn.classList.remove('active');
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('registerForm').style.display = 'block';
            }
        }
    }

    // معالجة تسجيل الدخول
    async handleLoginSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const loginBtn = document.getElementById('loginSubmitBtn');
        
        if (!email || !password) {
            Utils.showMessage('loginMessage', 'يرجى ملء جميع الحقول', 'error');
            return;
        }
        
        const originalText = Utils.showLoading(loginBtn);
        
        const result = await this.authManager.loginUser(email, password);
        
        if (result.success) {
            Utils.showMessage('loginMessage', 'تم تسجيل الدخول بنجاح!', 'success');
            setTimeout(() => {
                this.showDashboard();
                this.startBalanceCheck();
            }, 1500);
        } else {
            Utils.showMessage('loginMessage', result.error, 'error');
        }
        
        Utils.hideLoading(loginBtn, originalText);
    }

    // معالجة التسجيل
    async handleRegisterSubmit(e) {
        e.preventDefault();
        
        const username = document.getElementById('regUsername').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const registerBtn = document.getElementById('registerSubmitBtn');
        
        if (!username || !email || !password || !confirmPassword) {
            Utils.showMessage('registerMessage', 'يرجى ملء جميع الحقول', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            Utils.showMessage('registerMessage', 'كلمتا المرور غير متطابقتين', 'error');
            return;
        }
        
        if (!Utils.isValidEmail(email)) {
            Utils.showMessage('registerMessage', 'البريد الإلكتروني غير صحيح', 'error');
            return;
        }
        
        if (!Utils.isStrongPassword(password)) {
            Utils.showMessage('registerMessage', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }
        
        const originalText = Utils.showLoading(registerBtn);
        
        const userData = {
            user_id: Utils.generateUserId(),
            username: username,
            email: email,
            password: password,
            points: 0,
            balance: 0,
            posts_count: 0,
            chats_count: 0,
            created_at: new Date().toISOString()
        };
        
        const result = await this.authManager.registerUser(userData);
        
        if (result.success) {
            Utils.showMessage('registerMessage', 'تم إنشاء الحساب بنجاح!', 'success');
            setTimeout(() => {
                this.authManager.currentUser = result.data;
                localStorage.setItem('zawajni_current_user', JSON.stringify(result.data));
                this.showDashboard();
                this.startBalanceCheck();
            }, 1500);
        } else {
            Utils.showMessage('registerMessage', result.error, 'error');
        }
        
        Utils.hideLoading(registerBtn, originalText);
    }

    // معالجة تحويل النقاط
    async handleTransferPoints() {
        const recipientId = document.getElementById('transferRecipientId').value;
        const amount = parseInt(document.getElementById('transferAmount').value);
        const message = document.getElementById('transferMessage').value;
        const transferBtn = document.getElementById('transferBtn');
        
        if (!recipientId || !amount) {
            Utils.showMessage('transferMessage', 'يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        if (amount <= 0) {
            Utils.showMessage('transferMessage', 'يجب أن يكون المبلغ أكبر من صفر', 'error');
            return;
        }
        
        const originalText = Utils.showLoading(transferBtn);
        
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) {
            Utils.hideLoading(transferBtn, originalText);
            return;
        }
        
        if (amount > currentUser.points) {
            Utils.showMessage('transferMessage', 'ليس لديك نقاط كافية', 'error');
            Utils.hideLoading(transferBtn, originalText);
            return;
        }
        
        // التحقق من وجود المستلم
        const recipientResult = await this.authManager.getUserById(recipientId);
        if (!recipientResult.success) {
            Utils.showMessage('transferMessage', 'المستخدم المستلم غير موجود', 'error');
            Utils.hideLoading(transferBtn, originalText);
            return;
        }
        
        // خصم النقاط من المرسل
        const senderResult = await this.authManager.updateUserPoints(currentUser.user_id, -amount);
        if (!senderResult.success) {
            Utils.showMessage('transferMessage', senderResult.error, 'error');
            Utils.hideLoading(transferBtn, originalText);
            return;
        }
        
        // إضافة النقاط للمستلم
        const recipientUpdate = await this.authManager.updateUserPoints(recipientId, amount);
        if (!recipientUpdate.success) {
            // إرجاع النقاط إذا فشل الإضافة للمستلم
            await this.authManager.updateUserPoints(currentUser.user_id, amount);
            Utils.showMessage('transferMessage', 'فشل في تحويل النقاط', 'error');
            Utils.hideLoading(transferBtn, originalText);
            return;
        }
        
        Utils.showMessage('transferMessage', `تم تحويل ${amount} نقطة بنجاح!`, 'success');
        document.getElementById('transferRecipientId').value = '';
        document.getElementById('transferAmount').value = '';
        document.getElementById('transferMessage').value = '';
        
        this.updateUserInfo();
        Utils.hideLoading(transferBtn, originalText);
    }

    // معالجة السحب
    async handleWithdrawal() {
        const amount = parseFloat(document.getElementById('withdrawalAmount').value);
        const method = document.getElementById('withdrawalMethod').value;
        const details = document.getElementById('withdrawalDetails').value;
        const withdrawalBtn = document.getElementById('withdrawalBtn');
        
        if (!amount || !method || !details) {
            Utils.showMessage('withdrawalMessage', 'يرجى ملء جميع الحقول', 'error');
            return;
        }
        
        if (amount < 10) {
            Utils.showMessage('withdrawalMessage', 'الحد الأدنى للسحب هو 10$', 'error');
            return;
        }
        
        const originalText = Utils.showLoading(withdrawalBtn);
        
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) {
            Utils.hideLoading(withdrawalBtn, originalText);
            return;
        }
        
        if (amount > currentUser.balance) {
            Utils.showMessage('withdrawalMessage', 'ليس لديك رصيد كافي', 'error');
            Utils.hideLoading(withdrawalBtn, originalText);
            return;
        }
        
        // خصم المبلغ من الرصيد
        const result = await this.authManager.updateUserBalance(currentUser.user_id, -amount);
        
        if (result.success) {
            Utils.showMessage('withdrawalMessage', `تم تقديم طلب السحب بنجاح!`, 'success');
            document.getElementById('withdrawalAmount').value = '';
            document.getElementById('withdrawalDetails').value = '';
            
            this.updateUserInfo();
            
            // إرسال إشعار السحب
            await this.donationManager.sendWithdrawalNotification(
                currentUser.user_id,
                amount,
                details
            );
        } else {
            Utils.showMessage('withdrawalMessage', result.error, 'error');
        }
        
        Utils.hideLoading(withdrawalBtn, originalText);
    }

    // معالجة نسخ رابط الدعوة
    async handleCopyInvitationLink() {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) {
            this.showToast('خطأ', 'يجب تسجيل الدخول أولاً', 'error');
            return;
        }
        
        const invitationLink = `${window.location.origin}?ref=${currentUser.user_id}`;
        const invitationInput = document.getElementById('invitationLink');
        
        if (invitationInput) {
            invitationInput.value = invitationLink;
        }
        
        const success = await Utils.copyToClipboard(invitationLink);
        if (success) {
            this.showToast('نجاح', 'تم نسخ رابط الدعوة', 'success');
        } else {
            this.showToast('خطأ', 'فشل في نسخ الرابط', 'error');
        }
    }

    // بدء التحقق من الرصيد
    startBalanceCheck() {
        setInterval(async () => {
            const currentUser = this.authManager.getCurrentUser();
            if (currentUser) {
                const result = await this.authManager.getUserById(currentUser.user_id);
                if (result.success && result.data) {
                    const updatedUser = result.data;
                    
                    const pointsDiff = updatedUser.points - currentUser.points;
                    const balanceDiff = updatedUser.balance - currentUser.balance;
                    
                    if (pointsDiff !== 0 || balanceDiff !== 0) {
                        this.authManager.currentUser = updatedUser;
                        localStorage.setItem('zawajni_current_user', JSON.stringify(updatedUser));
                        this.updateUserInfo();
                        
                        if (pointsDiff > 0) {
                            this.showToast('نقاط جديدة', `تم إضافة ${pointsDiff} نقطة إلى رصيدك`, 'success');
                        } else if (pointsDiff < 0) {
                            this.showToast('خصم نقاط', `تم خصم ${Math.abs(pointsDiff)} نقطة من رصيدك`, 'warning');
                        }
                        
                        if (balanceDiff > 0) {
                            this.showToast('رصيد جديد', `تم إضافة ${balanceDiff}$ إلى رصيدك`, 'success');
                        } else if (balanceDiff < 0) {
                            this.showToast('سحب رصيد', `تم سحب ${Math.abs(balanceDiff)}$ من رصيدك`, 'warning');
                        }
                    }
                }
            }
        }, 120000); // كل دقيقتين
    }

    // إظهار إشعار
    showToast(title, message, type = 'info') {
        const toast = document.getElementById('notificationToast');
        const toastTitle = document.getElementById('toastTitle');
        const toastMessage = document.getElementById('toastMessage');
        
        if (!toast || !toastTitle || !toastMessage) return;
        
        toastTitle.textContent = title;
        toastMessage.textContent = message;
        
        toast.className = 'notification-toast';
        toast.classList.add(type);
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 5000);
    }

    // إظهار خطأ
    showError(message) {
        this.showToast('خطأ', message, 'error');
    }

    // إعداد إغلاق النوافذ
    setupModalClosers() {
        const depositModal = document.getElementById('depositSuccessModal');
        const wheelModal = document.getElementById('wheelResultModal');
        
        if (depositModal) {
            depositModal.addEventListener('click', (e) => {
                if (e.target === depositModal) {
                    this.donationManager.closeDepositSuccessModal();
                }
            });
        }
        
        if (wheelModal) {
            wheelModal.addEventListener('click', (e) => {
                if (e.target === wheelModal) {
                    this.wheelManager.closeWheelResultModal();
                }
            });
        }
    }

    // إغلاق جميع النوافذ
    closeAllModals() {
        this.donationManager.closeDepositSuccessModal();
        this.wheelManager.closeWheelResultModal();
    }

    // تحديث قسم الملف الشخصي
    updateProfileSection() {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return;
        
        const profileFullName = document.getElementById('profileFullName');
        const profileEmail = document.getElementById('profileEmail');
        const profilePhone = document.getElementById('profilePhone');
        
        if (profileFullName) profileFullName.value = currentUser.username || '';
        if (profileEmail) profileEmail.value = currentUser.email || '';
        if (profilePhone) profilePhone.value = currentUser.phone || '';
    }

    // تحديث قسم الدعوات
    updateInvitationSection() {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return;
        
        const invitationLink = `${window.location.origin}?ref=${currentUser.user_id}`;
        const invitationInput = document.getElementById('invitationLink');
        
        if (invitationInput) {
            invitationInput.value = invitationLink;
        }
    }
}

// جعل AppManager متاحاً عالمياً
window.appManager = new AppManager();

// إضافة دالة إرسال إشعار السحب إلى DonationManager
DonationManager.prototype.sendWithdrawalNotification = async function(userId, amount, accountDetails) {
    try {
        const message = `🔴 طلب سحب جديد\n👤 المستخدم: ${userId}\n💰 المبلغ: ${amount}$\n🏦 تفاصيل الحساب: ${accountDetails}\n⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;
        
        console.log('إشعار السحب:', message);
        
        // مثال على إرسال إلى ويب هوك التليجرام
        // const telegramBotToken = 'YOUR_BOT_TOKEN';
        // const chatId = 'YOUR_CHAT_ID';
        // await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //         chat_id: chatId,
        //         text: message
        //     })
        // });
        
        return { success: true };
    } catch (error) {
        console.error('خطأ في إرسال إشعار السحب:', error);
        return { success: false, error: error.message };
    }
};

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    console.log('تم تحميل الصفحة، جاري تشغيل التطبيق...');
});