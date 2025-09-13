// 文本处理工具 Vue 应用
const { createApp } = Vue;

createApp({
    data() {
        return {
            // 输入文本
            inputText: '',
            
            // 输出文本
            outputText: '',
            
            // 分析结果
            analysisResult: null,
            
            // 文本统计
            textStats: {
                characters: 0,
                words: 0,
                lines: 0,
                chineseChars: 0
            },
            
            // 二维码相关
            qrCodeUrl: '',
            qrSize: 200,
            
            // 处理历史
            processHistory: [],
            
            // 加载状态
            isProcessing: false,
            
            // 摩斯密码对照表
            morseCodeMap: {
                'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
                'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
                'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
                'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
                'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
                '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
                '8': '---..', '9': '----.', ' ': '/'
            },
            
            // 简化拼音映射（常用字）
            pinyinMap: {
                '你': 'ni', '好': 'hao', '是': 'shi', '的': 'de', '在': 'zai', '有': 'you',
                '我': 'wo', '他': 'ta', '她': 'ta', '它': 'ta', '们': 'men', '这': 'zhe',
                '那': 'na', '中': 'zhong', '国': 'guo', '人': 'ren', '大': 'da', '小': 'xiao',
                '上': 'shang', '下': 'xia', '来': 'lai', '去': 'qu', '出': 'chu', '会': 'hui',
                '可': 'ke', '以': 'yi', '不': 'bu', '没': 'mei', '很': 'hen', '多': 'duo',
                '少': 'shao', '好': 'hao', '坏': 'huai', '新': 'xin', '老': 'lao', '年': 'nian',
                '月': 'yue', '日': 'ri', '时': 'shi', '分': 'fen', '秒': 'miao', '今': 'jin',
                '明': 'ming', '昨': 'zuo', '天': 'tian', '地': 'di', '山': 'shan', '水': 'shui',
                '火': 'huo', '电': 'dian', '风': 'feng', '雨': 'yu', '雪': 'xue', '云': 'yun',
                '太': 'tai', '阳': 'yang', '月': 'yue', '星': 'xing', '家': 'jia', '学': 'xue',
                '工': 'gong', '作': 'zuo', '吃': 'chi', '喝': 'he', '睡': 'shui', '起': 'qi',
                '走': 'zou', '跑': 'pao', '看': 'kan', '听': 'ting', '说': 'shuo', '话': 'hua',
                '读': 'du', '写': 'xie', '想': 'xiang', '知': 'zhi', '道': 'dao', '爱': 'ai',
                '喜': 'xi', '欢': 'huan', '高': 'gao', '兴': 'xing', '开': 'kai', '心': 'xin',
                '快': 'kuai', '乐': 'le', '美': 'mei', '丽': 'li', '漂': 'piao', '亮': 'liang'
            }
        };
    },
    
    watch: {
        inputText: {
            handler() {
                this.updateStats();
            },
            immediate: true
        }
    },
    
    mounted() {
        // 从localStorage加载历史记录
        const savedHistory = localStorage.getItem('textProcessorHistory');
        if (savedHistory) {
            this.processHistory = JSON.parse(savedHistory);
        }
        
        // 设置默认二维码大小
        this.qrSize = 200;
        
        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'v':
                        // Ctrl+V 粘贴
                        if (e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'INPUT') {
                            e.preventDefault();
                            this.pasteText();
                        }
                        break;
                    case 'Enter':
                        // Ctrl+Enter 快速转大写
                        if (e.target.classList.contains('text-input')) {
                            e.preventDefault();
                            this.convertCase('upper');
                        }
                        break;
                }
            }
        });
    },
    
    methods: {
        // 更新文本统计
        updateStats() {
            const text = this.inputText;
            
            // 字符数
            this.textStats.characters = text.length;
            
            // 单词数（英文单词）
            const words = text.match(/\b\w+\b/g);
            this.textStats.words = words ? words.length : 0;
            
            // 行数
            this.textStats.lines = text.split('\n').length;
            
            // 中文字符数
            const chineseChars = text.match(/[\u4e00-\u9fff]/g);
            this.textStats.chineseChars = chineseChars ? chineseChars.length : 0;
        },
        
        // 粘贴文本
        async pasteText() {
            try {
                const text = await navigator.clipboard.readText();
                this.inputText = text;
                this.showToast('文本已粘贴', 'success');
            } catch (error) {
                this.showToast('粘贴失败，请手动粘贴', 'error');
            }
        },
        
        // 清空输入
        clearInput() {
            this.inputText = '';
            this.qrCodeUrl = '';
            this.outputText = '';
            this.analysisResult = null;
            this.showToast('输入已清空', 'info');
        },
        
        // 大小写转换
        convertCase(type) {
            if (!this.inputText.trim()) return;
            
            let result = '';
            switch (type) {
                case 'upper':
                    result = this.inputText.toUpperCase();
                    break;
                case 'lower':
                    result = this.inputText.toLowerCase();
                    break;
                case 'capitalize':
                    result = this.inputText.replace(/\b\w/g, l => l.toUpperCase());
                    break;
            }
            
            this.outputText = result;
            this.analysisResult = null;
            
            this.addToHistory(`转换为${this.getCaseTypeName(type)}`, result);
            this.showToast(`已转换为${this.getCaseTypeName(type)}`, 'success');
        },
        
        // 获取大小写类型名称
        getCaseTypeName(type) {
            const names = {
                'upper': '大写',
                'lower': '小写',
                'capitalize': '首字母大写'
            };
            return names[type];
        },
        
        // 转换为拼音
        convertToPinyin() {
            if (!this.inputText.trim()) return;
            
            this.isProcessing = true;
            
            setTimeout(() => {
                let result = '';
                for (let char of this.inputText) {
                    if (this.pinyinMap[char]) {
                        result += this.pinyinMap[char] + ' ';
                    } else if (/[\u4e00-\u9fff]/.test(char)) {
                        // 未知中文字符用[]标记
                        result += `[${char}] `;
                    } else {
                        result += char;
                    }
                }
                
                this.outputText = result.trim();
                this.analysisResult = null;
                this.addToHistory('转换为拼音', this.outputText);
                this.showToast('已转换为拼音（部分字符）', 'success');
                this.isProcessing = false;
            }, 800);
        },
        
        // 转换为摩斯密码
        convertToMorse() {
            if (!this.inputText.trim()) return;
            
            this.isProcessing = true;
            
            setTimeout(() => {
                let result = '';
                const text = this.inputText.toUpperCase();
                
                for (let char of text) {
                    if (this.morseCodeMap[char]) {
                        result += this.morseCodeMap[char] + ' ';
                    } else if (/\s/.test(char)) {
                        result += '/ ';
                    } else {
                        result += `[${char}] `;
                    }
                }
                
                this.outputText = result.trim();
                this.analysisResult = null;
                this.addToHistory('转换为摩斯密码', this.outputText);
                this.showToast('已转换为摩斯密码', 'success');
                this.isProcessing = false;
            }, 600);
        },
        
        // 提取关键词
        extractKeywords() {
            if (!this.inputText.trim()) return;
            
            this.isProcessing = true;
            
            setTimeout(() => {
                // 简单的关键词提取逻辑
                const text = this.inputText.toLowerCase();
                const words = text.match(/\b\w+\b/g) || [];
                
                // 停用词
                const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that', 'these', 'those', '的', '了', '在', '是', '我', '你', '他', '她', '它', '们', '这', '那', '有', '和', '与', '或', '但'];
                
                // 词频统计
                const wordCount = {};
                words.forEach(word => {
                    if (word.length > 2 && !stopWords.includes(word)) {
                        wordCount[word] = (wordCount[word] || 0) + 1;
                    }
                });
                
                // 排序并获取前10个关键词
                const keywords = Object.entries(wordCount)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([word, count]) => `${word} (${count})`)
                    .join(', ');
                
                this.outputText = keywords || '未找到明显关键词';
                this.analysisResult = null;
                this.addToHistory('提取关键词', this.outputText);
                this.showToast('关键词提取完成', 'success');
                this.isProcessing = false;
            }, 1000);
        },
        
        // 可读性分析
        analyzeReadability() {
            if (!this.inputText.trim()) return;
            
            this.isProcessing = true;
            
            setTimeout(() => {
                const text = this.inputText;
                const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim());
                const words = text.match(/\b\w+\b/g) || [];
                const characters = text.length;
                
                // 简单的可读性指标
                const avgWordsPerSentence = sentences.length ? (words.length / sentences.length).toFixed(1) : 0;
                const avgCharsPerWord = words.length ? (words.reduce((sum, word) => sum + word.length, 0) / words.length).toFixed(1) : 0;
                
                // 可读性评级
                let readabilityLevel = '中等';
                if (avgWordsPerSentence < 15 && avgCharsPerWord < 5) {
                    readabilityLevel = '容易';
                } else if (avgWordsPerSentence > 25 || avgCharsPerWord > 7) {
                    readabilityLevel = '困难';
                }
                
                this.analysisResult = {
                    '句子数': sentences.length,
                    '平均句长': `${avgWordsPerSentence} 词`,
                    '平均词长': `${avgCharsPerWord} 字符`,
                    '可读性': readabilityLevel,
                    '复杂词汇': words.filter(w => w.length > 8).length
                };
                
                this.outputText = '';
                this.addToHistory('可读性分析', `可读性: ${readabilityLevel}`);
                this.showToast('可读性分析完成', 'success');
                this.isProcessing = false;
            }, 1200);
        },
        
        // 查找重复内容
        findDuplicates() {
            if (!this.inputText.trim()) return;
            
            this.isProcessing = true;
            
            setTimeout(() => {
                const lines = this.inputText.split('\n').map(line => line.trim()).filter(line => line);
                const duplicates = [];
                const seen = new Set();
                
                lines.forEach(line => {
                    if (seen.has(line)) {
                        if (!duplicates.includes(line)) {
                            duplicates.push(line);
                        }
                    } else {
                        seen.add(line);
                    }
                });
                
                this.outputText = duplicates.length > 0 
                    ? duplicates.join('\n')
                    : '未发现重复内容';
                this.analysisResult = null;
                this.addToHistory('查找重复内容', `发现 ${duplicates.length} 处重复`);
                this.showToast(`发现 ${duplicates.length} 处重复内容`, 'info');
                this.isProcessing = false;
            }, 800);
        },
        
        // 文本格式化
        formatText(type) {
            if (!this.inputText.trim()) return;
            
            let result = '';
            switch (type) {
                case 'trim':
                    // 去除多余空白
                    result = this.inputText.replace(/\s+/g, ' ').trim();
                    break;
                case 'indent':
                    // 格式化缩进
                    result = this.inputText.split('\n').map(line => 
                        line.trim() ? '    ' + line.trim() : line
                    ).join('\n');
                    break;
                case 'bullets':
                    // 添加列表符
                    result = this.inputText.split('\n').map(line => 
                        line.trim() ? '• ' + line.trim() : line
                    ).join('\n');
                    break;
                case 'numbers':
                    // 添加序号
                    let counter = 1;
                    result = this.inputText.split('\n').map(line => 
                        line.trim() ? `${counter++}. ${line.trim()}` : line
                    ).join('\n');
                    break;
            }
            
            this.outputText = result;
            this.analysisResult = null;
            this.addToHistory(`文本${this.getFormatTypeName(type)}`, result);
            this.showToast(`文本${this.getFormatTypeName(type)}完成`, 'success');
        },
        
        // 获取格式化类型名称
        getFormatTypeName(type) {
            const names = {
                'trim': '去除空白',
                'indent': '格式化缩进',
                'bullets': '添加列表符',
                'numbers': '添加序号'
            };
            return names[type];
        },
        
        // 生成二维码
        generateQRCode() {
            if (!this.inputText.trim()) return;
            
            this.isProcessing = true;
            
            setTimeout(() => {
                // 使用QR Server API生成二维码
                const text = encodeURIComponent(this.inputText);
                const size = this.qrSize || 200;
                this.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${text}`;
                
                this.addToHistory('生成二维码', `大小: ${size}x${size}`);
                this.showToast('二维码生成完成', 'success');
                this.isProcessing = false;
            }, 500);
        },
        
        // 下载二维码
        downloadQRCode() {
            if (!this.qrCodeUrl) return;
            
            const link = document.createElement('a');
            link.href = this.qrCodeUrl;
            link.download = 'qrcode.png';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            this.showToast('二维码下载中...', 'info');
        },
        
        // 复制输出结果
        async copyOutput() {
            const textToCopy = this.outputText || JSON.stringify(this.analysisResult, null, 2);
            
            try {
                await navigator.clipboard.writeText(textToCopy);
                this.showToast('结果已复制到剪贴板', 'success');
            } catch (error) {
                this.showToast('复制失败，请手动复制', 'error');
            }
        },
        
        // 清空输出
        clearOutput() {
            this.outputText = '';
            this.analysisResult = null;
            this.showToast('输出已清空', 'info');
        },
        
        // 添加到历史记录
        addToHistory(type, preview) {
            const historyItem = {
                type,
                preview: preview.length > 50 ? preview.substring(0, 50) + '...' : preview,
                fullText: this.inputText,
                result: this.outputText || this.analysisResult,
                timestamp: Date.now()
            };
            
            this.processHistory.unshift(historyItem);
            
            // 保持历史记录不超过20条
            if (this.processHistory.length > 20) {
                this.processHistory = this.processHistory.slice(0, 20);
            }
            
            // 保存到localStorage
            localStorage.setItem('textProcessorHistory', JSON.stringify(this.processHistory));
        },
        
        // 使用历史记录项
        useHistoryItem(item) {
            this.inputText = item.fullText;
            if (typeof item.result === 'string') {
                this.outputText = item.result;
                this.analysisResult = null;
            } else {
                this.outputText = '';
                this.analysisResult = item.result;
            }
            this.showToast('已恢复历史记录', 'success');
        },
        
        // 清空历史记录
        clearHistory() {
            this.processHistory = [];
            localStorage.removeItem('textProcessorHistory');
            this.showToast('历史记录已清空', 'info');
        },
        
        // 格式化时间
        formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) {
                return '刚刚';
            } else if (diff < 3600000) {
                return `${Math.floor(diff / 60000)}分钟前`;
            } else if (diff < 86400000) {
                return `${Math.floor(diff / 3600000)}小时前`;
            } else {
                return date.toLocaleDateString();
            }
        },
        
        // 显示提示消息
        showToast(message, type = 'info') {
            // 移除现有的toast
            const existingToast = document.querySelector('.toast-message');
            if (existingToast) {
                existingToast.remove();
            }
            
            // 创建新的toast
            const toast = document.createElement('div');
            toast.className = `toast-message toast-${type}`;
            toast.textContent = message;
            
            // 设置样式
            Object.assign(toast.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                fontSize: '14px',
                zIndex: '9999',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
            });
            
            // 设置颜色
            const colors = {
                success: '#38a169',
                error: '#e53e3e',
                warning: '#d69e2e',
                info: '#667eea'
            };
            toast.style.background = colors[type] || colors.info;
            
            document.body.appendChild(toast);
            
            // 显示动画
            setTimeout(() => {
                toast.style.transform = 'translateX(0)';
            }, 50);
            
            // 自动移除
            setTimeout(() => {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }, 3000);
        }
    }
}).mount('#app');
