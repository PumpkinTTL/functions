// 加密工具JavaScript - 简化可靠版本
(function() {
    'use strict';

    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        // 检查依赖是否加载
        console.log('DOM加载完成，检查依赖...');
        console.log('Vue状态:', typeof Vue);
        console.log('CryptoJS状态:', typeof CryptoJS);

        // 如果依赖未加载，等待一段时间再检查
        if (typeof Vue === 'undefined' || typeof CryptoJS === 'undefined') {
            console.log('依赖尚未加载，等待...');
            setTimeout(initApp, 2000); // 等待2秒
        } else {
            initApp();
        }
    });

    function initApp() {
        // 再次检查依赖
        if (typeof Vue === 'undefined') {
            console.error('Vue 3 未加载');
            showError('Vue 3 库加载失败，请刷新页面重试');
            return;
        }

        if (typeof CryptoJS === 'undefined') {
            console.error('CryptoJS 未加载');
            showError('CryptoJS 库加载失败，请刷新页面重试');
            return;
        }

        try {
            const { createApp, ref, computed, watch, onMounted } = Vue;

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

                    // 示例文本
                    const sampleText = "这是一个需要加密的测试文本内容，包含中文和English混合内容！";

                    // 计算属性
                    const hasContent = computed(() => inputText.value.trim() !== '');
                    const canEncrypt = computed(() => hasContent.value && aesPassword.value.length >= 8);
                    const canDecrypt = computed(() => hasContent.value && aesPassword.value.length >= 8);

                    const stats = computed(() => ({
                        algorithms: 3,
                        operations: outputText.value ? 1 : 0
                    }));

                    // 切换标签
                    function switchTab(tabId) {
                        activeTab.value = tabId;
                        clearResults();
                        errorMessage.value = '';

                        if (tabId === 'aes' && !aesPassword.value) {
                            aesPassword.value = generateRandomPassword();
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

                    // 生成随机密码
                    function generateRandomPassword() {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
                        let password = '';
                        for (let i = 0; i < 16; i++) {
                            password += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        return password;
                    }

                    // 为密码输入框生成密码（HTML中调用的函数名）
                    function generatePassword() {
                        const newPassword = generateRandomPassword();
                        aesPassword.value = newPassword;
                        showMessage('已生成随机密码');
                    }

                    // 加载示例
                    function loadSample() {
                        inputText.value = sampleText;
                        errorMessage.value = '';
                        showMessage('已加载示例文本');
                    }

                    // 切换密码显示
                    function togglePasswordVisibility() {
                        showPassword.value = !showPassword.value;
                    }

                    // 生成MD5
                    function generateMD5(text) {
                        return CryptoJS.MD5(text).toString();
                    }

                    // 生成SHA256
                    function generateSHA256(text) {
                        return CryptoJS.SHA256(text).toString();
                    }

                    // AES加密
                    function encryptAES() {
                        if (!canEncrypt.value) {
                            errorMessage.value = '请输入要加密的内容和至少8位的密码';
                            return;
                        }

                        try {
                            const encrypted = CryptoJS.AES.encrypt(inputText.value, aesPassword.value).toString();
                            outputText.value = encrypted;
                            errorMessage.value = '';
                            showMessage('AES加密成功！');
                        } catch (error) {
                            errorMessage.value = `AES加密失败: ${error.message}`;
                            showMessage('加密失败', 'error');
                        }
                    }

                    // AES解密
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
                            showMessage('AES解密成功！');
                        } catch (error) {
                            errorMessage.value = `AES解密失败: ${error.message}`;
                            outputText.value = '';
                            showMessage('解密失败', 'error');
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
                            switch (activeTab.value) {
                                case 'md5':
                                    result = generateMD5(inputText.value);
                                    break;
                                case 'sha256':
                                    result = generateSHA256(inputText.value);
                                    break;
                            }

                            outputText.value = result;
                            errorMessage.value = '';
                            showMessage(`${getAlgorithmName()}生成成功！`);
                        } catch (error) {
                            errorMessage.value = `${getAlgorithmName()}生成失败: ${error.message}`;
                            showMessage('生成失败', 'error');
                        }
                    }

                    // 复制到剪贴板
                    async function copyToClipboard() {
                        if (!outputText.value) return;

                        try {
                            await navigator.clipboard.writeText(outputText.value);
                            showMessage('已复制到剪贴板');
                        } catch (error) {
                            // 降级处理
                            const textArea = document.createElement('textarea');
                            textArea.value = outputText.value;
                            document.body.appendChild(textArea);
                            textArea.select();
                            document.execCommand('copy');
                            document.body.removeChild(textArea);
                            showMessage('已复制到剪贴板');
                        }
                    }

                    // 下载结果
                    function downloadResult() {
                        if (!outputText.value) return;

                        const filename = activeTab.value === 'aes'
                            ? `aes-encrypted-${new Date().getTime()}.txt`
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

                        showMessage('文件下载成功');
                    }

                    // 输入变化处理
                    function onInputChange() {
                        errorMessage.value = '';
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

                    // 获取占位符
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

                    // 显示消息
                    function showMessage(message, type = 'success') {
                        const toast = document.createElement('div');
                        toast.textContent = message;
                        toast.className = 'toast';

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
                        console.log('加密工具应用挂载成功');

                        // 添加CSS动画
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
                        encryptAES,
                        decryptAES,
                        hashText,
                        copyToClipboard,
                        downloadResult,
                        onInputChange,
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
            console.log('加密工具Vue应用启动成功');

        } catch (error) {
            console.error('Vue应用初始化失败:', error);
            showError(`应用初始化失败: ${error.message}`);
        }
    }

    function showError(message) {
        const app = document.getElementById('app');
        if (app) {
            app.innerHTML = `
                <div style="padding: 20px; max-width: 1200px; margin: 0 auto; text-align: center;">
                    <div style="background: #fee; border: 1px solid #fcc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #c00; margin-bottom: 10px;">❌ 加载失败</h2>
                        <p style="color: #600; margin-bottom: 20px;">${message}</p>
                        <button onclick="location.reload()" style="background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer;">🔄 重新加载页面</button>
                        <button onclick="location.href='index.html'" style="background: #6c757d; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">🏠 返回首页</button>
                    </div>
                </div>
            `;
        }
    }

})();