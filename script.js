class MortgageCalculator {
    constructor() {
        this.chart = null;
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.form = document.getElementById('calculator-form');
        this.loanAmountInput = document.getElementById('loanAmount');
        this.loanYearsInput = document.getElementById('loanYears');
        this.interestRateInput = document.getElementById('interestRate');
        this.loanAmountRange = document.getElementById('loanAmountRange');
        this.loanYearsRange = document.getElementById('loanYearsRange');
        this.interestRateRange = document.getElementById('interestRateRange');
        this.monthlyPaymentDisplay = document.getElementById('monthlyPayment');
        this.totalInterestDisplay = document.getElementById('totalInterest');
        this.totalPaymentDisplay = document.getElementById('totalPayment');
        this.scheduleTable = document.getElementById('scheduleTable').querySelector('tbody');
        this.exportBtn = document.getElementById('exportBtn');
        this.canvas = document.getElementById('paymentChart');
        
        // 新增：公积金贷款元素
        this.providentAmountInput = document.getElementById('providentAmount');
        this.providentRateInput = document.getElementById('providentRate');
        this.providentAmountRange = document.getElementById('providentAmountRange');
        this.providentRateRange = document.getElementById('providentRateRange');
        this.providentLoanGroup = document.getElementById('provident-loan-group');
        
        // 新增：提前还款元素
        this.enablePrepaymentCheckbox = document.getElementById('enablePrepayment');
        this.prepaymentOptionsDiv = document.getElementById('prepayment-options');
        this.prepaymentMonthInput = document.getElementById('prepaymentMonth');
        this.prepaymentAmountInput = document.getElementById('prepaymentAmount');
        this.prepaymentResultsDiv = document.getElementById('prepayment-results');
        this.newMonthlyPaymentDisplay = document.getElementById('newMonthlyPayment');
        this.savedInterestDisplay = document.getElementById('savedInterest');
        this.savedTotalDisplay = document.getElementById('savedTotal');
        this.prepaymentSummary = document.getElementById('prepayment-summary');
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.exportBtn.addEventListener('click', () => this.exportSchedule());
        
        // 贷款类型切换
        document.querySelectorAll('input[name="loanType"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleLoanTypeChange());
        });
        
        // 商业贷款滑块与输入框同步
        this.loanAmountInput.addEventListener('input', () => {
            this.loanAmountRange.value = this.loanAmountInput.value;
        });
        
        this.loanYearsInput.addEventListener('input', () => {
            this.loanYearsRange.value = this.loanYearsInput.value;
        });
        
        this.interestRateInput.addEventListener('input', () => {
            this.interestRateRange.value = this.interestRateInput.value;
        });
        
        this.loanAmountRange.addEventListener('input', () => {
            this.loanAmountInput.value = this.loanAmountRange.value;
        });
        
        this.loanYearsRange.addEventListener('input', () => {
            this.loanYearsInput.value = this.loanYearsRange.value;
        });
        
        this.interestRateRange.addEventListener('input', () => {
            this.interestRateInput.value = this.interestRateRange.value;
        });
        
        // 公积金贷款滑块与输入框同步
        this.providentAmountInput.addEventListener('input', () => {
            this.providentAmountRange.value = this.providentAmountInput.value;
        });
        
        this.providentRateInput.addEventListener('input', () => {
            this.providentRateRange.value = this.providentRateInput.value;
        });
        
        this.providentAmountRange.addEventListener('input', () => {
            this.providentAmountInput.value = this.providentAmountRange.value;
        });
        
        this.providentRateRange.addEventListener('input', () => {
            this.providentRateInput.value = this.providentRateRange.value;
        });
        
        // 提前还款选项
        this.enablePrepaymentCheckbox.addEventListener('change', () => {
            this.prepaymentOptionsDiv.style.display = this.enablePrepaymentCheckbox.checked ? 'block' : 'none';
        });
    }

    handleLoanTypeChange() {
        const loanType = document.querySelector('input[name="loanType"]:checked').value;
        
        if (loanType === 'commercial') {
            // 纯商业贷款：隐藏公积金选项
            this.providentLoanGroup.style.display = 'none';
            this.loanAmountInput.disabled = false;
        } else if (loanType === 'provident') {
            // 纯公积金贷款：显示公积金选项，禁用商业贷款金额
            this.providentLoanGroup.style.display = 'block';
            this.loanAmountInput.disabled = true;
            this.loanAmountInput.value = 0;
            this.loanAmountInput.parentElement.querySelector('.unit').textContent = '万（不适用）';
        } else if (loanType === 'combined') {
            // 组合贷款：显示公积金选项，启用商业贷款金额
            this.providentLoanGroup.style.display = 'block';
            this.loanAmountInput.disabled = false;
            this.loanAmountInput.parentElement.querySelector('.unit').textContent = '万';
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const loanType = document.querySelector('input[name="loanType"]:checked').value;
        const repaymentMethod = document.querySelector('input[name="repaymentMethod"]:checked').value;
        
        let commercialAmount = 0;
        let providentAmount = 0;
        let commercialRate = 0;
        let providentRate = 0;
        
        // 解析商业贷款
        if (loanType === 'commercial' || loanType === 'combined') {
            commercialAmount = parseFloat(this.loanAmountInput.value) * 10000;
            commercialRate = parseFloat(this.interestRateInput.value) / 100;
        }
        
        // 解析公积金贷款
        if (loanType === 'provident' || loanType === 'combined') {
            providentAmount = parseFloat(this.providentAmountInput.value) * 10000;
            providentRate = parseFloat(this.providentRateInput.value) / 100;
        }
        
        const totalLoanAmount = commercialAmount + providentAmount;
        const loanYears = parseInt(this.loanYearsInput.value);
        
        // 验证输入
        if (totalLoanAmount <= 0) {
            alert('请输入有效的贷款金额');
            return;
        }
        if (loanYears <= 0) {
            alert('请输入有效的贷款期限');
            return;
        }
        if (commercialAmount > 0 && commercialRate <= 0) {
            alert('请输入有效的商业贷款利率');
            return;
        }
        if (providentAmount > 0 && providentRate <= 0) {
            alert('请输入有效的公积金贷款利率');
            return;
        }
        
        // 计算商业贷款和公积金贷款
        let commercialResults = null;
        let providentResults = null;
        
        if (commercialAmount > 0) {
            commercialResults = repaymentMethod === 'equal' 
                ? this.calculateEqualPayment(commercialAmount, loanYears, commercialRate)
                : this.calculateEqualPrincipal(commercialAmount, loanYears, commercialRate);
        }
        
        if (providentAmount > 0) {
            providentResults = repaymentMethod === 'equal'
                ? this.calculateEqualPayment(providentAmount, loanYears, providentRate)
                : this.calculateEqualPrincipal(providentAmount, loanYears, providentRate);
        }
        
        // 合并结果
        const combinedResults = this.combineResults(commercialResults, providentResults, loanType);
        
        this.displayResults(combinedResults);
        this.displayChart(combinedResults);
        this.displaySchedule(combinedResults.schedule);
        this.exportBtn.style.display = 'block';
        
        // 处理提前还款
        if (this.enablePrepaymentCheckbox.checked) {
            this.calculatePrepayment(combinedResults, loanYears);
        } else {
            this.prepaymentResultsDiv.style.display = 'none';
        }
    }

    combineResults(commercial, provident, loanType) {
        if (loanType === 'commercial') {
            return commercial;
        } else if (loanType === 'provident') {
            return provident;
        } else {
            // 组合贷款：合并两部分结果
            const totalMonths = commercial.schedule.length;
            const combinedSchedule = [];
            
            for (let i = 0; i < totalMonths; i++) {
                combinedSchedule.push({
                    month: i + 1,
                    monthlyPayment: commercial.schedule[i].monthlyPayment + provident.schedule[i].monthlyPayment,
                    principal: commercial.schedule[i].principal + provident.schedule[i].principal,
                    interest: commercial.schedule[i].interest + provident.schedule[i].interest,
                    remainingPrincipal: commercial.schedule[i].remainingPrincipal + provident.schedule[i].remainingPrincipal
                });
            }
            
            const firstMonthPayment = combinedSchedule[0].monthlyPayment;
            const lastMonthPayment = combinedSchedule[combinedSchedule.length - 1].monthlyPayment;
            
            return {
                monthlyPayment: firstMonthPayment,
                lastMonthlyPayment: lastMonthPayment !== firstMonthPayment ? lastMonthPayment : null,
                totalPayment: commercial.totalPayment + provident.totalPayment,
                totalInterest: commercial.totalInterest + provident.totalInterest,
                schedule: combinedSchedule,
                loanType: 'combined',
                commercialInterest: commercial.totalInterest,
                providentInterest: provident.totalInterest
            };
        }
    }

    calculatePrepayment(originalResults, loanYears) {
        const prepaymentMonth = parseInt(this.prepaymentMonthInput.value);
        const prepaymentAmount = parseFloat(this.prepaymentAmountInput.value) * 10000;
        const prepaymentMethod = document.querySelector('input[name="prepaymentMethod"]:checked').value;
        const schedule = originalResults.schedule;
        
        if (prepaymentMonth > schedule.length) {
            alert('提前还款月份超过贷款期限');
            return;
        }
        
        // 获取提前还款时的剩余本金
        const remainingPrincipalBefore = schedule[prepaymentMonth - 1].remainingPrincipal;
        const remainingPrincipalAfter = Math.max(0, remainingPrincipalBefore - prepaymentAmount);
        
        if (remainingPrincipalAfter <= 0) {
            alert('提前还款金额超过剩余本金');
            return;
        }
        
        const originalMonthlyPayment = originalResults.monthlyPayment;
        const originalTotalInterest = originalResults.totalInterest;
        const originalTotalPayment = originalResults.totalPayment;
        
        let newSchedule = [];
        let newTotalInterest = 0;
        let newTotalPayment = 0;
        let newMonthlyPayment = 0;
        
        if (prepaymentMethod === 'reduce-term') {
            // 缩短期限：月供不变
            newMonthlyPayment = originalMonthlyPayment;
            const monthlyRate = parseFloat(this.interestRateInput.value) / 100 / 12;
            
            // 计算新的还款期限
            let remaining = remainingPrincipalAfter;
            let month = prepaymentMonth;
            
            while (remaining > 0.01 && month < schedule.length * 2) {
                const interest = remaining * monthlyRate;
                const principal = Math.min(newMonthlyPayment - interest, remaining);
                remaining -= principal;
                newTotalPayment += newMonthlyPayment;
                newTotalInterest += interest;
                month++;
            }
            
            newSchedule = this.generateNewSchedule(schedule, prepaymentMonth, newMonthlyPayment, remainingPrincipalAfter);
        } else {
            // 减少月供：期限不变
            const remainingMonths = schedule.length - prepaymentMonth;
            const monthlyRate = parseFloat(this.interestRateInput.value) / 100 / 12;
            
            // 计算新的月供（等额本息公式）
            if (document.querySelector('input[name="repaymentMethod"]:checked').value === 'equal') {
                newMonthlyPayment = remainingPrincipalAfter * monthlyRate * Math.pow(1 + monthlyRate, remainingMonths) 
                                   / (Math.pow(1 + monthlyRate, remainingMonths) - 1);
            } else {
                // 等额本金：重新计算
                newSchedule = this.generateNewSchedulePrincipal(schedule, prepaymentMonth, remainingPrincipalAfter, remainingMonths, monthlyRate);
                newTotalInterest = newSchedule.reduce((sum, row) => sum + row.interest, 0);
                newTotalPayment = newSchedule.reduce((sum, row) => sum + row.monthlyPayment, 0);
                newMonthlyPayment = newSchedule[0].monthlyPayment;
            }
            
            if (document.querySelector('input[name="repaymentMethod"]:checked').value === 'equal') {
                newSchedule = this.generateNewSchedule(schedule, prepaymentMonth, newMonthlyPayment, remainingPrincipalAfter);
                newTotalPayment = originalResults.schedule.slice(0, prepaymentMonth).reduce((sum, row) => sum + row.monthlyPayment, 0)
                              + newMonthlyPayment * remainingMonths;
                newTotalInterest = newTotalPayment - (parseFloat(this.loanAmountInput.value) * 10000 + parseFloat(this.providentAmountInput.value) * 10000 - prepaymentAmount);
            }
        }
        
        const savedInterest = originalTotalInterest - newTotalInterest;
        const savedTotal = savedInterest; // 提前还款主要节省利息
        
        // 显示提前还款结果
        this.newMonthlyPaymentDisplay.textContent = this.formatCurrency(newMonthlyPayment);
        this.savedInterestDisplay.textContent = this.formatCurrency(Math.max(0, savedInterest));
        this.savedTotalDisplay.textContent = this.formatCurrency(Math.max(0, savedTotal));
        
        const newTotalMonths = prepaymentMethod === 'reduce-term' 
            ? Math.round((remainingPrincipalAfter / newMonthlyPayment) * (1 + parseFloat(this.interestRateInput.value) / 100 / 12 * 12)) + prepaymentMonth
            : schedule.length;
        
        this.prepaymentSummary.textContent = 
            `在第${prepaymentMonth}个月提前还款${this.formatCurrency(prepaymentAmount)}后，${prepaymentMethod === 'reduce-term' ? '还款期限从' + schedule.length + '个月缩短至约' + newTotalMonths + '个月' : '月供从' + this.formatCurrency(originalMonthlyPayment) + '降至' + this.formatCurrency(newMonthlyPayment)}，共节省${this.formatCurrency(savedInterest)}利息`;
        
        this.prepaymentResultsDiv.style.display = 'block';
    }

    generateNewSchedule(originalSchedule, prepaymentMonth, newMonthlyPayment, remainingPrincipal) {
        const newSchedule = [];
        const monthlyRate = parseFloat(this.interestRateInput.value) / 100 / 12;
        let remaining = remainingPrincipal;
        
        for (let i = 0; i < prepaymentMonth; i++) {
            newSchedule.push({...originalSchedule[i]});
        }
        
        let month = prepaymentMonth;
        while (remaining > 0.01 && month < originalSchedule.length * 2) {
            const interest = remaining * monthlyRate;
            const principal = Math.min(newMonthlyPayment - interest, remaining);
            remaining -= principal;
            
            newSchedule.push({
                month: month + 1,
                monthlyPayment: newMonthlyPayment,
                principal: principal,
                interest: interest,
                remainingPrincipal: Math.max(0, remaining)
            });
            month++;
        }
        
        return newSchedule;
    }

    generateNewSchedulePrincipal(originalSchedule, prepaymentMonth, remainingPrincipal, remainingMonths, monthlyRate) {
        const newSchedule = [];
        let remaining = remainingPrincipal;
        const principalPerMonth = remainingPrincipal / remainingMonths;
        
        for (let i = 0; i < prepaymentMonth; i++) {
            newSchedule.push({...originalSchedule[i]});
        }
        
        for (let month = 0; month < remainingMonths; month++) {
            const interest = remaining * monthlyRate;
            const monthlyPayment = principalPerMonth + interest;
            remaining -= principalPerMonth;
            
            newSchedule.push({
                month: prepaymentMonth + month + 1,
                monthlyPayment,
                principal: principalPerMonth,
                interest,
                remainingPrincipal: Math.max(0, remaining)
            });
        }
        
        return newSchedule;
    }

    calculateEqualPayment(loanAmount, loanYears, annualRate) {
        const monthlyRate = annualRate / 12;
        const totalMonths = loanYears * 12;
        
        const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / 
                              (Math.pow(1 + monthlyRate, totalMonths) - 1);
        
        const totalPayment = monthlyPayment * totalMonths;
        const totalInterest = totalPayment - loanAmount;
        
        const schedule = [];
        let remainingPrincipal = loanAmount;
        
        for (let month = 1; month <= totalMonths; month++) {
            const interest = remainingPrincipal * monthlyRate;
            const principal = monthlyPayment - interest;
            remainingPrincipal -= principal;
            
            schedule.push({
                month,
                monthlyPayment,
                principal,
                interest,
                remainingPrincipal: Math.max(0, remainingPrincipal)
            });
        }
        
        return { monthlyPayment, totalPayment, totalInterest, schedule };
    }

    calculateEqualPrincipal(loanAmount, loanYears, annualRate) {
        const monthlyRate = annualRate / 12;
        const totalMonths = loanYears * 12;
        
        const principalPerMonth = loanAmount / totalMonths;
        
        let totalPayment = 0;
        let totalInterest = 0;
        const schedule = [];
        let remainingPrincipal = loanAmount;
        
        for (let month = 1; month <= totalMonths; month++) {
            const interest = remainingPrincipal * monthlyRate;
            const monthlyPayment = principalPerMonth + interest;
            remainingPrincipal -= principalPerMonth;
            
            totalPayment += monthlyPayment;
            totalInterest += interest;
            
            schedule.push({
                month,
                monthlyPayment,
                principal: principalPerMonth,
                interest,
                remainingPrincipal: Math.max(0, remainingPrincipal)
            });
        }
        
        return { 
            monthlyPayment: schedule[0].monthlyPayment, 
            lastMonthlyPayment: schedule[schedule.length - 1].monthlyPayment,
            totalPayment, 
            totalInterest, 
            schedule 
        };
    }

    displayResults(results) {
        this.monthlyPaymentDisplay.textContent = this.formatCurrency(results.monthlyPayment);
        
        if (results.lastMonthlyPayment) {
            this.monthlyPaymentDisplay.textContent += ' - ' + this.formatCurrency(results.lastMonthlyPayment);
            this.monthlyPaymentDisplay.style.fontSize = '1.3rem';
        } else {
            this.monthlyPaymentDisplay.style.fontSize = '1.8rem';
        }
        
        this.totalInterestDisplay.textContent = this.formatCurrency(results.totalInterest);
        this.totalPaymentDisplay.textContent = this.formatCurrency(results.totalPayment);
        
        // 如果是组合贷款，显示利息构成
        if (results.loanType === 'combined') {
            const commercialInterestPercent = ((results.commercialInterest / results.totalInterest) * 100).toFixed(1);
            const providentInterestPercent = ((results.providentInterest / results.totalInterest) * 100).toFixed(1);
            this.totalInterestDisplay.title = `商业贷款利息: ${this.formatCurrency(results.commercialInterest)} (${commercialInterestPercent}%)\n公积金贷款利息: ${this.formatCurrency(results.providentInterest)} (${providentInterestPercent}%)`;
        }
    }

    displayChart(results) {
        const ctx = this.canvas.getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }
        
        const totalPrincipal = results.schedule[0].remainingPrincipal + results.schedule[0].principal;
        const totalInterest = results.totalInterest;
        
        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['本金', '利息'],
                datasets: [{
                    data: [totalPrincipal, totalInterest],
                    backgroundColor: ['#3b82f6', '#f59e0b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const value = context.parsed;
                                const percentage = ((value / (totalPrincipal + totalInterest)) * 100).toFixed(1);
                                return `${context.label}: ${this.formatCurrency(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    displaySchedule(schedule) {
        this.scheduleTable.innerHTML = '';
        
        schedule.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.month}</td>
                <td>${this.formatCurrency(row.monthlyPayment)}</td>
                <td>${this.formatCurrency(row.principal)}</td>
                <td>${this.formatCurrency(row.interest)}</td>
                <td>${this.formatCurrency(row.remainingPrincipal)}</td>
            `;
            this.scheduleTable.appendChild(tr);
        });
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: 'CNY',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(value);
    }

    exportSchedule() {
        const table = document.getElementById('scheduleTable');
        
        let csv = '期数,月供,本金,利息,剩余本金\n';
        
        for (const row of this.scheduleTable.querySelectorAll('tr')) {
            const cells = row.querySelectorAll('td');
            if (cells.length === 5) {
                const rowData = Array.from(cells).map(cell => 
                    cell.textContent.replace(/,/g, '').replace(/¥/g, '').replace(/,/g, '')
                ).join(',');
                csv += rowData + '\n';
            }
        }
        
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', '房贷还款计划表.csv');
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new MortgageCalculator();
});
