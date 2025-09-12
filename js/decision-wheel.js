// 随机决策轮盘 Vue 应用
window.addEventListener('load', function() {
    // 检查Vue是否加载
    if (typeof Vue === 'undefined') {
        console.error('Vue 未加载');
        return;
    }

    const { createApp, ref, computed, onMounted, nextTick } = Vue;

    try {
        const app = createApp({
            setup() {
                // 响应式数据
                const currentOptions = ref([]);
                const newOptionText = ref('');
                const newOptionWeight = ref(1);
                const isSpinning = ref(false);
                const wheelRotation = ref(0);
                const showResult = ref(false);
                const lastResult = ref({ text: '', color: '' });
                const totalSpins = ref(0);
                const savedResults = ref([]);

                // 预设配色方案
                const colorSchemes = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
                    '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
                ];

                // 预设选项
                const presets = {
                    food: [
                        '中餐', '西餐', '日料', '韩料', '泰式',
                        '意大利菜', '快餐', '火锅', '烧烤', '小吃'
                    ],
                    activity: [
                        '看电影', '运动', '读书', '游戏', '购物',
                        '旅游', '聚会', '学习', '休息', '工作'
                    ],
                    place: [
                        '公园', '商场', '图书馆', '咖啡厅', '餐厅',
                        '健身房', '电影院', '博物馆', '海边', '山区'
                    ]
                };

                // 计算属性
                const totalWeight = computed(() => {
                    return currentOptions.value.reduce((sum, option) => sum + option.weight, 0);
                });

                // 初始化默认选项
                const initializeDefaultOptions = () => {
                    const defaultOptions = [
                        { text: '选项A', weight: 1, color: colorSchemes[0] },
                        { text: '选项B', weight: 1, color: colorSchemes[1] },
                        { text: '选项C', weight: 1, color: colorSchemes[2] },
                        { text: '选项D', weight: 1, color: colorSchemes[3] }
                    ];
                    currentOptions.value = defaultOptions;
                };

                // 添加选项
                const addOption = () => {
                    if (!newOptionText.value.trim()) return;
                    
                    const newOption = {
                        text: newOptionText.value.trim(),
                        weight: parseInt(newOptionWeight.value),
                        color: colorSchemes[currentOptions.value.length % colorSchemes.length]
                    };
                    
                    currentOptions.value.push(newOption);
                    newOptionText.value = '';
                    newOptionWeight.value = 1;
                    
                    saveToStorage();
                };

                // 删除选项
                const removeOption = (index) => {
                    if (currentOptions.value.length <= 2) {
                        showToast('至少需要保留2个选项！', 'warning');
                        return;
                    }
                    currentOptions.value.splice(index, 1);
                    saveToStorage();
                };

                // 加载预设
                const loadPreset = (type) => {
                    if (isSpinning.value) return;
                    
                    const options = presets[type];
                    currentOptions.value = options.map((text, index) => ({
                        text,
                        weight: 1,
                        color: colorSchemes[index % colorSchemes.length]
                    }));
                    
                    saveToStorage();
                    showToast(`已加载"${getPresetName(type)}"预设`, 'success');
                };

                const getPresetName = (type) => {
                    const names = {
                        food: '吃什么',
                        activity: '做什么',
                        place: '去哪里'
                    };
                    return names[type] || type;
                };

                // 轮盘旋转
                const spinWheel = async () => {
                    if (isSpinning.value || currentOptions.value.length < 2) return;
                    
                    isSpinning.value = true;
                    
                    // 生成加权随机结果
                    const result = getWeightedRandomResult();
                    
                    // 计算目标角度
                    const segmentAngle = 360 / currentOptions.value.length;
                    const resultIndex = currentOptions.value.findIndex(option => option === result);
                    const targetAngle = resultIndex * segmentAngle;
                    
                    // 计算轮盘需要旋转的角度（多转几圈增加效果）
                    const spins = 5 + Math.random() * 3; // 5-8圈
                    const finalRotation = wheelRotation.value + (spins * 360) - targetAngle;
                    
                    wheelRotation.value = finalRotation;
                    
                    // 播放旋转音效（如果需要）
                    playSpinSound();
                    
                    // 等待旋转完成
                    setTimeout(() => {
                        isSpinning.value = false;
                        showResultModal(result);
                        recordResult(result);
                        totalSpins.value++;
                        saveToStorage();
                    }, 3000);
                };

                // 获取加权随机结果
                const getWeightedRandomResult = () => {
                    const totalWeight = currentOptions.value.reduce((sum, option) => sum + option.weight, 0);
                    let random = Math.random() * totalWeight;
                    
                    for (const option of currentOptions.value) {
                        random -= option.weight;
                        if (random <= 0) {
                            return option;
                        }
                    }
                    
                    return currentOptions.value[0]; // 备用返回
                };

                // 显示结果弹窗
                const showResultModal = (result) => {
                    lastResult.value = result;
                    showResult.value = true;
                    playResultSound();
                };

                // 关闭结果弹窗
                const closeResult = () => {
                    showResult.value = false;
                };

                // 记录结果
                const recordResult = (result) => {
                    const record = {
                        text: result.text,
                        color: result.color,
                        timestamp: Date.now()
                    };
                    savedResults.value.unshift(record);
                    
                    // 限制历史记录数量
                    if (savedResults.value.length > 50) {
                        savedResults.value = savedResults.value.slice(0, 50);
                    }
                };

                // 清空历史记录
                const clearHistory = () => {
                    if (confirm('确定要清空所有历史记录吗？')) {
                        savedResults.value = [];
                        totalSpins.value = 0;
                        saveToStorage();
                        showToast('历史记录已清空', 'info');
                    }
                };

                // 格式化时间
                const formatTime = (timestamp) => {
                    const date = new Date(timestamp);
                    const now = new Date();
                    const diff = now - date;
                    
                    if (diff < 60000) { // 1分钟内
                        return '刚刚';
                    } else if (diff < 3600000) { // 1小时内
                        return `${Math.floor(diff / 60000)}分钟前`;
                    } else if (diff < 86400000) { // 24小时内
                        return `${Math.floor(diff / 3600000)}小时前`;
                    } else {
                        return date.toLocaleDateString();
                    }
                };

                // 音效播放
                const playSpinSound = () => {
                    // 使用Web Audio API创建简单音效
                    try {
                        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.1);
                        
                        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.1);
                    } catch (e) {
                        // 静默处理音效错误
                    }
                };

                const playResultSound = () => {
                    try {
                        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
                        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
                        
                        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.3);
                    } catch (e) {
                        // 静默处理音效错误
                    }
                };

                // 本地存储
                const saveToStorage = () => {
                    const data = {
                        options: currentOptions.value,
                        totalSpins: totalSpins.value,
                        savedResults: savedResults.value
                    };
                    localStorage.setItem('decisionWheelData', JSON.stringify(data));
                };

                const loadFromStorage = () => {
                    try {
                        const data = localStorage.getItem('decisionWheelData');
                        if (data) {
                            const parsed = JSON.parse(data);
                            if (parsed.options && parsed.options.length > 0) {
                                currentOptions.value = parsed.options;
                            } else {
                                initializeDefaultOptions();
                            }
                            totalSpins.value = parsed.totalSpins || 0;
                            savedResults.value = parsed.savedResults || [];
                        } else {
                            initializeDefaultOptions();
                        }
                    } catch (e) {
                        console.error('加载存储数据失败:', e);
                        initializeDefaultOptions();
                    }
                };

                // 显示提示消息
                const showToast = (message, type = 'info') => {
                    const colors = {
                        success: '#38a169',
                        warning: '#d69e2e',
                        error: '#e53e3e',
                        info: '#637cec'
                    };
                    
                    const toast = document.createElement('div');
                    toast.textContent = message;
                    toast.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: ${colors[type]};
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        z-index: 9999;
                        font-size: 14px;
                        font-weight: 500;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        animation: slideInToast 0.3s ease;
                    `;
                    
                    // 添加动画样式
                    if (!document.getElementById('toast-styles')) {
                        const styles = document.createElement('style');
                        styles.id = 'toast-styles';
                        styles.textContent = `
                            @keyframes slideInToast {
                                from { transform: translateX(100%); opacity: 0; }
                                to { transform: translateX(0); opacity: 1; }
                            }
                        `;
                        document.head.appendChild(styles);
                    }
                    
                    document.body.appendChild(toast);
                    
                    setTimeout(() => {
                        toast.style.animation = 'slideInToast 0.3s ease reverse';
                        setTimeout(() => toast.remove(), 300);
                    }, 3000);
                };

                // 键盘事件处理
                const handleKeydown = (event) => {
                    if (event.code === 'Space' && !isSpinning.value && currentOptions.value.length >= 2) {
                        event.preventDefault();
                        spinWheel();
                    }
                };

                // 组件挂载
                onMounted(() => {
                    loadFromStorage();
                    document.addEventListener('keydown', handleKeydown);
                    
                    // 添加入场动画延迟
                    setTimeout(() => {
                        const elements = document.querySelectorAll('.fade-in');
                        elements.forEach((el, index) => {
                            el.style.animationDelay = `${index * 0.1}s`;
                        });
                    }, 100);
                });

                return {
                    currentOptions,
                    newOptionText,
                    newOptionWeight,
                    isSpinning,
                    wheelRotation,
                    showResult,
                    lastResult,
                    totalSpins,
                    savedResults,
                    addOption,
                    removeOption,
                    loadPreset,
                    spinWheel,
                    closeResult,
                    clearHistory,
                    formatTime
                };
            }
        });

        app.mount('#app');
        console.log('随机决策轮盘应用启动成功');

    } catch (error) {
        console.error('应用初始化失败:', error);
    }
});
