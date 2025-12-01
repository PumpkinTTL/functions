// JSON格式化工具JavaScript
window.addEventListener('load', function() {
    // 检查Vue是否加载
    if (typeof Vue === 'undefined') {
        console.error('Vue 未加载');
        return;
    }

    const { createApp, ref, computed, watch, onMounted } = Vue;

    try {
        // 创建Vue应用
        const app = createApp({
            setup() {
                // 响应式数据
                const inputText = ref('');
                const outputText = ref('');
                const errorMessage = ref('');
                const indentSize = ref('4');
                const showLineNumbers = ref(true);
                const wordWrap = ref(true);

                // 示例JSON数据
                const sampleJSON = {
                    "name": "JSON格式化工具",
                    "version": "1.0.0",
                    "description": "一个美观实用的JSON格式化工具",
                    "features": [
                        "JSON格式化",
                        "JSON压缩",
                        "语法高亮",
                        "错误检测",
                        "实时预览"
                    ],
                    "settings": {
                        "indent": 4,
                        "theme": "glassmorphism",
                        "lineNumbers": true,
                        "wordWrap": true
                    },
                    "author": {
                        "name": "Developer",
                        "email": "dev@example.com"
                    },
                    "stats": {
                        "totalUsers": 1000,
                        "activeUsers": 850,
                        "rating": 4.8
                    },
                    "isAvailable": true,
                    "lastUpdated": "2024-01-01T00:00:00Z",
                    "tags": ["json", "formatter", "tool", "web"],
                    "nullValue": null,
                    "numberValue": 42
                };

                // 计算属性
                const isEmpty = computed(() => !inputText.value.trim());
                const isValid = computed(() => {
                    if (isEmpty.value) return true;
                    try {
                        JSON.parse(inputText.value);
                        return true;
                    } catch {
                        return false;
                    }
                });

                const stats = computed(() => {
                    const text = inputText.value;
                    return {
                        characters: text.length.toLocaleString(),
                        lines: text.split('\n').length.toLocaleString()
                    };
                });

                const lineCount = computed(() => {
                    if (!outputText.value) return 0;
                    return outputText.value.split('\n').length;
                });

                const highlightedOutput = computed(() => {
                    if (!outputText.value) return '';
                    return highlightJSON(outputText.value);
                });

                // JSON语法高亮函数
                function highlightJSON(jsonString) {
                    return jsonString
                        .replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
                            let cls = 'json-number';
                            if (/^"/.test(match)) {
                                if (/:$/.test(match)) {
                                    cls = 'json-key';
                                } else {
                                    cls = 'json-string';
                                }
                            } else if (/true|false/.test(match)) {
                                cls = 'json-boolean';
                            } else if (/null/.test(match)) {
                                cls = 'json-null';
                            }
                            return '<span class="' + cls + '">' + match + '</span>';
                        })
                        .replace(/([\{\}\[\]])/g, '<span class="json-bracket">$1</span>');
                }

                // 格式化JSON
                function formatJson() {
                    if (isEmpty.value) return;

                    try {
                        const parsed = JSON.parse(inputText.value);
                        let indent = indentSize.value === 'tab' ? '\t' : parseInt(indentSize.value);
                        outputText.value = JSON.stringify(parsed, null, indent);
                        errorMessage.value = '';

                        // 显示成功提示
                        showToast('JSON格式化成功！', 'success');
                    } catch (error) {
                        errorMessage.value = `JSON格式错误: ${error.message}`;
                        outputText.value = '';

                        // 显示错误提示
                        showToast('JSON格式错误，请检查输入', 'error');
                    }
                }

                // 压缩JSON
                function compressJson() {
                    if (isEmpty.value) return;

                    try {
                        const parsed = JSON.parse(inputText.value);
                        outputText.value = JSON.stringify(parsed);
                        errorMessage.value = '';

                        // 显示成功提示
                        showToast('JSON压缩成功！', 'success');
                    } catch (error) {
                        errorMessage.value = `JSON格式错误: ${error.message}`;
                        outputText.value = '';

                        // 显示错误提示
                        showToast('JSON格式错误，请检查输入', 'error');
                    }
                }

                // 验证JSON
                function validateJson() {
                    if (isEmpty.value) return;

                    try {
                        JSON.parse(inputText.value);
                        errorMessage.value = '';

                        // 显示成功提示
                        showToast('JSON格式验证通过！', 'success');
                    } catch (error) {
                        errorMessage.value = `JSON格式错误: ${error.message}`;

                        // 显示错误提示
                        showToast('JSON格式验证失败', 'error');
                    }
                }

                // 清空所有内容
                function clearAll() {
                    inputText.value = '';
                    outputText.value = '';
                    errorMessage.value = '';

                    showToast('内容已清空', 'info');
                }

                // 清空输入
                function clearInput() {
                    inputText.value = '';
                    errorMessage.value = '';
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

                // 下载JSON文件
                function downloadJson() {
                    if (!outputText.value) return;

                    const blob = new Blob([outputText.value], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `formatted-json-${new Date().getTime()}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    showToast('文件下载成功', 'success');
                }

                // 加载示例
                function loadSample() {
                    inputText.value = JSON.stringify(sampleJSON, null, 4);
                    onInputChange();

                    showToast('已加载示例JSON', 'success');
                }

                // 切换行号显示
                function toggleLineNumbers() {
                    showLineNumbers.value = !showLineNumbers.value;
                }

                // 切换自动换行
                function toggleWordWrap() {
                    wordWrap.value = !wordWrap.value;
                }

                // 输入变化处理
                function onInputChange() {
                    // 自动验证
                    if (inputText.value.trim()) {
                        try {
                            JSON.parse(inputText.value);
                            errorMessage.value = '';
                        } catch (error) {
                            errorMessage.value = `JSON格式错误: ${error.message}`;
                        }
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
                                formatJson();
                                break;
                            case 's':
                                event.preventDefault();
                                downloadJson();
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

                // 监听缩进大小变化，自动重新格式化
                watch(indentSize, () => {
                    if (outputText.value && !errorMessage.value) {
                        formatJson();
                    }
                });

                // 组件挂载时执行
                onMounted(() => {
                    console.log('JSON格式化工具加载完成');

                    // 添加页面可见性变化监听，用于优化性能
                    document.addEventListener('visibilitychange', () => {
                        if (!document.hidden) {
                            // 页面重新可见时，可以执行一些清理或刷新操作
                        }
                    });

                    // 防止意外刷新时丢失数据
                    window.addEventListener('beforeunload', (event) => {
                        if (inputText.value.trim() && !outputText.value) {
                            event.preventDefault();
                            event.returnValue = '您有未保存的JSON数据，确定要离开吗？';
                        }
                    });
                });

                // 返回数据和方法
                return {
                    inputText,
                    outputText,
                    errorMessage,
                    indentSize,
                    showLineNumbers,
                    wordWrap,
                    isEmpty,
                    isValid,
                    stats,
                    lineCount,
                    highlightedOutput,
                    formatJson,
                    compressJson,
                    validateJson,
                    clearAll,
                    clearInput,
                    copyToClipboard,
                    pasteFromClipboard,
                    downloadJson,
                    loadSample,
                    toggleLineNumbers,
                    toggleWordWrap,
                    onInputChange,
                    handleKeydown
                };
            }
        });

        // 挂载应用
        app.mount('#app');
        console.log('JSON格式化工具Vue应用挂载成功');

    } catch (error) {
        console.error('JSON格式化工具Vue应用初始化失败:', error);

        // 降级处理：显示基础功能
        showFallbackContent();
    }
});

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
                <h1 style="color: #1a202c; margin-bottom: 10px;">JSON格式化工具</h1>
                <p style="color: #4a5568; margin-bottom: 30px;">美化、压缩和验证JSON数据</p>

                <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                    <h3 style="color: #1a202c; margin-bottom: 10px;">工具说明</h3>
                    <p style="color: #4a5568; line-height: 1.6;">
                        此工具提供以下功能：<br>
                        • JSON格式化：美化JSON数据，提高可读性<br>
                        • JSON压缩：移除空格和换行符，减少文件大小<br>
                        • JSON验证：检查JSON语法错误<br>
                        • 语法高亮：不同类型的数据用不同颜色显示<br>
                        • 错误提示：详细的错误信息和位置提示
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

// 工具函数：自动检测并格式化JSON
window.formatJSON = function(jsonString, indent = 2) {
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed, null, indent);
    } catch (error) {
        return null;
    }
};

// 工具函数：压缩JSON
window.compressJSON = function(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        return JSON.stringify(parsed);
    } catch (error) {
        return null;
    }
};

// 工具函数：验证JSON
window.validateJSON = function(jsonString) {
    try {
        JSON.parse(jsonString);
        return { valid: true, error: null };
    } catch (error) {
        return { valid: false, error: error.message };
    }
};