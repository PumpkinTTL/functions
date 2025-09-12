const { createApp } = Vue;

createApp({
    data() {
        return {
            // 待办事项列表
            todos: [],
            
            // 新待办事项
            newTodo: '',
            newPriority: 'medium',
            
            // 输入错误信息
            inputError: '',
            
            // 当前筛选条件
            currentFilter: 'all',
            
            // 筛选选项
            filters: [
                { value: 'all', label: '全部', icon: 'fas fa-list' },
                { value: 'pending', label: '待完成', icon: 'fas fa-clock' },
                { value: 'completed', label: '已完成', icon: 'fas fa-check-circle' },
                { value: 'high', label: '高优先级', icon: 'fas fa-exclamation' }
            ],
            
            // 编辑状态
            editingTodo: null,
            editText: '',
            editPriority: 'medium',
            
            // ID计数器
            nextId: 1
        }
    },
    
    computed: {
        // 总任务数
        totalTodos() {
            return this.todos.length;
        },
        
        // 已完成任务数
        completedTodos() {
            return this.todos.filter(todo => todo.completed).length;
        },
        
        // 待处理任务数
        pendingTodos() {
            return this.todos.filter(todo => !todo.completed).length;
        },
        
        // 完成率
        completionRate() {
            if (this.totalTodos === 0) return 0;
            return Math.round((this.completedTodos / this.totalTodos) * 100);
        },
        
        // 筛选后的待办事项
        filteredTodos() {
            switch (this.currentFilter) {
                case 'pending':
                    return this.todos.filter(todo => !todo.completed);
                case 'completed':
                    return this.todos.filter(todo => todo.completed);
                case 'high':
                    return this.todos.filter(todo => todo.priority === 'high');
                default:
                    return this.todos;
            }
        }
    },
    
    methods: {
        // 添加新待办事项
        addTodo() {
            const text = this.newTodo.trim();
            
            // 验证输入
            if (!text) {
                this.inputError = '请输入待办事项内容';
                return;
            }
            
            if (text.length > 100) {
                this.inputError = '待办事项内容不能超过100个字符';
                return;
            }
            
            // 检查重复
            if (this.todos.some(todo => todo.text.toLowerCase() === text.toLowerCase())) {
                this.inputError = '该待办事项已存在';
                return;
            }
            
            // 添加新待办事项
            const newTodo = {
                id: this.nextId++,
                text: text,
                completed: false,
                priority: this.newPriority,
                createdAt: new Date(),
                completedAt: null
            };
            
            this.todos.unshift(newTodo);
            
            // 重置输入
            this.newTodo = '';
            this.newPriority = 'medium';
            this.inputError = '';
            
            // 保存到本地存储
            this.saveToLocal();
            
            // 显示成功消息
            this.showMessage('添加成功！', 'success');
        },
        
        // 切换待办事项完成状态
        toggleTodo(id) {
            const todo = this.todos.find(t => t.id === id);
            if (todo) {
                todo.completed = !todo.completed;
                todo.completedAt = todo.completed ? new Date() : null;
                this.saveToLocal();
                
                const message = todo.completed ? '任务已完成！' : '任务已恢复';
                this.showMessage(message, 'success');
            }
        },
        
        // 删除待办事项
        deleteTodo(id) {
            if (confirm('确定要删除这个待办事项吗？')) {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveToLocal();
                this.showMessage('删除成功！', 'success');
            }
        },
        
        // 开始编辑待办事项
        editTodo(todo) {
            this.editingTodo = todo;
            this.editText = todo.text;
            this.editPriority = todo.priority;
            
            // 下一帧聚焦输入框
            this.$nextTick(() => {
                if (this.$refs.editInput) {
                    this.$refs.editInput.focus();
                    this.$refs.editInput.select();
                }
            });
        },
        
        // 保存编辑
        saveEdit() {
            const text = this.editText.trim();
            
            if (!text) {
                this.showMessage('请输入待办事项内容', 'error');
                return;
            }
            
            if (text.length > 100) {
                this.showMessage('待办事项内容不能超过100个字符', 'error');
                return;
            }
            
            // 检查重复（排除当前编辑的项目）
            if (this.todos.some(todo => 
                todo.id !== this.editingTodo.id && 
                todo.text.toLowerCase() === text.toLowerCase()
            )) {
                this.showMessage('该待办事项已存在', 'error');
                return;
            }
            
            // 更新待办事项
            this.editingTodo.text = text;
            this.editingTodo.priority = this.editPriority;
            
            this.cancelEdit();
            this.saveToLocal();
            this.showMessage('编辑成功！', 'success');
        },
        
        // 取消编辑
        cancelEdit() {
            this.editingTodo = null;
            this.editText = '';
            this.editPriority = 'medium';
        },
        
        // 清除已完成的待办事项
        clearCompleted() {
            if (this.completedTodos === 0) return;
            
            if (confirm(`确定要清除${this.completedTodos}个已完成的待办事项吗？`)) {
                this.todos = this.todos.filter(todo => !todo.completed);
                this.saveToLocal();
                this.showMessage('已清除所有已完成的待办事项', 'success');
            }
        },
        
        // 清空所有待办事项
        clearAll() {
            if (this.totalTodos === 0) return;
            
            if (confirm(`确定要清空所有${this.totalTodos}个待办事项吗？此操作不可恢复！`)) {
                this.todos = [];
                this.nextId = 1;
                this.saveToLocal();
                this.showMessage('已清空所有待办事项', 'success');
            }
        },
        
        // 获取优先级文本
        getPriorityText(priority) {
            const priorityMap = {
                high: '高优先级',
                medium: '中优先级',
                low: '低优先级'
            };
            return priorityMap[priority] || '未知';
        },
        
        // 格式化时间
        formatTime(date) {
            if (!date) return '';
            
            const now = new Date();
            const target = new Date(date);
            const diffMs = now - target;
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            
            if (diffDays > 0) {
                return `${diffDays}天前`;
            } else if (diffHours > 0) {
                return `${diffHours}小时前`;
            } else if (diffMinutes > 0) {
                return `${diffMinutes}分钟前`;
            } else {
                return '刚刚';
            }
        },
        
        // 获取空状态消息
        getEmptyMessage() {
            switch (this.currentFilter) {
                case 'pending':
                    return '没有待完成的任务';
                case 'completed':
                    return '还没有完成任何任务';
                case 'high':
                    return '没有高优先级任务';
                default:
                    return '暂无待办事项';
            }
        },
        
        // 获取空状态子消息
        getEmptySubMessage() {
            switch (this.currentFilter) {
                case 'pending':
                    return '恭喜！您已经完成了所有任务';
                case 'completed':
                    return '完成一些任务来查看您的成就';
                case 'high':
                    return '当前没有紧急任务需要处理';
                default:
                    return '添加一些待办事项来开始管理您的任务';
            }
        },
        
        // 保存到本地存储
        saveToLocal() {
            try {
                const data = {
                    todos: this.todos,
                    nextId: this.nextId
                };
                localStorage.setItem('todolist-data', JSON.stringify(data));
            } catch (error) {
                console.error('保存数据失败:', error);
                this.showMessage('保存数据失败', 'error');
            }
        },
        
        // 从本地存储加载
        loadFromLocal() {
            try {
                const data = localStorage.getItem('todolist-data');
                if (data) {
                    const parsed = JSON.parse(data);
                    this.todos = parsed.todos || [];
                    this.nextId = parsed.nextId || 1;
                    
                    // 转换日期字符串为Date对象
                    this.todos.forEach(todo => {
                        if (todo.createdAt) {
                            todo.createdAt = new Date(todo.createdAt);
                        }
                        if (todo.completedAt) {
                            todo.completedAt = new Date(todo.completedAt);
                        }
                    });
                }
            } catch (error) {
                console.error('加载数据失败:', error);
                this.showMessage('加载数据失败', 'error');
            }
        },
        
        // 显示消息
        showMessage(message, type = 'info') {
            const messageEl = document.createElement('div');
            messageEl.className = `message message-${type}`;
            messageEl.textContent = message;
            
            Object.assign(messageEl.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                zIndex: '10001',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease',
                maxWidth: '300px',
                wordWrap: 'break-word',
                fontSize: '0.9rem'
            });
            
            if (type === 'success') {
                messageEl.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
            } else if (type === 'error') {
                messageEl.style.background = 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)';
            } else {
                messageEl.style.background = 'linear-gradient(135deg, #637cec 0%, #5a67d8 100%)';
            }
            
            document.body.appendChild(messageEl);
            
            setTimeout(() => {
                messageEl.style.transform = 'translateX(0)';
            }, 100);
            
            setTimeout(() => {
                messageEl.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    if (document.body.contains(messageEl)) {
                        document.body.removeChild(messageEl);
                    }
                }, 300);
            }, 3000);
        },
        
        // 处理键盘快捷键
        handleKeyboard(e) {
            // Esc 取消编辑
            if (e.key === 'Escape' && this.editingTodo) {
                this.cancelEdit();
            }
            
            // Ctrl/Cmd + Enter 添加任务
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !this.editingTodo) {
                e.preventDefault();
                if (this.newTodo.trim()) {
                    this.addTodo();
                }
            }
        },
        
        // 清除输入错误
        clearInputError() {
            if (this.inputError) {
                this.inputError = '';
            }
        }
    },
    
    watch: {
        // 监听输入变化，清除错误信息
        newTodo() {
            this.clearInputError();
        }
    },
    
    mounted() {
        // 加载本地数据
        this.loadFromLocal();
        
        // 添加键盘事件监听
        document.addEventListener('keydown', this.handleKeyboard);
        
        // 添加一些示例数据（如果没有数据的话）
        if (this.todos.length === 0) {
            const sampleTodos = [
                {
                    id: this.nextId++,
                    text: '完成项目文档编写',
                    completed: false,
                    priority: 'high',
                    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2小时前
                    completedAt: null
                },
                {
                    id: this.nextId++,
                    text: '制定下周工作计划',
                    completed: false,
                    priority: 'medium',
                    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30分钟前
                    completedAt: null
                },
                {
                    id: this.nextId++,
                    text: '学习Vue.js新特性',
                    completed: true,
                    priority: 'low',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1天前
                    completedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12小时前完成
                }
            ];
            
            this.todos = sampleTodos;
            this.saveToLocal();
        }
        
        // 页面加载完成提示
        setTimeout(() => {
            this.showMessage('欢迎使用智能待办管理器！', 'success');
        }, 1000);
    },
    
    beforeUnmount() {
        // 移除键盘事件监听
        document.removeEventListener('keydown', this.handleKeyboard);
    }
}).mount('#app');
