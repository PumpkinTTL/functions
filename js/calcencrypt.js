// 加密货币交易收益计算器 Vue 应用
const { createApp } = Vue;

createApp({
    data() {
        return {
            // 交易类型：spot（现货）或 contract（合约）
            tradeType: 'spot',
            
            // 输入参数
            entryPrice: null,      // 进场价格
            exitPrice: null,       // 出场价格
            investmentAmount: null, // 投资金额
            leverage: 1,           // 杠杆倍数（仅合约交易）
            positionType: 'long',  // 持仓方向：long（做多）或 short（做空）
            tradingFee: 0.1        // 交易手续费百分比
        };
    },
    
    computed: {
        // 验证输入是否有效
        isValidInput() {
            return this.entryPrice > 0 && 
                   this.exitPrice > 0 && 
                   this.investmentAmount > 0 &&
                   this.tradingFee >= 0;
        },
        
        // 计算交易结果
        results() {
            if (!this.isValidInput) {
                return {
                    profitAmount: 0,
                    profitRate: 0,
                    coinAmount: 0,
                    totalFees: 0,
                    netProfit: 0,
                    priceChange: 0
                };
            }
            
            if (this.tradeType === 'spot') {
                return this.calculateSpotProfit();
            } else {
                return this.calculateContractProfit();
            }
        },
        
        // 收益金额和收益率的颜色类
        profitClass() {
            if (this.results.profitAmount > 0) return 'profit';
            if (this.results.profitAmount < 0) return 'loss';
            return 'neutral';
        },
        
        // 净收益的颜色类
        netProfitClass() {
            if (this.results.netProfit > 0) return 'profit';
            if (this.results.netProfit < 0) return 'loss';
            return 'neutral';
        },
        
        // 价格变化的颜色类
        priceChangeClass() {
            if (this.results.priceChange > 0) return 'profit';
            if (this.results.priceChange < 0) return 'loss';
            return 'neutral';
        }
    },
    
    methods: {
        // 现货交易收益计算
        calculateSpotProfit() {
            const entryPrice = this.entryPrice;
            const exitPrice = this.exitPrice;
            const investmentAmount = this.investmentAmount;
            const feeRate = this.tradingFee / 100;
            
            // 计算持币数量
            const coinAmount = investmentAmount / entryPrice;
            
            // 计算卖出总价值
            const sellValue = coinAmount * exitPrice;
            
            // 计算手续费
            const buyFee = investmentAmount * feeRate;
            const sellFee = sellValue * feeRate;
            const totalFees = buyFee + sellFee;
            
            // 计算收益
            const grossProfit = sellValue - investmentAmount;
            const netProfit = grossProfit - totalFees;
            const profitRate = (netProfit / investmentAmount) * 100;
            
            // 计算价格变化
            const priceChange = ((exitPrice - entryPrice) / entryPrice) * 100;
            
            return {
                profitAmount: grossProfit,
                profitRate: profitRate,
                coinAmount: coinAmount,
                totalFees: totalFees,
                netProfit: netProfit,
                priceChange: priceChange
            };
        },
        
        // 合约交易收益计算
        calculateContractProfit() {
            const entryPrice = this.entryPrice;
            const exitPrice = this.exitPrice;
            const investmentAmount = this.investmentAmount;
            const leverage = this.leverage;
            const positionType = this.positionType;
            const feeRate = this.tradingFee / 100;
            
            // 计算有效交易金额（保证金 × 杠杆）
            const effectiveAmount = investmentAmount * leverage;
            
            // 计算持币数量（基于有效交易金额）
            const coinAmount = effectiveAmount / entryPrice;
            
            // 计算价格差异
            let priceDiff;
            if (positionType === 'long') {
                priceDiff = exitPrice - entryPrice;
            } else {
                priceDiff = entryPrice - exitPrice;
            }
            
            // 计算收益（基于价格变化百分比和投资金额）
            const priceChangePercent = priceDiff / entryPrice;
            const grossProfit = priceChangePercent * investmentAmount * leverage;
            
            // 计算手续费（基于有效交易金额）
            const openFee = effectiveAmount * feeRate;
            const closeFee = effectiveAmount * feeRate;
            const totalFees = openFee + closeFee;
            
            // 计算净收益和收益率
            const netProfit = grossProfit - totalFees;
            const profitRate = (netProfit / investmentAmount) * 100;
            
            // 计算价格变化百分比
            const priceChange = ((exitPrice - entryPrice) / entryPrice) * 100;
            
            return {
                profitAmount: grossProfit,
                profitRate: profitRate,
                coinAmount: coinAmount,
                totalFees: totalFees,
                netProfit: netProfit,
                priceChange: priceChange
            };
        },
        
        // 格式化数字显示
        formatNumber(value, decimals = 2) {
            if (value === null || value === undefined || isNaN(value)) {
                return '0.00';
            }
            
            return Number(value).toFixed(decimals);
        }
    },
    
    // 组件挂载后的初始化
    mounted() {
        // 设置默认值
        this.entryPrice = 43000;
        this.exitPrice = 47000;
        this.investmentAmount = 10000;
        this.tradingFee = 0.1;
        
        // 添加输入框的实时验证
        this.$nextTick(() => {
            const inputs = document.querySelectorAll('.input-field');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    // 移除无效输入的样式
                    if (input.value && parseFloat(input.value) > 0) {
                        input.classList.remove('invalid');
                    } else {
                        input.classList.add('invalid');
                    }
                });
            });
        });
    }
}).mount('#app');
