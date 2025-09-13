// 打字速度测试 Vue 应用
window.addEventListener('load', function() {
    // 检查Vue是否加载
    if (typeof Vue === 'undefined') {
        console.error('Vue 未加载');
        showFallbackContent();
        return;
    }

    const { createApp, ref, computed, onMounted, nextTick } = Vue;

    try {
        const app = createApp({
            setup() {
                // 响应式数据
                const isTestActive = ref(false);
                const isPaused = ref(false);
                const isLoading = ref(false);
                const showResult = ref(false);
                const canStart = ref(true);

                // 测试配置
                const selectedMode = ref('time');
                const selectedTime = ref(60);
                const selectedWords = ref(50);
                const selectedLanguage = ref('chinese');
                const selectedDifficulty = ref('medium');

                // 测试数据
                const displayText = ref('');
                const userInput = ref('');
                const currentPosition = ref(0);
                const testStartTime = ref(0);
                const testEndTime = ref(0);
                const timeRemaining = ref(0);
                const timer = ref(null);

                // 统计数据
                const currentWPM = ref(0);
                const currentAccuracy = ref(100);
                const typedChars = ref(0);
                const errorCount = ref(0);
                const correctChars = ref(0);

                // 测试历史和结果
                const testHistory = ref([]);
                const lastResult = ref({});

                // 配置选项
                const testModes = ref([
                    { value: 'time', label: '计时模式', icon: 'fas fa-clock' },
                    { value: 'words', label: '字数模式', icon: 'fas fa-font' },
                    { value: 'sentences', label: '句子模式', icon: 'fas fa-paragraph' }
                ]);

                const timeOptions = ref([15, 30, 60, 120, 300]);
                const wordOptions = ref([25, 50, 100, 200]);

                const languageOptions = ref([
                    { value: 'chinese', label: '中文', icon: 'fas fa-yin-yang' },
                    { value: 'english', label: '英文', icon: 'fas fa-globe' },
                    { value: 'mixed', label: '中英混合', icon: 'fas fa-language' }
                ]);

                const difficultyOptions = ref([
                    { value: 'easy', label: '简单', icon: 'fas fa-leaf' },
                    { value: 'medium', label: '中等', icon: 'fas fa-star' },
                    { value: 'hard', label: '困难', icon: 'fas fa-fire' },
                    { value: 'expert', label: '专家', icon: 'fas fa-crown' }
                ]);

                // 文本库
                const textSamples = {
                    chinese: {
                        easy: [
                            '春天来了，花儿开了，鸟儿唱歌。阳光明媚，微风习习，人们心情愉快。',
                            '我喜欢读书，因为书中有无穷的知识。每天阅读让我感到充实和快乐。',
                            '科技改变生活，互联网连接世界。我们要与时俱进，不断学习新知识。',
                            '健康是最重要的财富。规律作息，合理饮食，适量运动，保持好心情。',
                            '友谊珍贵，需要用心维护。真正的朋友会在你需要时伸出援手。'
                        ],
                        medium: [
                            '人工智能技术的快速发展正在深刻改变着我们的工作方式和生活模式，从自动驾驶汽车到智能家居系统，科技创新为人类带来前所未有的便利。',
                            '在全球化的时代背景下，不同文化之间的交流与融合变得愈加频繁，我们需要以开放包容的心态去理解和接纳多元化的世界观。',
                            '可持续发展已成为当今世界的重要议题，绿色能源、环保材料、循环经济等概念正在重新定义现代产业的发展方向和企业的社会责任。',
                            '教育是推动社会进步的根本动力，优质的教育资源应当公平分配，让每个人都有机会通过学习改变命运，实现个人价值和社会贡献的统一。',
                            '数字化转型不仅仅是技术的升级，更是思维方式和商业模式的根本变革，企业需要重新审视自身的核心竞争力和市场定位。'
                        ],
                        hard: [
                            '量子计算作为下一代计算技术的重要发展方向，利用量子叠加和量子纠缠等物理现象，能够在特定算法上实现指数级的计算性能提升，为密码学、化学模拟、优化问题等领域带来革命性突破。',
                            '区块链技术以其去中心化、不可篡改、透明可追溯的特性，正在重构金融服务体系，从数字货币到智能合约，从供应链管理到数字身份认证，其应用场景不断拓展，推动着信任机制的数字化重建。',
                            '生物信息学结合计算科学与生物学的交叉学科，通过大数据分析和机器学习算法，解析基因组序列信息，预测蛋白质结构功能，为精准医疗、药物研发和生物工程提供强有力的技术支撑。',
                            '气候变化问题的复杂性在于其涉及大气科学、海洋学、生态学、经济学等多个学科领域的综合作用，需要通过国际合作、技术创新和政策协调来构建可持续的全球治理体系。',
                            '认知心理学研究表明，人类的决策过程并非完全理性，而是受到情感、偏见、启发式思维等多种因素影响，理解这些认知机制对于改善人机交互设计和提升用户体验具有重要意义。'
                        ]
                    },
                    english: {
                        easy: [
                            'The quick brown fox jumps over the lazy dog. This sentence contains all letters of the alphabet and is commonly used for typing practice.',
                            'Technology has changed the way we communicate with each other. Social media platforms connect people from different parts of the world.',
                            'Reading books is a wonderful way to expand your knowledge and imagination. Every page offers new insights and perspectives.',
                            'Exercise and healthy eating are essential for maintaining good physical and mental health. Regular activity keeps us energized.',
                            'Learning new skills takes time and practice, but the effort is always worth it in the end. Persistence is key to success.'
                        ],
                        medium: [
                            'Artificial intelligence and machine learning technologies are rapidly transforming industries across the globe, from healthcare and finance to transportation and entertainment, creating new opportunities while presenting unique challenges.',
                            'Climate change represents one of the most pressing issues of our time, requiring coordinated global action, innovative technologies, and fundamental changes in how we produce and consume energy.',
                            'The digital revolution has democratized access to information and education, enabling people from diverse backgrounds to learn, create, and collaborate in ways that were previously impossible.',
                            'Sustainable development goals emphasize the importance of balancing economic growth with environmental protection and social equity, ensuring a better future for generations to come.',
                            'Effective communication skills are essential in both personal and professional relationships, involving not just speaking and writing, but also active listening and empathy.'
                        ],
                        hard: [
                            'Quantum computing represents a paradigm shift in computational technology, leveraging quantum mechanical phenomena such as superposition and entanglement to perform calculations that would be intractable for classical computers.',
                            'Bioinformatics combines computational methods with biological data to understand complex biological processes, enabling researchers to analyze genomic sequences, predict protein structures, and develop personalized medical treatments.',
                            'Neuroscience research has revealed the remarkable plasticity of the human brain, demonstrating how neural networks can reorganize and adapt throughout life in response to learning, experience, and environmental changes.',
                            'Cryptocurrency and blockchain technology have introduced novel concepts of decentralized finance, challenging traditional banking systems and creating new possibilities for peer-to-peer transactions and digital asset management.',
                            'Philosophical questions about consciousness, free will, and the nature of reality have taken on new dimensions in light of advances in cognitive science, artificial intelligence, and quantum physics.'
                        ]
                    }
                };

                // 计算属性
                const testProgress = computed(() => {
                    if (selectedMode.value === 'time') {
                        const totalTime = selectedTime.value;
                        const elapsed = totalTime - timeRemaining.value;
                        return Math.min((elapsed / totalTime) * 100, 100);
                    } else if (selectedMode.value === 'words') {
                        const totalChars = displayText.value.length;
                        return Math.min((currentPosition.value / totalChars) * 100, 100);
                    }
                    return 0;
                });

                // 方法
                const generateTestText = () => {
                    const difficulty = selectedDifficulty.value;
                    const language = selectedLanguage.value;
                    
                    let samples = [];
                    
                    if (language === 'mixed') {
                        samples = [
                            ...textSamples.chinese[difficulty],
                            ...textSamples.english[difficulty]
                        ];
                    } else {
                        samples = textSamples[language][difficulty] || textSamples.chinese.easy;
                    }
                    
                    if (selectedMode.value === 'words') {
                        // 生成指定字数的文本
                        let text = '';
                        const targetWords = selectedWords.value;
                        
                        while (text.split('').length < targetWords * 5) { // 平均每个单词5个字符
                            const randomSample = samples[Math.floor(Math.random() * samples.length)];
                            text += randomSample + ' ';
                        }
                        
                        return text.substring(0, targetWords * 5).trim();
                    } else {
                        // 时间模式或句子模式
                        const randomSample = samples[Math.floor(Math.random() * samples.length)];
                        return randomSample;
                    }
                };

                const startTest = async () => {
                    if (!canStart.value) return;
                    
                    isLoading.value = true;
                    
                    try {
                        // 生成测试文本
                        await new Promise(resolve => setTimeout(resolve, 500)); // 模拟加载
                        displayText.value = generateTestText();
                        
                        // 初始化测试状态
                        userInput.value = '';
                        currentPosition.value = 0;
                        typedChars.value = 0;
                        errorCount.value = 0;
                        correctChars.value = 0;
                        currentWPM.value = 0;
                        currentAccuracy.value = 100;
                        
                        isTestActive.value = true;
                        isPaused.value = false;
                        testStartTime.value = Date.now();
                        
                        // 启动计时器
                        if (selectedMode.value === 'time') {
                            timeRemaining.value = selectedTime.value;
                            startTimer();
                        }
                        
                        // 聚焦输入框
                        await nextTick();
                        const inputRef = document.querySelector('.typing-input');
                        if (inputRef) {
                            inputRef.focus();
                        }
                        
                        showToast('测试开始！开始输入吧', 'success');
                        
                    } catch (error) {
                        console.error('启动测试失败:', error);
                        showToast('启动测试失败', 'error');
                    } finally {
                        isLoading.value = false;
                    }
                };

                const pauseTest = () => {
                    if (!isTestActive.value) return;
                    
                    isPaused.value = true;
                    if (timer.value) {
                        clearInterval(timer.value);
                        timer.value = null;
                    }
                    showToast('测试已暂停', 'info');
                };

                const resumeTest = async () => {
                    if (!isTestActive.value || !isPaused.value) return;
                    
                    isPaused.value = false;
                    
                    if (selectedMode.value === 'time' && timeRemaining.value > 0) {
                        startTimer();
                    }
                    
                    // 重新聚焦输入框
                    await nextTick();
                    const inputRef = document.querySelector('.typing-input');
                    if (inputRef) {
                        inputRef.focus();
                    }
                    
                    showToast('测试继续', 'success');
                };

                const stopTest = () => {
                    if (!isTestActive.value) return;
                    
                    endTest();
                    showToast('测试已结束', 'info');
                };

                const resetTest = () => {
                    // 停止计时器
                    if (timer.value) {
                        clearInterval(timer.value);
                        timer.value = null;
                    }
                    
                    // 重置所有状态
                    isTestActive.value = false;
                    isPaused.value = false;
                    showResult.value = false;
                    userInput.value = '';
                    displayText.value = '';
                    currentPosition.value = 0;
                    typedChars.value = 0;
                    errorCount.value = 0;
                    correctChars.value = 0;
                    currentWPM.value = 0;
                    currentAccuracy.value = 100;
                    timeRemaining.value = 0;
                    
                    canStart.value = true;
                    showToast('测试已重置', 'info');
                };

                const endTest = () => {
                    if (timer.value) {
                        clearInterval(timer.value);
                        timer.value = null;
                    }
                    
                    testEndTime.value = Date.now();
                    isTestActive.value = false;
                    isPaused.value = false;
                    
                    calculateResults();
                    showResult.value = true;
                };

                const startTimer = () => {
                    timer.value = setInterval(() => {
                        if (isPaused.value) return;
                        
                        timeRemaining.value--;
                        
                        if (timeRemaining.value <= 0) {
                            endTest();
                        }
                    }, 1000);
                };

                const handleInput = () => {
                    if (!isTestActive.value || isPaused.value) return;
                    
                    const input = userInput.value;
                    const target = displayText.value;
                    
                    // 更新当前位置
                    currentPosition.value = Math.min(input.length, target.length);
                    typedChars.value = input.length;
                    
                    // 计算正确和错误字符
                    let correct = 0;
                    let errors = 0;
                    
                    for (let i = 0; i < input.length && i < target.length; i++) {
                        if (input[i] === target[i]) {
                            correct++;
                        } else {
                            errors++;
                        }
                    }
                    
                    correctChars.value = correct;
                    errorCount.value = errors;
                    
                    // 计算实时统计
                    updateRealTimeStats();
                    
                    // 检查完成条件
                    if (selectedMode.value === 'words' && input.length >= target.length) {
                        endTest();
                    } else if (selectedMode.value === 'sentences' && input === target) {
                        endTest();
                    }
                };

                const handleKeydown = (event) => {
                    if (!isTestActive.value || isPaused.value) return;
                    
                    // 禁用某些快捷键
                    if (event.ctrlKey || event.metaKey) {
                        if (['a', 'c', 'v', 'x', 'z', 'y'].includes(event.key.toLowerCase())) {
                            event.preventDefault();
                        }
                    }
                    
                    // 禁用方向键（可选）
                    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                        event.preventDefault();
                    }
                };

                const updateRealTimeStats = () => {
                    if (typedChars.value === 0) {
                        currentWPM.value = 0;
                        currentAccuracy.value = 100;
                        return;
                    }
                    
                    // 计算WPM
                    const elapsedMinutes = (Date.now() - testStartTime.value) / 60000;
                    if (elapsedMinutes > 0) {
                        // 中文字符按1个字符计算，英文按5个字符为1个单词计算
                        const words = selectedLanguage.value === 'chinese' ? 
                            correctChars.value : 
                            correctChars.value / 5;
                        currentWPM.value = Math.round(words / elapsedMinutes);
                    }
                    
                    // 计算准确率
                    currentAccuracy.value = Math.round((correctChars.value / typedChars.value) * 100);
                };

                const calculateResults = () => {
                    const duration = Math.round((testEndTime.value - testStartTime.value) / 1000);
                    const totalChars = typedChars.value;
                    
                    // 计算最终WPM
                    const minutes = duration / 60;
                    const words = selectedLanguage.value === 'chinese' ? 
                        correctChars.value : 
                        correctChars.value / 5;
                    const wpm = minutes > 0 ? Math.round(words / minutes) : 0;
                    
                    // 计算最终准确率
                    const accuracy = totalChars > 0 ? Math.round((correctChars.value / totalChars) * 100) : 0;
                    
                    // 计算平均速度
                    const avgSpeed = duration > 0 ? Math.round(totalChars / duration) : 0;
                    
                    lastResult.value = {
                        wpm,
                        accuracy,
                        duration,
                        totalChars,
                        errors: errorCount.value,
                        avgSpeed,
                        mode: selectedMode.value,
                        language: selectedLanguage.value,
                        difficulty: selectedDifficulty.value,
                        timestamp: Date.now()
                    };
                    
                    // 保存到历史记录
                    testHistory.value.push({ ...lastResult.value });
                    saveToStorage();
                };

                const getCharClass = (index) => {
                    const input = userInput.value;
                    const target = displayText.value;
                    
                    if (index < input.length) {
                        if (input[index] === target[index]) {
                            return 'correct';
                        } else {
                            return 'incorrect';
                        }
                    } else if (index === input.length && isTestActive.value) {
                        return 'current';
                    }
                    
                    return '';
                };

                const closeResult = () => {
                    showResult.value = false;
                };

                const retryTest = () => {
                    closeResult();
                    resetTest();
                    setTimeout(() => {
                        startTest();
                    }, 500);
                };

                const shareResult = async () => {
                    const result = lastResult.value;
                    const shareText = `我在打字测试中取得了 ${result.wpm} WPM 的成绩，准确率 ${result.accuracy}%！`;
                    
                    if (navigator.share) {
                        try {
                            await navigator.share({
                                title: '打字测试成绩',
                                text: shareText,
                                url: window.location.href
                            });
                        } catch (error) {
                            console.log('分享被取消');
                        }
                    } else if (navigator.clipboard) {
                        try {
                            await navigator.clipboard.writeText(shareText);
                            showToast('成绩已复制到剪贴板', 'success');
                        } catch (error) {
                            showToast('复制失败', 'error');
                        }
                    } else {
                        showToast('不支持分享功能', 'error');
                    }
                };

                const clearHistory = () => {
                    if (confirm('确定要清空所有测试历史吗？')) {
                        testHistory.value = [];
                        saveToStorage();
                        showToast('历史记录已清空', 'info');
                    }
                };

                const getModeName = (mode) => {
                    const modeNames = {
                        time: '计时模式',
                        words: '字数模式',
                        sentences: '句子模式'
                    };
                    return modeNames[mode] || mode;
                };

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

                const saveToStorage = () => {
                    try {
                        const data = {
                            testHistory: testHistory.value,
                            selectedMode: selectedMode.value,
                            selectedTime: selectedTime.value,
                            selectedWords: selectedWords.value,
                            selectedLanguage: selectedLanguage.value,
                            selectedDifficulty: selectedDifficulty.value
                        };
                        localStorage.setItem('typingTestData', JSON.stringify(data));
                    } catch (error) {
                        console.error('保存数据失败:', error);
                    }
                };

                const loadFromStorage = () => {
                    try {
                        const data = localStorage.getItem('typingTestData');
                        if (data) {
                            const parsed = JSON.parse(data);
                            testHistory.value = parsed.testHistory || [];
                            selectedMode.value = parsed.selectedMode || 'time';
                            selectedTime.value = parsed.selectedTime || 60;
                            selectedWords.value = parsed.selectedWords || 50;
                            selectedLanguage.value = parsed.selectedLanguage || 'chinese';
                            selectedDifficulty.value = parsed.selectedDifficulty || 'medium';
                        }
                    } catch (error) {
                        console.error('加载数据失败:', error);
                    }
                };

                const showToast = (message, type = 'info') => {
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
                        zIndex: '10001',
                        transform: 'translateX(100%)',
                        transition: 'transform 0.3s ease',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                    });
                    
                    // 设置颜色
                    const colors = {
                        success: '#38a169',
                        error: '#e53e3e',
                        warning: '#d69e2e',
                        info: '#637cec'
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
                };

                // 组件挂载
                onMounted(() => {
                    loadFromStorage();
                    
                    // 预生成示例文本
                    displayText.value = '点击开始按钮开始测试...';
                    
                    // 添加键盘事件监听
                    document.addEventListener('keydown', (event) => {
                        // 空格键开始测试
                        if (event.code === 'Space' && !isTestActive.value && canStart.value) {
                            event.preventDefault();
                            startTest();
                        }
                        
                        // ESC键重置测试
                        if (event.code === 'Escape') {
                            if (showResult.value) {
                                closeResult();
                            } else if (isTestActive.value) {
                                resetTest();
                            }
                        }
                    });
                    
                    console.log('打字测试应用启动成功');
                });

                return {
                    // 状态
                    isTestActive,
                    isPaused,
                    isLoading,
                    showResult,
                    canStart,
                    
                    // 配置
                    selectedMode,
                    selectedTime,
                    selectedWords,
                    selectedLanguage,
                    selectedDifficulty,
                    testModes,
                    timeOptions,
                    wordOptions,
                    languageOptions,
                    difficultyOptions,
                    
                    // 测试数据
                    displayText,
                    userInput,
                    currentPosition,
                    timeRemaining,
                    
                    // 统计数据
                    currentWPM,
                    currentAccuracy,
                    typedChars,
                    errorCount,
                    testProgress,
                    
                    // 历史和结果
                    testHistory,
                    lastResult,
                    
                    // 方法
                    startTest,
                    pauseTest,
                    resumeTest,
                    stopTest,
                    resetTest,
                    handleInput,
                    handleKeydown,
                    getCharClass,
                    closeResult,
                    retryTest,
                    shareResult,
                    clearHistory,
                    getModeName,
                    formatTime
                };
            }
        });

        app.mount('#app');
        console.log('打字测试应用挂载成功');
        
    } catch (error) {
        console.error('应用初始化失败:', error);
        showFallbackContent();
    }
});

// 降级内容
function showFallbackContent() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #4a5568;">
                <h1 style="color: #1a202c; margin-bottom: 20px;">打字速度测试</h1>
                <p style="margin-bottom: 30px;">抱歉，应用加载失败。请刷新页面重试。</p>
                <button onclick="window.location.reload()" style="padding: 12px 24px; background: #637cec; color: white; border: none; border-radius: 8px; cursor: pointer;">
                    重新加载
                </button>
            </div>
        `;
    }
}
