// =============================================
// وظائف عجلة الحظ
// =============================================
/*
class WheelManager {
    constructor(supabase, authManager) {
        this.supabase = supabase;
        this.authManager = authManager;
        this.wheelSpinning = false;
        this.selectedSpins = 1;
        this.wheelTimerActive = false;
        this.wheelTimerSeconds = 30;
        this.wheelTimerInterval = null;
        this.wheelCooldownActive = false;
    }

    // إنشاء عجلة الحظ
    createWheel() {
        const wheel = document.getElementById('luckWheel');
        if (!wheel) return;
        
        wheel.innerHTML = '';
        
        // إنشاء أقسام العجلة
        const prizes = ['حظ أوفر', '10 نقاط', 'دورة مجانية', '1 دولار', '10 دولار', '0.5 دولار'];
        
        for (let i = 0; i < 6; i++) {
            const section = document.createElement('div');
            section.className = 'wheel-section-item';
            section.style.transform = `rotate(${i * 60}deg) translateY(-150px)`;
            section.innerHTML = `
                <div style="transform: rotate(${30}deg); width: 100%;">
                    ${prizes[i]}
                </div>
            `;
            wheel.appendChild(section);
        }
    }

    // تحديث تكلفة الدوران
    updateWheelCost() {
        const costElement = document.getElementById('wheelCost');
        if (!costElement) return;
        
        let cost = 0;
        if (this.selectedSpins === 1) cost = 10;
        else if (this.selectedSpins === 5) cost = 45;
        else if (this.selectedSpins === 10) cost = 90;
        
        costElement.textContent = `${cost} نقطة`;
    }

    // تحديث واجهة المؤقت
    updateWheelTimerDisplay() {
        const spinButton = document.getElementById('spinButton');
        const timerDisplay = document.getElementById('wheelTimerDisplay');
        const timerDisplayMain = document.getElementById('wheelTimerDisplayMain');
        
        if (!spinButton) return;
        
        if (this.wheelTimerActive) {
            // إظهار المؤقت التنازلي
            if (timerDisplay) {
                timerDisplay.textContent = `${this.wheelTimerSeconds} ثانية`;
            }
            
            spinButton.innerHTML = `<i class="fas fa-clock"></i> ${this.wheelTimerSeconds}`;
            spinButton.style.pointerEvents = 'none';
            spinButton.style.opacity = '0.7';
            
            if (timerDisplayMain) {
                timerDisplayMain.textContent = `انتظر ${this.wheelTimerSeconds} ثانية`;
                timerDisplayMain.className = 'wheel-timer-display wheel-timer-active';
            }
        } else if (this.wheelCooldownActive) {
            // فترة التبريد بعد الدوران
            spinButton.innerHTML = `<i class="fas fa-hourglass-half"></i> ${this.wheelTimerSeconds}`;
            spinButton.style.pointerEvents = 'none';
            spinButton.style.opacity = '0.7';
            
            if (timerDisplay) {
                timerDisplay.textContent = `تبريد: ${this.wheelTimerSeconds} ثانية`;
            }
            
            if (timerDisplayMain) {
                timerDisplayMain.textContent = `فترة تبريد: ${this.wheelTimerSeconds} ثانية`;
                timerDisplayMain.className = 'wheel-timer-display wheel-timer-cooldown';
            }
        } else {
            // الحالة العادية
            spinButton.innerHTML = `<i class="fas fa-redo-alt"></i>`;
            spinButton.style.pointerEvents = 'auto';
            spinButton.style.opacity = '1';
            
            if (timerDisplay) {
                timerDisplay.textContent = 'جاهز للدوران';
            }
            
            if (timerDisplayMain) {
                timerDisplayMain.textContent = 'جاهز للدوران';
                timerDisplayMain.className = 'wheel-timer-display';
            }
        }
    }

    // بدء المؤقت
    startWheelTimer() {
        this.wheelTimerActive = true;
        this.wheelTimerSeconds = 30;
        
        this.updateWheelTimerDisplay();
        
        this.wheelTimerInterval = setInterval(() => {
            this.wheelTimerSeconds--;
            
            if (this.wheelTimerSeconds <= 0) {
                clearInterval(this.wheelTimerInterval);
                this.wheelTimerActive = false;
                this.updateWheelTimerDisplay();
            } else {
                this.updateWheelTimerDisplay();
            }
        }, 1000);
    }

    // بدء فترة التبريد بعد الدوران
    startWheelCooldown() {
        this.wheelCooldownActive = true;
        this.wheelTimerSeconds = 30;
        
        this.updateWheelTimerDisplay();
        
        this.wheelTimerInterval = setInterval(() => {
            this.wheelTimerSeconds--;
            
            if (this.wheelTimerSeconds <= 0) {
                clearInterval(this.wheelTimerInterval);
                this.wheelCooldownActive = false;
                this.updateWheelTimerDisplay();
            } else {
                this.updateWheelTimerDisplay();
            }
        }, 1000);
    }

    // تدوير عجلة الحظ
    async spinWheel() {
        // التحقق من المؤقت النشط
        if (this.wheelTimerActive) {
            this.showToast('تحذير', `يجب الانتظار ${this.wheelTimerSeconds} ثانية قبل الدوران التالي`, 'warning');
            return;
        }

        if (this.wheelCooldownActive) {
            this.showToast('تحذير', `فترة التبريد نشطة. انتظر ${this.wheelTimerSeconds} ثانية`, 'warning');
            return;
        }
        
        if (this.wheelSpinning) return;
        
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) {
            this.showToast('تحذير', 'يجب تسجيل الدخول أولاً', 'warning');
            return;
        }
        
        // حساب التكلفة
        let cost = 0;
        if (this.selectedSpins === 1) cost = 10;
        else if (this.selectedSpins === 5) cost = 45;
        else if (this.selectedSpins === 10) cost = 90;
        
        // التحقق من رصيد النقاط
        if (currentUser.points < cost) {
            this.showToast('خطأ', 'ليس لديك نقاط كافية', 'error');
            return;
        }
        
        // بدء المؤقت قبل الدوران
        this.startWheelTimer();
        
        // بدء الدوران
        this.wheelSpinning = true;
        const wheel = document.getElementById('luckWheel');
        const spinButton = document.getElementById('spinButton');
        const resultElement = document.getElementById('wheelResult');
        
        if (spinButton) spinButton.style.pointerEvents = 'none';
        if (resultElement) {
            resultElement.classList.remove('show');
            resultElement.querySelector('#resultTitle').textContent = 'جاري الدوران...';
            resultElement.querySelector('#resultMessage').textContent = 'انتظر نتيجة الدوران...';
        }
        
        // تدوير العجلة
        const spins = 5 + Math.floor(Math.random() * 5);
        const degrees = 360 * spins + (Math.floor(Math.random() * 6) * 60);
        
        wheel.style.transform = `rotate(${degrees}deg)`;
        wheel.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.3, 1)';
        
        // انتظار انتهاء الدوران
        setTimeout(async () => {
            await this.processWheelResult(degrees, cost, currentUser);
        }, 5000);
    }

    // معالجة نتيجة الدوران
    async processWheelResult(degrees, cost, currentUser) {
        // تحديد الجائزة
        const prizeIndex = Math.floor((degrees % 360) / 60);
        const prize = WHEEL_PRIZES[prizeIndex];
        
        // خصم النقاط (إلا إذا كانت الجائزة دورة مجانية)
        let costApplied = cost;
        if (prize.type === 'free_spin') {
            costApplied = 0;
        }
        
        const newPoints = currentUser.points - costApplied;
        
        // تطبيق الجائزة
        let prizeMessage = '';
        let prizeValue = 0;
        
        switch (prize.type) {
            case 'points':
                prizeValue = prize.value;
                currentUser.points = newPoints + prizeValue;
                prizeMessage = `مبروك! لقد ربحت ${prizeValue} نقطة!`;
                break;
                
            case 'dollars':
                prizeValue = prize.value;
                currentUser.balance += prizeValue;
                prizeMessage = `مبروك! لقد ربحت ${prizeValue}$!`;
                break;
                
            case 'free_spin':
                prizeValue = prize.value;
                prizeMessage = `مبروك! لقد ربحت دورة مجانية!`;
                break;
                
            case 'nothing':
                prizeMessage = `للأسف، حظ أوفر في المرة القادمة!`;
                break;
        }
        
        // تحديث بيانات المستخدم في قاعدة البيانات
        const result = await this.authManager.updateUserProfile(currentUser.user_id, {
            points: currentUser.points,
            balance: currentUser.balance
        });
        
        if (result.success) {
            // عرض النتيجة
            this.showWheelResult(prize.name, prizeMessage, prizeValue, prize.type);
            
            // إرسال إشعار
            this.showToast('مبروك!', prizeMessage, 'success');
            
            // تحديث المعلومات في الواجهة
            this.updateWheelBalances();
            
            // تسجيل نتيجة الدوران
            await this.logWheelSpin({
                spin_id: 'SPIN_' + Date.now(),
                user_id: currentUser.user_id,
                username: currentUser.username,
                spins_count: this.selectedSpins,
                cost: costApplied,
                prize_type: prize.type,
                prize_value: prizeValue,
                prize_name: prize.name
            });
        } else {
            this.showToast('خطأ', 'حدث خطأ أثناء معالجة الجائزة', 'error');
        }
        
        // إعادة تفعيل الزر وبدء فترة التبريد
        this.wheelSpinning = false;
        this.startWheelCooldown();
    }

    // عرض نتيجة عجلة الحظ
    showWheelResult(title, message, value, type) {
        const modal = document.getElementById('wheelResultModal');
        const resultIcon = document.getElementById('wheelResultIcon');
        const resultTitle = document.getElementById('wheelResultTitle');
        const resultMessage = document.getElementById('wheelResultMessage');
        const prizeAmount = document.getElementById('wheelPrizeAmount');
        
        if (!modal) return;
        
        // تعيين المحتوى
        resultTitle.textContent = title;
        resultMessage.textContent = message;
        
        // تعيين الأيقونة بناءً على نوع الجائزة
        if (type === 'nothing') {
            resultIcon.innerHTML = '<i class="fas fa-times-circle" style="color: #EF4444;"></i>';
            prizeAmount.textContent = '';
        } else {
            resultIcon.innerHTML = '<i class="fas fa-gift" style="color: #10B981;"></i>';
            if (type === 'points') {
                prizeAmount.textContent = `+${value} نقطة`;
                prizeAmount.style.color = '#10B981';
            } else if (type === 'dollars') {
                prizeAmount.textContent = `+${value}$`;
                prizeAmount.style.color = '#F59E0B';
            } else if (type === 'free_spin') {
                prizeAmount.textContent = `دورة مجانية`;
                prizeAmount.style.color = '#06B6D4';
            }
        }
        
        // عرض النافذة
        modal.classList.add('show');
    }

    // إغلاق نافذة نتيجة عجلة الحظ
    closeWheelResultModal() {
        const modal = document.getElementById('wheelResultModal');
        if (modal) modal.classList.remove('show');
    }

    // تحديث أرصدة عجلة الحظ
    updateWheelBalances() {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return;
        
        const pointsBalance = document.getElementById('wheelPointsBalance');
        if (pointsBalance) {
            pointsBalance.textContent = `${currentUser.points} نقطة`;
        }
        
        this.updateWheelCost();
    }

    // تسجيل نتيجة دوران عجلة الحظ
    async logWheelSpin(spinData) {
    try {
        console.log('جاري تسجيل نتيجة الدوران:', spinData);
        
        const insertData = {
            spin_id: spinData.spin_id,
            user_id: spinData.user_id,
            username: spinData.username,
            spins_count: spinData.spins_count,
            prize_type: spinData.prize_type,
            prize_value: spinData.prize_value,
            prize_name: spinData.prize_name
            // created_at سيتم تعبئته تلقائياً
        };
        
        const { data, error } = await this.supabase
            .from('wheel_spins')
            .insert([insertData])
            .select();
        
        if (error) {
            console.error('خطأ في تسجيل نتيجة الدوران:', error);
            return { success: false, error: error.message };
        }
        
        console.log('تم تسجيل نتيجة الدوران بنجاح');
        return { success: true, data: data[0] };
    } catch (error) {
        console.error('خطأ في تسجيل نتيجة الدوران:', error);
        return { success: false, error: error.message };
    }
}

    // إظهار إشعار
    showToast(title, message, type = 'info') {
        // استخدام AppManager إذا كان متاحاً، أو تنفيذ بسيط
        if (window.appManager) {
            appManager.showToast(title, message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        }
    }

    // إعداد عجلة الحظ
    setupWheel() {
        this.createWheel();
        this.updateWheelBalances();
        this.updateWheelTimerDisplay();
        
        // إعداد أزرار اختيار عدد الدورات
        const spinOptions = document.querySelectorAll('.spin-option');
        spinOptions.forEach(option => {
            option.addEventListener('click', () => {
                // إزالة النشاط من جميع الخيارات
                spinOptions.forEach(opt => opt.classList.remove('active'));
                // إضافة النشاط للخيار المحدد
                option.classList.add('active');
                // تحديث عدد الدورات المختارة
                this.selectedSpins = parseInt(option.getAttribute('data-spins'));
                this.updateWheelCost();
            });
        });
        
        // إعداد زر التدوير
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spinWheel());
        }
    }
}
*/


// =============================================
// وظائف عجلة الحظ - النسخة المحدثة
// =============================================

class WheelManager {
    constructor(supabase, authManager) {
        this.supabase = supabase;
        this.authManager = authManager;
        this.wheelSpinning = false;
        this.selectedSpins = 1;
        this.wheelTimerActive = false;
        this.wheelTimerSeconds = 30;
        this.wheelTimerInterval = null;
        this.wheelCooldownActive = false;
        this.winRates = {}; // تخزين نسب الربح من الجدول
        
        // تعريف الجوائز العالمية
        this.WHEEL_PRIZES = [
            { type: 'nothing', name: 'حظ أوفر', value: 0 },
            { type: 'points', name: '10 نقاط', value: 10 },
            { type: 'free_spin', name: 'دورة مجانية', value: 1 },
            { type: 'dollars', name: '1 دولار', value: 1 },
            { type: 'dollars', name: '10 دولار', value: 10 },
            { type: 'dollars', name: '0.5 دولار', value: 0.5 }
        ];
    }

    // إنشاء عجلة الحظ مع الجوائز الأصلية
    createWheel() {
        const wheel = document.getElementById('luckWheel');
        if (!wheel) return;
        
        wheel.innerHTML = '';
        
        // استخدام الجوائز الأصلية
        const prizes = this.WHEEL_PRIZES.map(prize => prize.name);
        
        for (let i = 0; i < 6; i++) {
            const section = document.createElement('div');
            section.className = 'wheel-section-item';
            section.style.transform = `rotate(${i * 60}deg) translateY(-150px)`;
            section.innerHTML = `
                <div style="transform: rotate(${30}deg); width: 100%;">
                    ${prizes[i]}
                </div>
            `;
            wheel.appendChild(section);
        }
    }

    // تحديث تكلفة الدوران الجديدة
    updateWheelCost() {
        const costElement = document.getElementById('wheelCost');
        if (!costElement) return;
        
        let cost = 0;
        if (this.selectedSpins === 1) cost = 100;
        else if (this.selectedSpins === 5) cost = 250;
        else if (this.selectedSpins === 10) cost = 500;
        
        costElement.textContent = `${cost} نقطة`;
    }

    // جلب نسب الربح من جدول wheel_settings
    async loadWinRates() {
        try {
            const { data, error } = await this.supabase
                .from('wheel_settings')
                .select('*');
            
            if (error) {
                console.error('خطأ في جلب نسب الربح:', error);
                return;
            }
            
            // تخزين النسب في كائن للوصول السريع
            this.winRates = {};
            data.forEach(setting => {
                this.winRates[setting.setting_name] = {
                    value: parseInt(setting.setting_value),
                    description: setting.description
                };
            });
            
            console.log('تم تحميل نسب الربح:', this.winRates);
            
        } catch (error) {
            console.error('خطأ في جلب نسب الربح:', error);
        }
    }

    // تحديد الجائزة بناءً على نسب الربح
    getRandomPrize() {
        // إنشاء مصفوفة من الجوائز مع أوزانها بناءً على النسب
        const prizes = [
            { 
                type: 'nothing', 
                name: 'حظ أوفر', 
                value: 0,
                weight: this.winRates['نسبة الحظ أوفر']?.value || 92
            },
            { 
                type: 'points', 
                name: '10 نقاط', 
                value: 10,
                weight: this.winRates['نسبة ربح 10 نقاط']?.value || 5
            },
            { 
                type: 'free_spin', 
                name: 'دورة مجانية', 
                value: 1,
                weight: this.winRates['نسبة ربح دورة مجانية']?.value || 0
            },
            { 
                type: 'dollars', 
                name: '1 دولار', 
                value: 1,
                weight: this.winRates['نسبة ربح 1 دولار']?.value || 1
            },
            { 
                type: 'dollars', 
                name: '10 دولار', 
                value: 10,
                weight: this.winRates['نسبة ربح 10 دولار']?.value || 0
            },
            { 
                type: 'dollars', 
                name: '0.5 دولار', 
                value: 0.5,
                weight: this.winRates['نسبة ربح 0.5 دولار']?.value || 1
            }
        ];

        // حساب الوزن الكلي
        const totalWeight = prizes.reduce((sum, prize) => sum + prize.weight, 0);
        
        // اختيار جائزة عشوائية بناءً على الأوزان
        let random = Math.random() * totalWeight;
        let weightSum = 0;

        for (const prize of prizes) {
            weightSum += prize.weight;
            if (random <= weightSum) {
                return prize;
            }
        }

        // إذا لم يتم اختيار أي جائزة (يجب ألا يحدث)، نعيد الجائزة الأخيرة
        return prizes[prizes.length - 1];
    }

    // الحصول على فهرس الجائزة
    getPrizeIndex(prize) {
        return this.WHEEL_PRIZES.findIndex(p => 
            p.type === prize.type && p.value === prize.value
        );
    }

    // تحديث واجهة المؤقت
    updateWheelTimerDisplay() {
        const spinButton = document.getElementById('spinButton');
        const timerDisplay = document.getElementById('wheelTimerDisplay');
        const timerDisplayMain = document.getElementById('wheelTimerDisplayMain');
        
        if (!spinButton) return;
        
        if (this.wheelTimerActive) {
            if (timerDisplay) {
                timerDisplay.textContent = `${this.wheelTimerSeconds} ثانية`;
            }
            
            spinButton.innerHTML = `<i class="fas fa-clock"></i> ${this.wheelTimerSeconds}`;
            spinButton.style.pointerEvents = 'none';
            spinButton.style.opacity = '0.7';
            
            if (timerDisplayMain) {
                timerDisplayMain.textContent = `انتظر ${this.wheelTimerSeconds} ثانية`;
                timerDisplayMain.className = 'wheel-timer-display wheel-timer-active';
            }
        } else if (this.wheelCooldownActive) {
            spinButton.innerHTML = `<i class="fas fa-hourglass-half"></i> ${this.wheelTimerSeconds}`;
            spinButton.style.pointerEvents = 'none';
            spinButton.style.opacity = '0.7';
            
            if (timerDisplay) {
                timerDisplay.textContent = `تبريد: ${this.wheelTimerSeconds} ثانية`;
            }
            
            if (timerDisplayMain) {
                timerDisplayMain.textContent = `فترة تبريد: ${this.wheelTimerSeconds} ثانية`;
                timerDisplayMain.className = 'wheel-timer-display wheel-timer-cooldown';
            }
        } else {
            spinButton.innerHTML = `<i class="fas fa-redo-alt"></i>`;
            spinButton.style.pointerEvents = 'auto';
            spinButton.style.opacity = '1';
            
            if (timerDisplay) {
                timerDisplay.textContent = 'جاهز للدوران';
            }
            
            if (timerDisplayMain) {
                timerDisplayMain.textContent = 'جاهز للدوران';
                timerDisplayMain.className = 'wheel-timer-display';
            }
        }
    }

    // بدء المؤقت
    startWheelTimer() {
        this.wheelTimerActive = true;
        this.wheelTimerSeconds = 30;
        
        this.updateWheelTimerDisplay();
        
        this.wheelTimerInterval = setInterval(() => {
            this.wheelTimerSeconds--;
            
            if (this.wheelTimerSeconds <= 0) {
                clearInterval(this.wheelTimerInterval);
                this.wheelTimerActive = false;
                this.updateWheelTimerDisplay();
            } else {
                this.updateWheelTimerDisplay();
            }
        }, 1000);
    }

    // بدء فترة التبريد بعد الدوران
    startWheelCooldown() {
        this.wheelCooldownActive = true;
        this.wheelTimerSeconds = 30;
        
        this.updateWheelTimerDisplay();
        
        this.wheelTimerInterval = setInterval(() => {
            this.wheelTimerSeconds--;
            
            if (this.wheelTimerSeconds <= 0) {
                clearInterval(this.wheelTimerInterval);
                this.wheelCooldownActive = false;
                this.updateWheelTimerDisplay();
            } else {
                this.updateWheelTimerDisplay();
            }
        }, 1000);
    }

    // تدوير عجلة الحظ
    async spinWheel() {
        if (this.wheelTimerActive) {
            this.showToast('تحذير', `يجب الانتظار ${this.wheelTimerSeconds} ثانية قبل الدوران التالي`, 'warning');
            return;
        }

        if (this.wheelCooldownActive) {
            this.showToast('تحذير', `فترة التبريد نشطة. انتظر ${this.wheelTimerSeconds} ثانية`, 'warning');
            return;
        }
        
        if (this.wheelSpinning) return;
        
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) {
            this.showToast('تحذير', 'يجب تسجيل الدخول أولاً', 'warning');
            return;
        }
        
        // حساب التكلفة الجديدة
        let cost = 0;
        if (this.selectedSpins === 1) cost = 100;
        else if (this.selectedSpins === 5) cost = 250;
        else if (this.selectedSpins === 10) cost = 500;
        
        // التحقق من رصيد النقاط
        if (currentUser.points < cost) {
            this.showToast('خطأ', 'ليس لديك نقاط كافية', 'error');
            return;
        }

        // خصم النقاط أولاً قبل الدوران
        const deductResult = await this.deductPoints(currentUser.user_id, cost);
        if (!deductResult.success) {
            this.showToast('خطأ', 'فشل في خصم النقاط', 'error');
            return;
        }

        // تحديث بيانات المستخدم المحلية
        currentUser.points -= cost;
        
        // بدء المؤقت قبل الدوران
        this.startWheelTimer();
        
        // بدء الدوران
        this.wheelSpinning = true;
        const wheel = document.getElementById('luckWheel');
        const spinButton = document.getElementById('spinButton');
        const resultElement = document.getElementById('wheelResult');
        
        if (spinButton) spinButton.style.pointerEvents = 'none';
        if (resultElement) {
            resultElement.classList.remove('show');
            resultElement.querySelector('#resultTitle').textContent = 'جاري الدوران...';
            resultElement.querySelector('#resultMessage').textContent = 'انتظر نتيجة الدوران...';
        }
        
        // تحديد الجائزة بناءً على نسب الربح
        const prize = this.getRandomPrize();
        const prizeIndex = this.getPrizeIndex(prize);
        
        // تدوير العجلة لتصل إلى الجائزة المحددة
        const spins = 5 + Math.floor(Math.random() * 5);
        const degrees = 360 * spins + (prizeIndex * 60);
        
        wheel.style.transform = `rotate(${degrees}deg)`;
        wheel.style.transition = 'transform 5s cubic-bezier(0.2, 0.8, 0.3, 1)';
        
        // انتظار انتهاء الدوران
        setTimeout(async () => {
            await this.processWheelResult(prize, cost, currentUser);
        }, 5000);
    }

    // خصم النقاط من المستخدم
    async deductPoints(userId, points) {
    try {
        // جلب النقاط الحالية للمستخدم من جدول users
        const { data: userData, error: userError } = await this.supabase
            .from('users') // تغيير من 'user_profiles' إلى 'users'
            .select('points')
            .eq('user_id', userId)
            .single();
        
        if (userError) {
            console.error('خطأ في جلب بيانات المستخدم:', userError);
            return { success: false, error: userError.message };
        }
        
        // التحقق من أن النقاط كافية
        if (userData.points < points) {
            return { success: false, error: 'نقاط غير كافية' };
        }
        
        // حساب النقاط الجديدة
        const newPoints = userData.points - points;
        
        // تحديث النقاط في قاعدة البيانات
        const { data, error } = await this.supabase
            .from('users') // تغيير من 'user_profiles' إلى 'users'
            .update({ points: newPoints })
            .eq('user_id', userId)
            .select();
        
        if (error) {
            console.error('خطأ في تحديث النقاط:', error);
            return { success: false, error: error.message };
        }
        
        console.log('تم خصم النقاط بنجاح:', points, 'نقاط');
        return { success: true };
    } catch (error) {
        console.error('خطأ في خصم النقاط:', error);
        return { success: false, error: error.message };
    }
}

    // معالجة نتيجة الدوران
    async processWheelResult(prize, cost, currentUser) {
        // تطبيق الجائزة
        let prizeMessage = '';
        let prizeValue = prize.value;
        let updateData = { points: currentUser.points };
        
        switch (prize.type) {
            case 'points':
                updateData.points += prizeValue;
                prizeMessage = `مبروك! لقد ربحت ${prizeValue} نقطة!`;
                break;
                
            case 'dollars':
                updateData.balance = (currentUser.balance || 0) + prizeValue;
                prizeMessage = `مبروك! لقد ربحت ${prizeValue}$!`;
                break;
                
            case 'free_spin':
                prizeMessage = `مبروك! لقد ربحت دورة مجانية!`;
                // يمكن إضافة المنطق اللازم للدورات المجانية
                break;
                
            case 'nothing':
                prizeMessage = `للأسف، حظ أوفر في المرة القادمة!`;
                break;
        }
        
        // تحديث بيانات المستخدم في قاعدة البيانات إذا كانت هناك جائزة
        if (prize.type !== 'nothing') {
            const result = await this.authManager.updateUserProfile(currentUser.user_id, updateData);
            
            if (result.success) {
                // تحديث بيانات المستخدم المحلية
                Object.assign(currentUser, updateData);
            } else {
                this.showToast('خطأ', 'حدث خطأ أثناء معالجة الجائزة', 'error');
            }
        }
        
        // عرض النتيجة
        this.showWheelResult(prize.name, prizeMessage, prizeValue, prize.type);
        
        // إرسال إشعار
        this.showToast('مبروك!', prizeMessage, 'success');
        
        // تحديث المعلومات في الواجهة
        this.updateWheelBalances();
        
        // تسجيل نتيجة الدوران
        await this.logWheelSpin({
            spin_id: 'SPIN_' + Date.now(),
            user_id: currentUser.user_id,
            username: currentUser.username,
            spins_count: this.selectedSpins,
            cost: cost,
            prize_type: prize.type,
            prize_value: prizeValue,
            prize_name: prize.name,
            win_rate: this.getWinRateForPrize(prize)
        });
        
        // إعادة تفعيل الزر وبدء فترة التبريد
        this.wheelSpinning = false;
        this.startWheelCooldown();
    }

    // الحصول على نسبة الربح للجائزة
    getWinRateForPrize(prize) {
        const prizeToSettingMap = {
            'حظ أوفر': 'نسبة الحظ أوفر',
            '10 نقاط': 'نسبة ربح 10 نقاط',
            'دورة مجانية': 'نسبة ربح دورة مجانية',
            '1 دولار': 'نسبة ربح 1 دولار',
            '10 دولار': 'نسبة ربح 10 دولار',
            '0.5 دولار': 'نسبة ربح 0.5 دولار'
        };
        
        const settingName = prizeToSettingMap[prize.name];
        return this.winRates[settingName]?.value || 0;
    }

    // عرض نتيجة عجلة الحظ
    showWheelResult(title, message, value, type) {
        const modal = document.getElementById('wheelResultModal');
        const resultIcon = document.getElementById('wheelResultIcon');
        const resultTitle = document.getElementById('wheelResultTitle');
        const resultMessage = document.getElementById('wheelResultMessage');
        const prizeAmount = document.getElementById('wheelPrizeAmount');
        
        if (!modal) return;
        
        // تعيين المحتوى
        resultTitle.textContent = title;
        resultMessage.textContent = message;
        
        // تعيين الأيقونة بناءً على نوع الجائزة
        if (type === 'nothing') {
            resultIcon.innerHTML = '<i class="fas fa-times-circle" style="color: #EF4444;"></i>';
            prizeAmount.textContent = '';
        } else {
            resultIcon.innerHTML = '<i class="fas fa-gift" style="color: #10B981;"></i>';
            if (type === 'points') {
                prizeAmount.textContent = `+${value} نقطة`;
                prizeAmount.style.color = '#10B981';
            } else if (type === 'dollars') {
                prizeAmount.textContent = `+${value}$`;
                prizeAmount.style.color = '#F59E0B';
            } else if (type === 'free_spin') {
                prizeAmount.textContent = `دورة مجانية`;
                prizeAmount.style.color = '#06B6D4';
            }
        }
        
        // عرض النافذة
        modal.classList.add('show');
    }

    // إغلاق نافذة نتيجة عجلة الحظ
    closeWheelResultModal() {
        const modal = document.getElementById('wheelResultModal');
        if (modal) modal.classList.remove('show');
    }

    // تحديث أرصدة عجلة الحظ
    updateWheelBalances() {
        const currentUser = this.authManager.getCurrentUser();
        if (!currentUser) return;
        
        const pointsBalance = document.getElementById('wheelPointsBalance');
        if (pointsBalance) {
            pointsBalance.textContent = `${currentUser.points} نقطة`;
        }
        
        this.updateWheelCost();
    }

    // تسجيل نتيجة دوران عجلة الحظ
    async logWheelSpin(spinData) {
        try {
            console.log('جاري تسجيل نتيجة الدوران:', spinData);
            
            const insertData = {
                spin_id: spinData.spin_id,
                user_id: spinData.user_id,
                username: spinData.username,
                spins_count: spinData.spins_count,
                cost: spinData.cost,
                prize_type: spinData.prize_type,
                prize_value: spinData.prize_value,
                prize_name: spinData.prize_name,
                win_rate: spinData.win_rate,
                created_at: new Date().toISOString()
            };
            
            const { data, error } = await this.supabase
                .from('wheel_spins')
                .insert([insertData])
                .select();
            
            if (error) {
                console.error('خطأ في تسجيل نتيجة الدوران:', error);
                return { success: false, error: error.message };
            }
            
            console.log('تم تسجيل نتيجة الدوران بنجاح');
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('خطأ في تسجيل نتيجة الدوران:', error);
            return { success: false, error: error.message };
        }
    }

    // إظهار إشعار
    showToast(title, message, type = 'info') {
        if (window.appManager) {
            appManager.showToast(title, message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${title}: ${message}`);
        }
    }

    // إعداد عجلة الحظ
    async setupWheel() {
        this.createWheel();
        this.updateWheelBalances();
        this.updateWheelTimerDisplay();
        
        // تحميل نسب الربح
        await this.loadWinRates();
        
        // إعداد أزرار اختيار عدد الدورات
        const spinOptions = document.querySelectorAll('.spin-option');
        spinOptions.forEach(option => {
            option.addEventListener('click', () => {
                spinOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.selectedSpins = parseInt(option.getAttribute('data-spins'));
                this.updateWheelCost();
            });
        });
        
        // إعداد زر التدوير
        const spinButton = document.getElementById('spinButton');
        if (spinButton) {
            spinButton.addEventListener('click', () => this.spinWheel());
        }
    }
}