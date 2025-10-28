// =============================================
// وظائف التبرعات والإيداع
// =============================================

class DonationManager {
    constructor(supabase, authManager) {
        this.supabase = supabase;
        this.authManager = authManager;
    }
    
    // عرض عناوين الإيداع
    renderDepositAddresses() {
        const donationGrid = document.getElementById('cryptoDonationGrid');
        if (!donationGrid) return;
        
        // إزالة البطاقات القديمة
        donationGrid.innerHTML = '';
        
        // إضافة بطاقات العملات الرقمية
        CRYPTO_CURRENCIES.forEach(crypto => {
            const cryptoCard = this.createCryptoCard(crypto);
            donationGrid.appendChild(cryptoCard);
        });
    }
    
    // إنشاء بطاقة عملة رقمية
    createCryptoCard(crypto) {
        const cryptoCard = document.createElement('div');
        cryptoCard.className = 'donation-card';
        
        cryptoCard.innerHTML = `
            <div class="crypto-card-inner">
                <div class="crypto-icon">
                    <i class="fab fa-${this.getCurrencyIcon(crypto.symbol)}"></i>
                </div>
                <h3>${crypto.name}</h3>
                <div class="qr-code">QR Code</div>
                <div class="crypto-address">${crypto.address}</div>
                <p class="crypto-network">الشبكة: ${crypto.network}</p>
                <button 
                    onclick="appManager.donationManager.handleCryptoDeposit('${crypto.symbol}', '${crypto.name}', '${crypto.address}')"
                    class="btn btn-success"
                >
                    تم الإيداع بنجاح
                </button>
            </div>
        `;
        
        return cryptoCard;
    }
    
    // الحصول على أيقونة العملة
    getCurrencyIcon(symbol) {
        const icons = {
            'USDT': 'usd',
            'ETH': 'ethereum',
            'BTC': 'bitcoin',
            'TRX': 'tron'
        };
        
        return icons[symbol] || 'money-bill-wave';
    }
    
    // معالجة إيداع العملات الرقمية
    async handleCryptoDeposit(symbol, name, address) {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) {
            Utils.showMessage('donationMessage', 'يجب تسجيل الدخول أولاً', 'error');
            return;
        }
        
        // عرض نافذة التأكيد
        this.showDepositSuccessModal(name, address, symbol);
        
        const depositData = {
            deposit_id: Utils.generateDepositId(),
            user_id: currentUser.user_id,
            username: currentUser.username,
            currency: symbol,
            currency_name: name,
            address: address,
            amount: 0,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        const result = await this.confirmDeposit(depositData);
        
        if (result.success) {
            console.log(`تم إرسال إشعار الإيداع للعملة ${name} بنجاح!`);
        } else {
            console.error('خطأ في تأكيد الإيداع:', result.error);
        }
    }
    
    // تأكيد الإيداع
    async confirmDeposit(depositData) {
        try {
            console.log('جاري تأكيد الإيداع:', depositData);
            
            // إدخال سجل الإيداع
            const { data, error } = await this.supabase
                .from('deposits')
                .insert([depositData])
                .select();
            
            if (error) throw error;
            
            // إرسال إشعار إلى التليجرام
            await this.sendDepositNotification(
                depositData.user_id,
                depositData.amount,
                depositData.currency
            );
            
            console.log('تم تأكيد الإيداع بنجاح');
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('خطأ في تأكيد الإيداع:', error);
            return { success: false, error: error.message };
        }
    }
    
    // إرسال إشعار للإيداع إلى بوت التليجرام
    async sendDepositNotification(userId, amount, currency) {
        try {
            const message = `🟢 إيداع جديد\n👤 المستخدم: ${userId}\n💰 المبلغ: ${amount} ${currency}\n⏰ الوقت: ${new Date().toLocaleString('ar-SA')}`;
            
            console.log('إشعار الإيداع:', message);
            
            // هنا يمكنك إضافة كود إرسال الإشعار إلى بوت التليجرام
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
            console.error('خطأ في إرسال إشعار الإيداع:', error);
            return { success: false, error: error.message };
        }
    }
    
    // عرض نافذة تأكيد الإيداع
    showDepositSuccessModal(currencyName, currencyAddress, currencySymbol) {
        const modal = document.getElementById('depositSuccessModal');
        const currencyImage = document.getElementById('depositCurrencyImage');
        const currencyNameElement = document.getElementById('depositCurrencyName');
        const currencyAddressElement = document.getElementById('depositCurrencyAddress');
        
        // تعيين بيانات العملة
        currencyNameElement.textContent = currencyName;
        currencyAddressElement.textContent = currencyAddress;
        
        // تعيين رمز العملة في الصورة
        currencyImage.innerHTML = `<i class="fab fa-${this.getCurrencyIcon(currencySymbol)}"></i>`;
        
        // عرض النافذة
        modal.classList.add('show');
        
        // إرسال إشعار للإدارة
        const currentUser = this.authManager.getCurrentUser();
        if (currentUser) {
            this.sendDepositNotification(currentUser.user_id, 0, currencyName);
        }
    }
    
    // إغلاق نافذة تأكيد الإيداع
    closeDepositSuccessModal() {
        const modal = document.getElementById('depositSuccessModal');
        modal.classList.remove('show');
    }
    
    // إنشاء تبرع
    async createDonation(donationData) {
        try {
            const { data, error } = await this.supabase
                .from('donations')
                .insert([donationData])
                .select();
            
            if (error) throw error;
            
            // تحديث رصيد المستخدم
            const currentUser = this.authManager.getCurrentUser();
            if (currentUser) {
                const newBalance = (currentUser.balance || 0) + parseFloat(donationData.amount);
                
                await this.authManager.updateUserProfile(currentUser.user_id, {
                    balance: newBalance
                });
            }
            
            console.log('تم إنشاء التبرع بنجاح');
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('خطأ في إنشاء التبرع:', error);
            return { success: false, error: error.message };
        }
    }
}