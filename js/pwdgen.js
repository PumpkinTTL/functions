const { createApp } = Vue;

createApp({
    data() {
        return {
            // 生成的密码
            generatedPassword: '',
            
            // 密码配置
            passwordLength: 16,
            selectedType: 'strong',
            
            // 密码类型选项
            passwordTypes: [
                {
                    value: 'simple',
                    label: '简单',
                    icon: 'fas fa-smile'
                },
                {
                    value: 'strong',
                    label: '强密码',
                    icon: 'fas fa-shield-alt'
                },
                {
                    value: 'super',
                    label: '超级安全',
                    icon: 'fas fa-lock'
                },
                {
                    value: 'custom',
                    label: '自定义',
                    icon: 'fas fa-cogs'
                }
            ],
            
            // 字符选项
            characterOptions: [
                {
                    key: 'lowercase',
                    label: '小写字母',
                    icon: 'fas fa-font',
                    example: 'a-z',
                    enabled: true,
                    chars: 'abcdefghijklmnopqrstuvwxyz'
                },
                {
                    key: 'uppercase',
                    label: '大写字母',
                    icon: 'fas fa-font',
                    example: 'A-Z',
                    enabled: true,
                    chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
                },
                {
                    key: 'numbers',
                    label: '数字',
                    icon: 'fas fa-hashtag',
                    example: '0-9',
                    enabled: true,
                    chars: '0123456789'
                },
                {
                    key: 'symbols',
                    label: '特殊符号',
                    icon: 'fas fa-at',
                    example: '!@#$',
                    enabled: true,
                    chars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
                },
                {
                    key: 'similar',
                    label: '排除相似字符',
                    icon: 'fas fa-eye-slash',
                    example: '0oO1lI',
                    enabled: false,
                    chars: '0oO1lI'
                }
            ],
            
            // 历史记录
            passwordHistory: [],
            
            // 复制状态
            copySuccess: false
        }
    },
    
    computed: {
        // 密码强度等级
        passwordStrengthLevel() {
            if (!this.generatedPassword) return 0;
            
            let score = 0;
            const password = this.generatedPassword;
            
            // 长度评分
            if (password.length >= 8) score += 1;
            if (password.length >= 12) score += 1;
            if (password.length >= 16) score += 1;
            
            // 字符类型评分
            if (/[a-z]/.test(password)) score += 1;
            if (/[A-Z]/.test(password)) score += 1;
            if (/[0-9]/.test(password)) score += 1;
            if (/[^a-zA-Z0-9]/.test(password)) score += 2;
            
            // 复杂度评分
            if (password.length > 20) score += 1;
            if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^a-zA-Z0-9])/.test(password)) score += 2;
            
            return Math.min(score, 10);
        },
        
        // 密码强度百分比
        strengthPercentage() {
            return (this.passwordStrengthLevel / 10) * 100;
        },
        
        // 密码强度文本
        strengthText() {
            const level = this.passwordStrengthLevel;
            if (level <= 3) return '弱';
            if (level <= 6) return '中等';
            if (level <= 8) return '强';
            return '非常强';
        },
        
        // 密码强度CSS类
        passwordStrengthClass() {
            const level = this.passwordStrengthLevel;
            if (level <= 3) return 'weak';
            if (level <= 6) return 'medium';
            if (level <= 8) return 'strong';
            return 'very-strong';
        },
        
        // 可用字符集
        availableCharacters() {
            let chars = '';
            let excludeChars = '';
            
            // 根据密码类型设置默认字符集
            if (this.selectedType === 'simple') {
                chars = this.characterOptions[0].chars + this.characterOptions[2].chars; // 小写+数字
            } else if (this.selectedType === 'strong') {
                chars = this.characterOptions[0].chars + this.characterOptions[1].chars + this.characterOptions[2].chars; // 小写+大写+数字
            } else if (this.selectedType === 'super') {
                chars = this.characterOptions[0].chars + this.characterOptions[1].chars + this.characterOptions[2].chars + this.characterOptions[3].chars; // 全部
            } else if (this.selectedType === 'custom') {
                // 自定义模式，根据用户选择
                this.characterOptions.forEach(option => {
                    if (option.enabled && option.key !== 'similar') {
                        chars += option.chars;
                    } else if (option.enabled && option.key === 'similar') {
                        excludeChars += option.chars;
                    }
                });
            }
            
            // 排除相似字符
            if (excludeChars) {
                chars = chars.split('').filter(char => !excludeChars.includes(char)).join('');
            }
            
            return chars;
        }
    },
    
    watch: {
        // 监听密码类型变化，自动更新字符选项
        selectedType(newType) {
            if (newType !== 'custom') {
                this.updateCharacterOptions();
            }
        }
    },
    
    methods: {
        // 生成密码
        generatePassword() {
            const chars = this.availableCharacters;
            if (!chars) {
                this.showMessage('请至少选择一种字符类型！', 'error');
                return;
            }
            
            let password = '';
            
            // 确保包含每种选中的字符类型（自定义模式）
            if (this.selectedType === 'custom') {
                const requiredChars = [];
                this.characterOptions.forEach(option => {
                    if (option.enabled && option.key !== 'similar') {
                        const randomChar = option.chars[Math.floor(Math.random() * option.chars.length)];
                        requiredChars.push(randomChar);
                    }
                });
                
                // 添加必需字符
                password += requiredChars.join('');
            }
            
            // 生成剩余字符
            const remainingLength = this.passwordLength - password.length;
            for (let i = 0; i < remainingLength; i++) {
                password += chars[Math.floor(Math.random() * chars.length)];
            }
            
            // 打乱密码字符顺序
            password = this.shuffleString(password);
            
            this.generatedPassword = password;
            this.addToHistory(password);
            this.showMessage('密码生成成功！', 'success');
        },
        
        // 打乱字符串
        shuffleString(str) {
            return str.split('').sort(() => Math.random() - 0.5).join('');
        },
        
        // 复制密码
        copyPassword() {
            if (!this.generatedPassword) return;
            
            navigator.clipboard.writeText(this.generatedPassword).then(() => {
                this.showMessage('密码已复制到剪贴板！', 'success');
            }).catch(() => {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = this.generatedPassword;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showMessage('密码已复制到剪贴板！', 'success');
            });
        },
        
        // 从历史记录复制密码
        copyPasswordFromHistory(password) {
            navigator.clipboard.writeText(password).then(() => {
                this.showMessage('密码已复制到剪贴板！', 'success');
            }).catch(() => {
                // 降级方案
                const textArea = document.createElement('textarea');
                textArea.value = password;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showMessage('密码已复制到剪贴板！', 'success');
            });
        },
        
        // 添加到历史记录
        addToHistory(password) {
            const historyItem = {
                password: password,
                strength: this.strengthText,
                strengthClass: this.passwordStrengthClass,
                time: new Date().toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                })
            };
            
            // 避免重复记录
            if (this.passwordHistory.length === 0 || this.passwordHistory[0].password !== password) {
                this.passwordHistory.unshift(historyItem);
                
                // 限制历史记录数量
                if (this.passwordHistory.length > 10) {
                    this.passwordHistory = this.passwordHistory.slice(0, 10);
                }
            }
        },
        
        // 清空历史记录
        clearHistory() {
            this.passwordHistory = [];
            this.showMessage('历史记录已清空！', 'success');
        },
        
        // 更新字符选项
        updateCharacterOptions() {
            if (this.selectedType === 'simple') {
                this.characterOptions.forEach(option => {
                    option.enabled = ['lowercase', 'numbers'].includes(option.key);
                });
            } else if (this.selectedType === 'strong') {
                this.characterOptions.forEach(option => {
                    option.enabled = ['lowercase', 'uppercase', 'numbers'].includes(option.key);
                });
            } else if (this.selectedType === 'super') {
                this.characterOptions.forEach(option => {
                    option.enabled = option.key !== 'similar';
                });
            }
        },
        
        // 显示消息
        showMessage(message, type = 'info') {
            // 创建消息元素
            const messageEl = document.createElement('div');
            messageEl.className = `message message-${type}`;
            messageEl.textContent = message;
            
            // 样式
            Object.assign(messageEl.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                zIndex: '10000',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease',
                maxWidth: '300px',
                wordWrap: 'break-word'
            });
            
            // 根据类型设置背景色
            if (type === 'success') {
                messageEl.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            } else if (type === 'error') {
                messageEl.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            } else {
                messageEl.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
            
            document.body.appendChild(messageEl);
            
            // 动画显示
            setTimeout(() => {
                messageEl.style.transform = 'translateX(0)';
            }, 100);
            
            // 自动隐藏
            setTimeout(() => {
                messageEl.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    document.body.removeChild(messageEl);
                }, 300);
            }, 3000);
        },
        
        // 添加点击音效
        addClickSounds() {
            const buttons = document.querySelectorAll('button, .checkbox-item, .type-btn');
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    // 简单的点击反馈
                    button.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        button.style.transform = '';
                    }, 150);
                });
            });
        }
    },
    
    mounted() {
        // 初始化字符选项
        this.updateCharacterOptions();
        
        // 生成初始密码
        setTimeout(() => {
            this.generatePassword();
        }, 1000);
        
        // 添加键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.generatePassword();
                } else if (e.key === 'c' && this.generatedPassword) {
                    // 只有当焦点不在输入框时才触发复制
                    if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
                        e.preventDefault();
                        this.copyPassword();
                    }
                }
            }
        });
        
        // 添加点击音效（可选）
        this.addClickSounds();
    }
}).mount('#app');
