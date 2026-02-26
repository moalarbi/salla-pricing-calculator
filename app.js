// ============================================
// Pricing Calculator App
// ============================================

class PricingCalculator {
    constructor() {
        this.initializeElements();
        this.loadFromLocalStorage();
        this.attachEventListeners();
        this.calculate();
    }

    initializeElements() {
        // Fee Settings
        this.madaFee = document.getElementById('madaFee');
        this.visaFee = document.getElementById('visaFee');
        this.stcFee = document.getElementById('stcFee');
        this.tabbyFee = document.getElementById('tabbyFee');
        this.tamaraFee = document.getElementById('tamaraFee');
        this.fixedFee = document.getElementById('fixedFee');
        this.vatRate = document.getElementById('vatRate');

        // Mada Cap
        this.madaCapEnabled = document.getElementById('madaCapEnabled');
        this.madaCapContainer = document.getElementById('madaCapContainer');
        this.madaCap = document.getElementById('madaCap');

        // Product Data
        this.cogs = document.getElementById('cogs');
        this.shipping = document.getElementById('shipping');
        this.targetProfit = document.getElementById('targetProfit');

        // Payment Method
        this.paymentModeRadios = document.querySelectorAll('input[name="paymentMode"]');
        this.singleMethodRadios = document.querySelectorAll('input[name="singleMethod"]');
        this.singleMethodContainer = document.getElementById('singleMethodContainer');
        this.mixMethodContainer = document.getElementById('mixMethodContainer');

        // Payment Mix
        this.madaShare = document.getElementById('madaShare');
        this.visaShare = document.getElementById('visaShare');
        this.stcShare = document.getElementById('stcShare');
        this.tabbyShare = document.getElementById('tabbyShare');
        this.tamaraShare = document.getElementById('tamaraShare');
        this.shareError = document.getElementById('shareError');

        // Results
        this.recommendedPrice = document.getElementById('recommendedPrice');
        this.totalFeesDisplay = document.getElementById('totalFeesDisplay');
        this.netProfitDisplay = document.getElementById('netProfitDisplay');
        this.marginDisplay = document.getElementById('marginDisplay');

        // Fee Breakdown
        this.weightedFeePercent = document.getElementById('weightedFeePercent');
        this.gatewayFees = document.getElementById('gatewayFees');
        this.fixedFeeDisplay = document.getElementById('fixedFeeDisplay');
        this.feeTax = document.getElementById('feeTax');
        this.shippingDisplay = document.getElementById('shippingDisplay');
        this.totalDeducted = document.getElementById('totalDeducted');

        // Buttons
        this.calculateBtn = document.getElementById('calculateBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.defaultValuesBtn = document.getElementById('defaultValuesBtn');
        this.normalizeBtn = document.getElementById('normalizeBtn');


    }

    attachEventListeners() {
        // Fee Settings
        [this.madaFee, this.visaFee, this.stcFee, this.tabbyFee, this.tamaraFee, 
         this.fixedFee, this.vatRate].forEach(el => {
            el.addEventListener('input', () => this.calculate());
        });

        // Mada Cap
        this.madaCapEnabled.addEventListener('change', () => {
            this.madaCapContainer.style.display = this.madaCapEnabled.checked ? 'block' : 'none';
            this.calculate();
        });
        this.madaCap.addEventListener('input', () => this.calculate());

        // Product Data
        [this.cogs, this.shipping, this.targetProfit].forEach(el => {
            el.addEventListener('input', () => this.calculate());
        });

        // Payment Mode
        this.paymentModeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updatePaymentModeUI(e.target.value);
                this.calculate();
            });
        });

        // Single Method
        this.singleMethodRadios.forEach(radio => {
            radio.addEventListener('change', () => this.calculate());
        });

        // Payment Mix
        [this.madaShare, this.visaShare, this.stcShare, this.tabbyShare, this.tamaraShare].forEach(el => {
            el.addEventListener('input', () => this.validateShares());
        });

        // Buttons
        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.defaultValuesBtn.addEventListener('click', () => this.setDefaultValues());
        this.normalizeBtn.addEventListener('click', () => this.normalizeShares());
    }



    updatePaymentModeUI(mode) {
        if (mode === 'single') {
            this.singleMethodContainer.style.display = 'block';
            this.mixMethodContainer.style.display = 'none';
        } else {
            this.singleMethodContainer.style.display = 'none';
            this.mixMethodContainer.style.display = 'block';
        }
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
        this.calculate();
    }

    getWeightedFeeRate() {
        const paymentMode = document.querySelector('input[name="paymentMode"]:checked').value;

        if (paymentMode === 'single') {
            const method = document.querySelector('input[name="singleMethod"]:checked').value;
            const feeMap = {
                'mada': parseFloat(this.madaFee.value || 0),
                'visa': parseFloat(this.visaFee.value || 0),
                'stc': parseFloat(this.stcFee.value || 0),
                'tabby': parseFloat(this.tabbyFee.value || 0),
                'tamara': parseFloat(this.tamaraFee.value || 0)
            };
            return feeMap[method] / 100;
        } else {
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
    }

    calculate() {
        // Input values
        const C = parseFloat(this.cogs.value || 0);
        const SH = parseFloat(this.shipping.value || 0);
        const TP = parseFloat(this.targetProfit.value || 0);
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
        let gatewayFees = S * P;

        // Apply Mada Cap if enabled
        if (this.madaCapEnabled.checked) {
            const paymentMode = document.querySelector('input[name="paymentMode"]:checked').value;
            if (paymentMode === 'single') {
                const method = document.querySelector('input[name="singleMethod"]:checked').value;
                if (method === 'mada') {
                    const madaCap = parseFloat(this.madaCap.value || 0);
                    gatewayFees = Math.min(gatewayFees, madaCap);
                }
            } else {
                // For mix mode, apply cap only to mada portion
                const madaRate = parseFloat(this.madaFee.value || 0) / 100;
                const madaShare = parseFloat(this.madaShare.value || 0) / 100;
                const madaPortion = S * madaRate * madaShare;
                const madaCap = parseFloat(this.madaCap.value || 0);
                const cappedMadaPortion = Math.min(madaPortion, madaCap);
                const madaReduction = madaPortion - cappedMadaPortion;
                gatewayFees -= madaReduction;
            }
        }

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

        // Update Fee Breakdown
        this.weightedFeePercent.textContent = (P * 100).toFixed(2);
        this.gatewayFees.textContent = gatewayFees.toFixed(2);
        this.fixedFeeDisplay.textContent = F.toFixed(2);
        this.feeTax.textContent = feeTax.toFixed(2);
        this.shippingDisplay.textContent = SH.toFixed(2);
        this.totalDeducted.textContent = totalFees.toFixed(2);

        // Save to localStorage
        this.saveToLocalStorage();
    }

    setDefaultValues() {
        this.cogs.value = '100';
        this.shipping.value = '20';
        this.targetProfit.value = '50';
        this.calculate();
    }

    reset() {
        // Reset Fee Settings
        this.madaFee.value = '1';
        this.visaFee.value = '2.2';
        this.stcFee.value = '1.3';
        this.tabbyFee.value = '3.5';
        this.tamaraFee.value = '3.5';
        this.fixedFee.value = '1';
        this.vatRate.value = '15';

        // Reset Mada Cap
        this.madaCapEnabled.checked = false;
        this.madaCap.value = '200';
        this.madaCapContainer.style.display = 'none';

        // Reset Product Data
        this.cogs.value = '';
        this.shipping.value = '0';
        this.targetProfit.value = '0';

        // Reset Payment Method
        document.querySelector('input[name="paymentMode"][value="single"]').checked = true;
        document.querySelector('input[name="singleMethod"][value="mada"]').checked = true;
        this.updatePaymentModeUI('single');

        // Reset Payment Mix
        this.madaShare.value = '40';
        this.visaShare.value = '30';
        this.stcShare.value = '10';
        this.tabbyShare.value = '10';
        this.tamaraShare.value = '10';
        this.shareError.classList.remove('show');

        // Clear localStorage
        localStorage.clear();

        this.calculate();
    }

    saveToLocalStorage() {
        const data = {
            madaFee: this.madaFee.value,
            visaFee: this.visaFee.value,
            stcFee: this.stcFee.value,
            tabbyFee: this.tabbyFee.value,
            tamaraFee: this.tamaraFee.value,
            fixedFee: this.fixedFee.value,
            vatRate: this.vatRate.value,
            madaCapEnabled: this.madaCapEnabled.checked,
            madaCap: this.madaCap.value,
            cogs: this.cogs.value,
            shipping: this.shipping.value,
            targetProfit: this.targetProfit.value,
            paymentMode: document.querySelector('input[name="paymentMode"]:checked').value,
            singleMethod: document.querySelector('input[name="singleMethod"]:checked').value,
            madaShare: this.madaShare.value,
            visaShare: this.visaShare.value,
            stcShare: this.stcShare.value,
            tabbyShare: this.tabbyShare.value,
            tamaraShare: this.tamaraShare.value
        };
        localStorage.setItem('pricingCalculatorData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const data = localStorage.getItem('pricingCalculatorData');
        if (!data) return;

        const parsed = JSON.parse(data);

        // Load Fee Settings
        this.madaFee.value = parsed.madaFee || '1';
        this.visaFee.value = parsed.visaFee || '2.2';
        this.stcFee.value = parsed.stcFee || '1.3';
        this.tabbyFee.value = parsed.tabbyFee || '3.5';
        this.tamaraFee.value = parsed.tamaraFee || '3.5';
        this.fixedFee.value = parsed.fixedFee || '1';
        this.vatRate.value = parsed.vatRate || '15';

        // Load Mada Cap
        this.madaCapEnabled.checked = parsed.madaCapEnabled || false;
        this.madaCap.value = parsed.madaCap || '200';
        this.madaCapContainer.style.display = this.madaCapEnabled.checked ? 'block' : 'none';

        // Load Product Data
        this.cogs.value = parsed.cogs || '';
        this.shipping.value = parsed.shipping || '0';
        this.targetProfit.value = parsed.targetProfit || '0';

        // Load Payment Method
        const paymentMode = parsed.paymentMode || 'single';
        document.querySelector(`input[name="paymentMode"][value="${paymentMode}"]`).checked = true;
        this.updatePaymentModeUI(paymentMode);

        const singleMethod = parsed.singleMethod || 'mada';
        document.querySelector(`input[name="singleMethod"][value="${singleMethod}"]`).checked = true;

        // Load Payment Mix
        this.madaShare.value = parsed.madaShare || '40';
        this.visaShare.value = parsed.visaShare || '30';
        this.stcShare.value = parsed.stcShare || '10';
        this.tabbyShare.value = parsed.tabbyShare || '10';
        this.tamaraShare.value = parsed.tamaraShare || '10';
    }
}

// Initialize the calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PricingCalculator();
});
