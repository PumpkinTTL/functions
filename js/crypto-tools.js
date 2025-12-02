// 加密工具JavaScript
window.addEventListener('load', function() {
    // 等待CDN资源加载完成
    setTimeout(function() {
        // 检查Vue是否加载
        if (typeof Vue === 'undefined') {
            console.error('Vue 未加载，尝试重新加载...');
            // 动态加载Vue
            const vueScript = document.createElement('script');
            vueScript.src = 'https://unpkg.com/vue@3/dist/vue.global.js';
            vueScript.onload = function() {
                initApp();
            };
            vueScript.onerror = function() {
                console.error('Vue CDN加载失败');
                showFallbackContent();
            };
            document.head.appendChild(vueScript);
        }
        // 检查CryptoJS是否加载
        else if (typeof CryptoJS === 'undefined') {
            console.error('CryptoJS 未加载，尝试重新加载...');
            // 动态加载CryptoJS
            const cryptoScript = document.createElement('script');
            cryptoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.2.0/crypto-js.min.js';
            cryptoScript.onload = function() {
                initApp();
            };
            cryptoScript.onerror = function() {
                console.error('CryptoJS CDN加载失败');
                showFallbackContent();
            };
            document.head.appendChild(cryptoScript);
        } else {
            // 两个库都加载完成，初始化应用
            initApp();
        }
    }, 1000); // 延迟1秒确保CDN资源加载
});

// 初始化应用函数
function initApp() {

    const { createApp, ref, computed, watch, onMounted } = Vue;

    try {
        // 创建Vue应用
        const app = createApp({
            setup() {
                // 响应式数据
                const inputText = ref('');
                const outputText = ref('');
                const errorMessage = ref('');
                const aesPassword = ref('');
                const showPassword = ref(false);
                const activeTab = ref('md5');

                // 算法标签配置
                const algorithmTabs = ref([
                    { id: 'md5', name: 'MD5', icon: 'fas fa-fingerprint' },
                    { id: 'sha256', name: 'SHA256', icon: 'fas fa-hashtag' },
                    { id: 'aes', name: 'AES', icon: 'fas fa-lock' }
                ]);

                // 示例数据
                const sampleText = "这是一个需要加密的测试文本内容，包含中文和English混合内容！";

                // 计算属性
                const hasContent = computed(() => inputText.value.trim() !== '');
                const canEncrypt = computed(() => hasContent.value && aesPassword.value.length >= 8);
                const canDecrypt = computed(() => hasContent.value && aesPassword.value.length >= 8);

                const stats = computed(() => {
                    return {
                        algorithms: 3,
                        operations: outputText.value ? 1 : 0
                    };
                });

                // 切换标签
                function switchTab(tabId) {
                    activeTab.value = tabId;
                    clearResults();
                    errorMessage.value = '';

                    if (tabId === 'aes') {
                        if (!aesPassword.value) {
                            aesPassword.value = generateRandomPassword();
                        }
                    }
                }

                // 清空结果
                function clearResults() {
                    outputText.value = '';
                }

                // 清空输入
                function clearInput() {
                    inputText.value = '';
                    clearResults();
                    errorMessage.value = '';
                }

                // 加载示例
                function loadSample() {
                    inputText.value = sampleText;
                    errorMessage.value = '';

                    showToast('已加载示例文本', 'success');
                }

                // 生成随机密码
                function generateRandomPassword() {
                    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
                    let password = '';
                    for (let i = 0; i < 16; i++) {
                        password += chars.charAt(Math.floor(Math.random() * chars.length));
                    }
                    aesPassword.value = password;
                    showToast('已生成随机密码', 'success');
                }

                // 切换密码显示状态
                function togglePasswordVisibility() {
                    showPassword.value = !showPassword.value;
                }

                // 从剪贴板粘贴
                async function pasteFromClipboard() {
                    try {
                        const text = await navigator.clipboard.readText();
                        inputText.value = text;
                        onInputChange();
                        showToast('已粘贴内容', 'success');
                    } catch (error) {
                        showToast('无法访问剪贴板', 'error');
                    }
                }

                // MD5 哈希
                function generateMD5(text) {
                    return CryptoJS.MD5(text).toString();
                }

                // SHA256 哈希
                function generateSHA256(text) {
                    return CryptoJS.SHA256(text).toString();
                }

                // AES 加密
                function encryptAES() {
                    if (!canEncrypt.value) {
                        errorMessage.value = '请输入要加密的内容和至少8位的密码';
                        return;
                    }

                    try {
                        const encrypted = CryptoJS.AES.encrypt(inputText.value, aesPassword.value).toString();
                        outputText.value = encrypted;
                        errorMessage.value = '';

                        showToast('AES加密成功！', 'success');
                    } catch (error) {
                        errorMessage.value = `AES加密失败: ${error.message}`;
                        showToast('AES加密失败', 'error');
                    }
                }

                // AES 解密
                function decryptAES() {
                    if (!canDecrypt.value) {
                        errorMessage.value = '请输入要解密的内容和至少8位的密码';
                        return;
                    }

                    try {
                        const decrypted = CryptoJS.AES.decrypt(inputText.value, aesPassword.value);
                        const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

                        if (!plaintext) {
                            throw new Error('解密失败，可能是密码错误或内容格式不正确');
                        }

                        outputText.value = plaintext;
                        errorMessage.value = '';

                        showToast('AES解密成功！', 'success');
                    } catch (error) {
                        errorMessage.value = `AES解密失败: ${error.message}`;
                        outputText.value = '';
                        showToast('AES解密失败，请检查密码和输入内容', 'error');
                    }
                }

                // 生成哈希
                function hashText() {
                    if (!hasContent.value) {
                        errorMessage.value = '请输入要生成哈希的内容';
                        return;
                    }

                    try {
                        let result = '';
                        const resultClass = [];

                        switch (activeTab.value) {
                            case 'md5':
                                result = generateMD5(inputText.value);
                                resultClass.push('hashed');
                                break;
                            case 'sha256':
                                result = generateSHA256(inputText.value);
                                resultClass.push('hashed');
                                break;
                        }

                        outputText.value = result;
                        errorMessage.value = '';

                        // 添加样式类
                        setTimeout(() => {
                            const resultElement = document.querySelector('.result-text');
                            if (resultElement) {
                                resultElement.classList.add(...resultClass);
                            }
                        }, 50);

                        showToast(`${getAlgorithmName()}生成成功！`, 'success');
                    } catch (error) {
                        errorMessage.value = `${getAlgorithmName()}生成失败: ${error.message}`;
                        showToast('生成失败', 'error');
                    }
                }

                // 复制到剪贴板
                async function copyToClipboard() {
                    if (!outputText.value) return;

                    try {
                        await navigator.clipboard.writeText(outputText.value);
                        showToast('已复制到剪贴板', 'success');
                    } catch (error) {
                        // 降级处理
                        const textArea = document.createElement('textarea');
                        textArea.value = outputText.value;
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);

                        showToast('已复制到剪贴板', 'success');
                    }
                }

                // 下载结果
                function downloadResult() {
                    if (!outputText.value) return;

                    const filename = activeTab.value === 'aes'
                        ? `aes-${inputText.value.length > 20 ? 'encrypted' : 'decrypted'}-${new Date().getTime()}.txt`
                        : `${activeTab.value}-hash-${new Date().getTime()}.txt`;

                    const blob = new Blob([outputText.value], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    showToast('文件下载成功', 'success');
                }

                // 输入变化处理
                function onInputChange() {
                    errorMessage.value = '';

                    // AES模式下自动验证密码
                    if (activeTab.value === 'aes' && aesPassword.value && aesPassword.value.length < 8) {
                        errorMessage.value = '密码长度至少需要8位';
                    }
                }

                // 密码变化处理
                function onPasswordChange() {
                    if (activeTab.value === 'aes' && aesPassword.value && aesPassword.value.length < 8) {
                        errorMessage.value = '密码长度至少需要8位';
                    } else {
                        errorMessage.value = '';
                    }
                }

                // 键盘快捷键处理
                function handleKeydown(event) {
                    if (event.ctrlKey || event.metaKey) {
                        switch (event.key) {
                            case 'Enter':
                                event.preventDefault();
                                if (activeTab.value === 'aes') {
                                    encryptAES();
                                } else {
                                    hashText();
                                }
                                break;
                            case 's':
                                event.preventDefault();
                                downloadResult();
                                break;
                            case 'c':
                                if (window.getSelection().toString() === '') {
                                    event.preventDefault();
                                    copyToClipboard();
                                }
                                break;
                            case 'v':
                                // 让默认的粘贴行为处理
                                break;
                        }
                    }
                }

                // 获取算法名称
                function getAlgorithmName() {
                    const names = {
                        'md5': 'MD5',
                        'sha256': 'SHA256',
                        'aes': 'AES'
                    };
                    return names[activeTab.value] || '';
                }

                // 获取输出标题
                function getOutputTitle() {
                    const titles = {
                        'md5': 'MD5哈希结果',
                        'sha256': 'SHA256哈希结果',
                        'aes': 'AES加解密结果'
                    };
                    return titles[activeTab.value] || '处理结果';
                }

                // 获取占位符文本
                function getPlaceholder() {
                    const placeholders = {
                        'md5': '请输入要生成MD5哈希的文本内容...',
                        'sha256': '请输入要生成SHA256哈希的文本内容...',
                        'aes': '请输入要加密或解密的文本内容...'
                    };
                    return placeholders[activeTab.value] || '请输入文本内容...';
                }

                // 获取输出占位符
                function getOutputPlaceholder() {
                    const placeholders = {
                        'md5': 'MD5哈希结果将显示在这里',
                        'sha256': 'SHA256哈希结果将显示在这里',
                        'aes': 'AES加解密结果将显示在这里'
                    };
                    return placeholders[activeTab.value] || '处理结果将显示在这里';
                }

                // 获取提示文本
                function getHintText() {
                    const hints = {
                        'md5': 'MD5是不可逆的哈希算法，适用于数据校验和密码存储',
                        'sha256': 'SHA256是安全的哈希算法，适用于数字签名和区块链',
                        'aes': 'AES是对称加密算法，加密和解密使用相同密码，请妥善保管密码'
                    };
                    return hints[activeTab.value] || '';
                }

                // Toast提示函数
                function showToast(message, type = 'info') {
                    const toast = document.createElement('div');
                    toast.className = 'toast';
                    toast.textContent = message;

                    const colors = {
                        success: '#38a169',
                        error: '#e53e3e',
                        warning: '#d69e2e',
                        info: '#637cec'
                    };

                    toast.style.cssText = `
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        background: ${colors[type] || colors.info};
                        color: white;
                        padding: 12px 20px;
                        border-radius: 8px;
                        z-index: 10000;
                        font-size: 14px;
                        box-shadow: 0 4px 12px ${colors[type] || colors.info}40;
                        animation: slideInRight 0.3s ease;
                        max-width: 300px;
                        word-wrap: break-word;
                    `;

                    // 添加动画样式
                    if (!document.getElementById('toast-styles')) {
                        const styles = document.createElement('style');
                        styles.id = 'toast-styles';
                        styles.textContent = `
                            @keyframes slideInRight {
                                from { transform: translateX(100%); opacity: 0; }
                                to { transform: translateX(0); opacity: 1; }
                            }
                            @keyframes slideOutRight {
                                from { transform: translateX(0); opacity: 1; }
                                to { transform: translateX(100%); opacity: 0; }
                            }
                        `;
                        document.head.appendChild(styles);
                    }

                    document.body.appendChild(toast);

                    setTimeout(() => {
                        toast.style.animation = 'slideOutRight 0.3s ease';
                        setTimeout(() => {
                            if (toast.parentNode) {
                                toast.parentNode.removeChild(toast);
                            }
                        }, 300);
                    }, 3000);
                }

                // 组件挂载时执行
                onMounted(() => {
                    console.log('加密工具加载完成');

                    // 添加页面可见性变化监听
                    document.addEventListener('visibilitychange', () => {
                        if (!document.hidden) {
                            // 页面重新可见时可以执行一些操作
                        }
                    });

                    // 防止意外刷新时丢失数据
                    window.addEventListener('beforeunload', (event) => {
                        if (hasContent.value && !outputText.value) {
                            event.preventDefault();
                            event.returnValue = '您有未处理的加密数据，确定要离开吗？';
                        }
                    });

                    // 监听密码变化
                    watch(aesPassword, onPasswordChange);
                });

                // 返回数据和方法
                return {
                    inputText,
                    outputText,
                    errorMessage,
                    aesPassword,
                    showPassword,
                    activeTab,
                    algorithmTabs,
                    hasContent,
                    canEncrypt,
                    canDecrypt,
                    stats,
                    switchTab,
                    clearInput,
                    loadSample,
                    generatePassword,
                    togglePasswordVisibility,
                    pasteFromClipboard,
                    encryptAES,
                    decryptAES,
                    hashText,
                    copyToClipboard,
                    downloadResult,
                    onInputChange,
                    handleKeydown,
                    getAlgorithmName,
                    getOutputTitle,
                    getPlaceholder,
                    getOutputPlaceholder,
                    getHintText
                };
            }
        });

        // 挂载应用
        app.mount('#app');
        console.log('加密工具Vue应用挂载成功');

    } catch (error) {
        console.error('加密工具Vue应用初始化失败:', error);

        // 降级处理：显示基础功能
        showFallbackContent();
    }
}

// 降级内容函数
function showFallbackContent() {
    const app = document.getElementById('app');
    if (app) {
        app.innerHTML = `
            <div style="padding: 20px; max-width: 1200px; margin: 0 auto;">
                <div style="margin-bottom: 20px;">
                    <a href="index.html" style="color: #637cec; text-decoration: none;">
                        <i class="fas fa-home"></i> 返回首页
                    </a>
                </div>
                <h1 style="color: #1a202c; margin-bottom: 10px;">加密工具集合</h1>
                <p style="color: #4a5568; margin-bottom: 30px;">MD5、SHA256、AES加密解密工具</p>

                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <h3 style="color: #1a202c; margin-bottom: 10px;">工具说明</h3>
                    <p style="color: #4a5568; line-height: 1.6;">
                        此工具集合提供以下功能：<br>
                        • MD5哈希：生成32位MD5哈希值<br>
                        • SHA256哈希：生成64位SHA256哈希值<br>
                        • AES加密：使用AES算法加密文本<br>
                        • AES解密：使用AES算法解密文本<br>
                        • 安全可靠：使用CryptoJS库，客户端处理
                    </p>
                    <p style="color: #e53e3e; margin-top: 15px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        当前浏览器环境不支持高级功能，请使用现代浏览器以获得完整体验。
                    </p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="index.html" style="background: #637cec; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        <i class="fas fa-arrow-left"></i> 返回功能导航
                    </a>
                </div>
            </div>
        `;
    }
}

// 工具函数：MD5哈希
window.generateMD5 = function(text) {
    if (typeof CryptoJS === 'undefined') return null;
    return CryptoJS.MD5(text).toString();
};

// 工具函数：SHA256哈希
window.generateSHA256 = function(text) {
    if (typeof CryptoJS === 'undefined') return null;
    return CryptoJS.SHA256(text).toString();
};

// 工具函数：AES加密
window.encryptAES = function(text, password) {
    if (typeof CryptoJS === 'undefined') return null;
    try {
        return CryptoJS.AES.encrypt(text, password).toString();
    } catch (error) {
        return null;
    }
};

// 工具函数：AES解密
window.decryptAES = function(encryptedText, password) {
    if (typeof CryptoJS === 'undefined') return null;
    try {
        const decrypted = CryptoJS.AES.decrypt(encryptedText, password);
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        return null;
    }
};