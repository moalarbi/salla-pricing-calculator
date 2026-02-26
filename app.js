// ============================================
// Simplified Pricing Calculator App
// ============================================

class SimplePricingCalculator {
    constructor() {
        this.currentStep = 1;
        this.profitMode = 'percentage'; // 'percentage' or 'amount'
        
        this.initializeElements();
        this.loadFromLocalStorage();
        this.attachEventListeners();
        this.updateStepUI();
    }

    initializeElements() {
        // Step inputs
        this.productCostInput = document.getElementById('productCost');
        this.shippingCostInput = document.getElementById('shippingCost');
        this.profitSlider = document.getElementById('profitSlider');
        this.profitValue = document.getElementById('profitValue');
        this.profitAmount = document.getElementById('profitAmount');

        // Advanced settings - Fee inputs
        this.madaFee = document.getElementById('madaFee');
        this.visaFee = document.getElementById('visaFee');
        this.stcFee = document.getElementById('stcFee');
        this.tabbyFee = document.getElementById('tabbyFee');
        this.tamaraFee = document.getElementById('tamaraFee');
        this.fixedFee = document.getElementById('fixedFee');
        this.vatRate = document.getElementById('vatRate');

        // Advanced settings - Payment mix
        this.madaShare = document.getElementById('madaShare');
        this.visaShare = document.getElementById('visaShare');
        this.stcShare = document.getElementById('stcShare');
        this.tabbyShare = document.getElementById('tabbyShare');
        this.tamaraShare = document.getElementById('tamaraShare');
        this.shareError = document.getElementById('shareError');

        // Result display
        this.recommendedPrice = document.getElementById('recommendedPrice');
        this.totalFeesDisplay = document.getElementById('totalFeesDisplay');
        this.netProfitDisplay = document.getElementById('netProfitDisplay');
        this.marginDisplay = document.getElementById('marginDisplay');

        // UI elements
        this.resultSection = document.getElementById('resultSection');
        this.advancedContent = document.getElementById('advancedContent');
        this.paymentMixContent = document.getElementById('paymentMixContent');
        this.nextBtn = document.getElementById('nextBtn');
        this.prevBtn = document.getElementById('prevBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.normalizeBtn = document.getElementById('normalizeBtn');
        this.advancedToggle = document.getElementById('advancedToggle');
        this.paymentMixToggle = document.getElementById('paymentMixToggle');
    }

    attachEventListeners() {
        // Step inputs
        this.productCostInput.addEventListener('input', () => this.calculate());
        this.shippingCostInput.addEventListener('input', () => this.calculate());
        this.profitSlider.addEventListener('input', () => {
            this.profitValue.textContent = this.profitSlider.value;
            this.calculate();
        });
        this.profitAmount.addEventListener('input', () => this.calculate());

        // Profit mode toggle
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchProfitMode(e.target.dataset.mode));
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const value = e.target.dataset.value;
                this.profitSlider.value = value;
                this.profitValue.textContent = value;
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.calculate();
            });
        });

        // Advanced settings
        this.madaFee.addEventListener('input', () => this.calculate());
        this.visaFee.addEventListener('input', () => this.calculate());
        this.stcFee.addEventListener('input', () => this.calculate());
        this.tabbyFee.addEventListener('input', () => this.calculate());
        this.tamaraFee.addEventListener('input', () => this.calculate());
        this.fixedFee.addEventListener('input', () => this.calculate());
        this.vatRate.addEventListener('input', () => this.calculate());

        // Payment mix
        [this.madaShare, this.visaShare, this.stcShare, this.tabbyShare, this.tamaraShare].forEach(el => {
            el.addEventListener('input', () => this.validateShares());
        });

        // Navigation buttons
        this.nextBtn.addEventListener('click', () => this.nextStep());
        this.prevBtn.addEventListener('click', () => this.prevStep());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.normalizeBtn.addEventListener('click', () => this.normalizeShares());

        // Advanced settings toggle
        this.advancedToggle.addEventListener('click', () => {
            this.advancedToggle.classList.toggle('open');
            this.advancedContent.style.display = 
                this.advancedContent.style.display === 'none' ? 'block' : 'none';
        });

        // Payment mix toggle
        this.paymentMixToggle.addEventListener('click', () => {
            this.paymentMixToggle.classList.toggle('open');
            this.paymentMixContent.style.display = 
                this.paymentMixContent.style.display === 'none' ? 'block' : 'none';
        });
    }

    switchProfitMode(mode) {
        this.profitMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');

        document.getElementById('percentageMode').style.display = mode === 'percentage' ? 'block' : 'none';
        document.getElementById('amountMode').style.display = mode === 'amount' ? 'block' : 'none';

        this.calculate();
    }

    nextStep() {
        if (this.currentStep < 3) {
            this.currentStep++;
            this.updateStepUI();
        } else {
            // On step 3, show result
            this.calculate();
            this.showResult();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepUI();
        }
    }

    updateStepUI() {
        // Update step sections
        document.querySelectorAll('.step-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelector(`[data-step="${this.currentStep}"]`).classList.add('active');

        // Update step indicator
        document.querySelectorAll('.step-item').forEach((item, index) => {
            item.classList.remove('active');
            if (index + 1 <= this.currentStep) {
                item.classList.add('active');
            }
        });

        // Update navigation buttons
        this.prevBtn.style.display = this.currentStep > 1 ? 'block' : 'none';
        this.nextBtn.textContent = this.currentStep === 3 ? 'عرض النتيجة' : 'التالي';

        // Hide result section when not on step 3
        if (this.currentStep < 3) {
            this.resultSection.style.display = 'none';
        }

        this.saveToLocalStorage();
    }

    showResult() {
        this.resultSection.style.display = 'block';
        this.nextBtn.style.display = 'none';
        this.prevBtn.style.display = 'block';
        this.calculate();
    }

    getWeightedFeeRate() {
        const madaRate = parseFloat(this.madaFee.value || 0) / 100;
        const visaRate = parseFloat(this.visaFee.value || 0) / 100;
        const stcRate = parseFloat(this.stcFee.value || 0) / 100;
        const tabbyRate = parseFloat(this.tabbyFee.value || 0) / 100;
        const tamaraRate = parseFloat(this.tamaraFee.value || 0) / 100;

        const madaShare = parseFloat(this.madaShare.value || 0) / 100;
        const visaShare = parseFloat(this.visaShare.value || 0) / 100;
        const stcShare = parseFloat(this.stcShare.value || 0) / 100;
        const tabbyShare = parseFloat(this.tabbyShare.value || 0) / 100;
        const tamaraShare = parseFloat(this.tamaraShare.value || 0) / 100;

        return (madaRate * madaShare) + (visaRate * visaShare) + 
               (stcRate * stcShare) + (tabbyRate * tabbyShare) + 
               (tamaraRate * tamaraShare);
    }

    calculate() {
        // Input values
        const C = parseFloat(this.productCostInput.value || 0);
        const SH = parseFloat(this.shippingCostInput.value || 0);
        
        // Determine target profit
        let TP = 0;
        if (this.profitMode === 'percentage') {
            const profitPercent = parseFloat(this.profitSlider.value || 0) / 100;
            TP = (C + SH) * profitPercent;
        } else {
            TP = parseFloat(this.profitAmount.value || 0);
        }

        const F = parseFloat(this.fixedFee.value || 0);
        const VAT = parseFloat(this.vatRate.value || 0) / 100;

        // Get weighted fee rate
        const P = this.getWeightedFeeRate();

        // Validate inputs
        if (C < 0 || SH < 0 || TP < 0 || F < 0) {
            this.recommendedPrice.textContent = '0.00';
            this.totalFeesDisplay.textContent = '0.00 ريال';
            this.netProfitDisplay.textContent = '0.00 ريال';
            this.marginDisplay.textContent = '0.00%';
            return;
        }

        // Calculate Recommended Selling Price
        // S = (C + SH + (F*(1+VAT)) + TP) / (1 - (P*(1+VAT)))
        const denominator = 1 - (P * (1 + VAT));
        
        if (denominator <= 0) {
            this.recommendedPrice.textContent = '∞';
            this.totalFeesDisplay.textContent = '0.00 ريال';
            this.netProfitDisplay.textContent = '0.00 ريال';
            this.marginDisplay.textContent = '0.00%';
            return;
        }

        const S = (C + SH + (F * (1 + VAT)) + TP) / denominator;

        // Calculate Total Fees
        const gatewayFees = S * P;
        const feeTax = gatewayFees * VAT + F * VAT;
        const totalFees = gatewayFees + feeTax + F;

        // Calculate Net Profit
        const netProfit = S - C - SH - totalFees;
        const margin = S > 0 ? (netProfit / S) * 100 : 0;

        // Update Display
        this.recommendedPrice.textContent = S.toFixed(2);
        this.totalFeesDisplay.textContent = totalFees.toFixed(2) + ' ريال';
        this.netProfitDisplay.textContent = netProfit.toFixed(2) + ' ريال';
        this.marginDisplay.textContent = margin.toFixed(2) + '%';

        // Save to localStorage
        this.saveToLocalStorage();
    }

    validateShares() {
        const total = parseFloat(this.madaShare.value || 0) +
                     parseFloat(this.visaShare.value || 0) +
                     parseFloat(this.stcShare.value || 0) +
                     parseFloat(this.tabbyShare.value || 0) +
                     parseFloat(this.tamaraShare.value || 0);

        if (Math.abs(total - 100) > 0.01) {
            this.shareError.textContent = `⚠️ مجموع النسب = ${total.toFixed(2)}% (يجب أن يكون 100%)`;
            this.shareError.classList.add('show');
        } else {
            this.shareError.classList.remove('show');
        }

        this.calculate();
    }

    normalizeShares() {
        const total = parseFloat(this.madaShare.value || 0) +
                     parseFloat(this.visaShare.value || 0) +
                     parseFloat(this.stcShare.value || 0) +
                     parseFloat(this.tabbyShare.value || 0) +
                     parseFloat(this.tamaraShare.value || 0);

        if (total === 0) {
            alert('الرجاء إدخال قيم أكبر من صفر');
            return;
        }

        const factor = 100 / total;
        this.madaShare.value = (parseFloat(this.madaShare.value || 0) * factor).toFixed(2);
        this.visaShare.value = (parseFloat(this.visaShare.value || 0) * factor).toFixed(2);
        this.stcShare.value = (parseFloat(this.stcShare.value || 0) * factor).toFixed(2);
        this.tabbyShare.value = (parseFloat(this.tabbyShare.value || 0) * factor).toFixed(2);
        this.tamaraShare.value = (parseFloat(this.tamaraShare.value || 0) * factor).toFixed(2);

        this.validateShares();
    }

    reset() {
        // Reset step
        this.currentStep = 1;
        
        // Reset inputs
        this.productCostInput.value = '';
        this.shippingCostInput.value = '0';
        this.profitSlider.value = '20';
        this.profitValue.textContent = '20';
        this.profitAmount.value = '';

        // Reset profit mode
        this.profitMode = 'percentage';
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-mode="percentage"]').classList.add('active');
        document.getElementById('percentageMode').style.display = 'block';
        document.getElementById('amountMode').style.display = 'none';

        // Reset preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-value="30"]').classList.add('active');

        // Reset advanced settings
        this.madaFee.value = '1';
        this.visaFee.value = '2.2';
        this.stcFee.value = '1.3';
        this.tabbyFee.value = '3.5';
        this.tamaraFee.value = '3.5';
        this.fixedFee.value = '1';
        this.vatRate.value = '15';

        // Reset payment mix
        this.madaShare.value = '40';
        this.visaShare.value = '30';
        this.stcShare.value = '10';
        this.tabbyShare.value = '10';
        this.tamaraShare.value = '10';
        this.shareError.classList.remove('show');

        // Reset UI
        this.advancedToggle.classList.remove('open');
        this.advancedContent.style.display = 'none';
        this.paymentMixToggle.classList.remove('open');
        this.paymentMixContent.style.display = 'none';
        this.resultSection.style.display = 'none';

        // Clear localStorage
        localStorage.clear();

        // Update UI
        this.updateStepUI();
    }

    saveToLocalStorage() {
        const data = {
            currentStep: this.currentStep,
            profitMode: this.profitMode,
            productCost: this.productCostInput.value,
            shippingCost: this.shippingCostInput.value,
            profitSlider: this.profitSlider.value,
            profitAmount: this.profitAmount.value,
            madaFee: this.madaFee.value,
            visaFee: this.visaFee.value,
            stcFee: this.stcFee.value,
            tabbyFee: this.tabbyFee.value,
            tamaraFee: this.tamaraFee.value,
            fixedFee: this.fixedFee.value,
            vatRate: this.vatRate.value,
            madaShare: this.madaShare.value,
            visaShare: this.visaShare.value,
            stcShare: this.stcShare.value,
            tabbyShare: this.tabbyShare.value,
            tamaraShare: this.tamaraShare.value
        };
        localStorage.setItem('simplePricingCalculatorData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('simplePricingCalculatorData');
        if (!data) return;

        const parsed = JSON.parse(data);

        // Load step data
        this.currentStep = parsed.currentStep || 1;
        this.profitMode = parsed.profitMode || 'percentage';

        // Load inputs
        this.productCostInput.value = parsed.productCost || '';
        this.shippingCostInput.value = parsed.shippingCost || '0';
        this.profitSlider.value = parsed.profitSlider || '20';
        this.profitValue.textContent = this.profitSlider.value;
        this.profitAmount.value = parsed.profitAmount || '';

        // Load advanced settings
        this.madaFee.value = parsed.madaFee || '1';
        this.visaFee.value = parsed.visaFee || '2.2';
        this.stcFee.value = parsed.stcFee || '1.3';
        this.tabbyFee.value = parsed.tabbyFee || '3.5';
        this.tamaraFee.value = parsed.tamaraFee || '3.5';
        this.fixedFee.value = parsed.fixedFee || '1';
        this.vatRate.value = parsed.vatRate || '15';

        // Load payment mix
        this.madaShare.value = parsed.madaShare || '40';
        this.visaShare.value = parsed.visaShare || '30';
        this.stcShare.value = parsed.stcShare || '10';
        this.tabbyShare.value = parsed.tabbyShare || '10';
        this.tamaraShare.value = parsed.tamaraShare || '10';

        // Restore profit mode UI
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-mode="${this.profitMode}"]`).classList.add('active');
        document.getElementById('percentageMode').style.display = this.profitMode === 'percentage' ? 'block' : 'none';
        document.getElementById('amountMode').style.display = this.profitMode === 'amount' ? 'block' : 'none';

        // Restore preset button state
        document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
        const activePreset = document.querySelector(`[data-value="${this.profitSlider.value}"]`);
        if (activePreset) activePreset.classList.add('active');
    }
}

// Initialize the calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new SimplePricingCalculator();
});
