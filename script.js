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
    }

    attachEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.exportBtn.addEventListener('click', () => this.exportSchedule());
        
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
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const loanAmount = parseFloat(this.loanAmountInput.value) * 10000;
        const loanYears = parseInt(this.loanYearsInput.value);
        const annualRate = parseFloat(this.interestRateInput.value) / 100;
        const repaymentMethod = document.querySelector('input[name="repaymentMethod"]:checked').value;
        
        if (isNaN(loanAmount) || isNaN(loanYears) || isNaN(annualRate)) {
            alert('请输入有效的数值');
            return;
        }
        
        if (loanAmount <= 0 || loanYears <= 0 || annualRate <= 0) {
            alert('请输入大于0的数值');
            return;
        }
        
        const results = repaymentMethod === 'equal' 
            ? this.calculateEqualPayment(loanAmount, loanYears, annualRate)
            : this.calculateEqualPrincipal(loanAmount, loanYears, annualRate);
        
        this.displayResults(results);
        this.displayChart(results);
        this.displaySchedule(results.schedule);
        this.exportBtn.style.display = 'block';
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
