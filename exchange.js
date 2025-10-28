// =============================================
// وظائف تبادل النقاط
// =============================================

class ExchangeManager {
  constructor(supabase, authManager) {
    this.supabase = supabase;
    this.authManager = authManager;
  }
  
  // إعداد وظائف التبادل
  setupExchangeFunctionality() {
    const dollarInput = document.getElementById('dollarAmount');
    const pointsInput = document.getElementById('pointsAmount');
    const pointsInputField = document.getElementById('pointsInput');
    const dollarsOutput = document.getElementById('dollarsOutput');
    const exchangeBtn = document.getElementById('exchangeBtn');
    const exchangeTabs = document.querySelectorAll('.exchange-tab');
    
    // تحديث قيمة النقاط عند تغيير قيمة الدولار (لتحويل إلى نقاط)
    if (dollarInput && pointsInput) {
      dollarInput.addEventListener('input', () => {
        const dollars = parseFloat(dollarInput.value) || 0;
        const points = Math.floor(dollars * 1000);
        pointsInput.value = points;
      });
    }
    
    // تحديث قيمة الدولار عند تغيير قيمة النقاط (لتحويل إلى دولار)
    if (pointsInputField && dollarsOutput) {
      pointsInputField.addEventListener('input', () => {
        const points = parseInt(pointsInputField.value) || 0;
        const dollars = (points / 1000).toFixed(2);
        dollarsOutput.value = dollars;
      });
    }
    
    // تبديل التبويبات
    if (exchangeTabs) {
      exchangeTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const direction = tab.getAttribute('data-direction');
          
          // تحديث التبويب النشط
          exchangeTabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          
          // تبديل النماذج
          if (direction === 'toPoints') {
            document.getElementById('toPointsForm').style.display = 'grid';
            document.getElementById('toDollarsForm').style.display = 'none';
            exchangeBtn.textContent = 'تحويل إلى نقاط';
          } else {
            document.getElementById('toPointsForm').style.display = 'none';
            document.getElementById('toDollarsForm').style.display = 'grid';
            exchangeBtn.textContent = 'تحويل إلى دولار';
          }
        });
      });
    }
    
    // معالجة عملية التحويل
    if (exchangeBtn) {
      exchangeBtn.addEventListener('click', () => this.handleExchange());
    }
  }
  
  // معالجة تحويل النقاط
  async handleExchange() {
    const activeTab = document.querySelector('.exchange-tab.active');
    const direction = activeTab.getAttribute('data-direction');
    
    if (direction === 'toPoints') {
      await this.handleConvertToPoints();
    } else {
      await this.handleConvertToDollars();
    }
  }
  
  // تحويل الدولار إلى نقاط
  async handleConvertToPoints() {
    const dollarAmount = parseFloat(document.getElementById('dollarAmount').value);
    
    if (!dollarAmount || dollarAmount <= 0) {
      Utils.showMessage('exchangeMessage', 'يرجى إدخال مبلغ صحيح', 'error');
      return;
    }
    
    const currentUser = this.authManager.getCurrentUser();
    if (!currentUser) return;
    
    if (dollarAmount > currentUser.balance) {
      Utils.showMessage('exchangeMessage', 'ليس لديك رصيد كافي بالدولار', 'error');
      return;
    }
    
    const pointsAmount = Math.floor(dollarAmount * 1000);
    
    try {
      // تحديث رصيد المستخدم
      const newBalance = currentUser.balance - dollarAmount;
      const newPoints = currentUser.points + pointsAmount;
      
      const result = await this.authManager.updateUserProfile(currentUser.user_id, {
        balance: newBalance,
        points: newPoints
      });
      
      if (result.success) {
        Utils.showMessage('exchangeMessage', `تم تحويل ${dollarAmount}$ إلى ${pointsAmount} نقطة بنجاح!`, 'success');
        
        // تحديث الحقول
        document.getElementById('dollarAmount').value = '';
        document.getElementById('pointsAmount').value = '';
        
        // تحديث معلومات المستخدم
        this.updateExchangeBalances();
      } else {
        Utils.showMessage('exchangeMessage', result.error, 'error');
      }
    } catch (error) {
      console.error('خطأ في تحويل النقاط:', error);
      Utils.showMessage('exchangeMessage', 'حدث خطأ أثناء عملية التحويل', 'error');
    }
  }
  
  // تحويل النقاط إلى دولار
  async handleConvertToDollars() {
    const pointsAmount = parseInt(document.getElementById('pointsInput').value);
    
    if (!pointsAmount || pointsAmount < 1000) {
      Utils.showMessage('exchangeMessage', 'الحد الأدنى للتحويل هو 1000 نقطة', 'error');
      return;
    }
    
    const currentUser = this.authManager.getCurrentUser();
    if (!currentUser) return;
    
    if (pointsAmount > currentUser.points) {
      Utils.showMessage('exchangeMessage', 'ليس لديك نقاط كافية', 'error');
      return;
    }
    
    const dollarAmount = (pointsAmount / 1000).toFixed(2);
    
    try {
      // تحديث رصيد المستخدم
      const newBalance = currentUser.balance + parseFloat(dollarAmount);
      const newPoints = currentUser.points - pointsAmount;
      
      const result = await this.authManager.updateUserProfile(currentUser.user_id, {
        balance: newBalance,
        points: newPoints
      });
      
      if (result.success) {
        Utils.showMessage('exchangeMessage', `تم تحويل ${pointsAmount} نقطة إلى ${dollarAmount}$ بنجاح!`, 'success');
        
        // تحديث الحقول
        document.getElementById('pointsInput').value = '';
        document.getElementById('dollarsOutput').value = '';
        
        // تحديث معلومات المستخدم
        this.updateExchangeBalances();
      } else {
        Utils.showMessage('exchangeMessage', result.error, 'error');
      }
    } catch (error) {
      console.error('خطأ في تحويل النقاط:', error);
      Utils.showMessage('exchangeMessage', 'حدث خطأ أثناء عملية التحويل', 'error');
    }
  }
  
  // تحديث أرصدة التبادل
  updateExchangeBalances() {
    const currentUser = this.authManager.getCurrentUser();
    if (!currentUser) return;
    
    const exchangeBalance = document.getElementById('exchangeBalance');
    const exchangePoints = document.getElementById('exchangePoints');
    
    if (exchangeBalance) {
      exchangeBalance.textContent = `${currentUser.balance.toFixed(2)} $`;
    }
    
    if (exchangePoints) {
      exchangePoints.textContent = `${currentUser.points} نقطة`;
    }
  }
  
  // تحميل بيانات قسم التبادل
  loadExchangeSection() {
    this.updateExchangeBalances();
    this.setupExchangeFunctionality();
  }
}