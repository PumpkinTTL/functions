// 简化的Vue应用，避免CDN依赖问题
window.addEventListener('load', function() {
  // 检查Vue是否加载
  if (typeof Vue === 'undefined') {
    console.error('Vue 未加载');
    showFallbackContent();
    return;
  }

  const { createApp, ref, onMounted } = Vue;

  try {
    // 创建简化的Vue应用
    const app = createApp({
      setup() {
        // 导航项数据
        const navItems = ref([
          {
            key: 'calcencrypt',
            icon: 'fas fa-calculator',
            title: '加密货币计算器',
            color: '#637cec',
            url: 'calcencrypt.html'
          },
          {
            key: 'pwdgen',
            icon: 'fas fa-key',
            title: '智能密码生成器',
            color: '#38a169',
            url: 'pwdgen.html'
          },
          {
            key: 'todolist',
            icon: 'fas fa-tasks',
            title: '智能待办管理器',
            color: '#d69e2e',
            url: 'todolist.html'
          },
          {
            key: 'decision-wheel',
            icon: 'fas fa-dharmachakra',
            title: '随机决策轮盘',
            color: '#e53e3e',
            url: 'decision-wheel.html'
          }
        ]);

        // 统计数据
        const statsData = ref([
          {
            key: 'total-functions',
            title: '可用功能',
            value: 4,
            suffix: '个',
            prefix: ''
          },
          {
            key: 'crypto-calculator',
            title: '加密计算器',
            value: 1,
            suffix: '个',
            prefix: ''
          },
          {
            key: 'password-generator',
            title: '密码生成器',
            value: 1,
            suffix: '个',
            prefix: ''
          },
          {
            key: 'decision-wheel',
            title: '决策轮盘',
            value: 1,
            suffix: '个',
            prefix: ''
          }
        ]);

        // 点击处理函数
        const handleNavClick = (item) => {
          console.log(`点击导航: ${item.title}`);
          
          if (item.url) {
            // 创建简单提示
            showToast(`正在进入${item.title}...`);
            
            // 延迟跳转，让用户看到提示
            setTimeout(() => {
              window.location.href = item.url;
            }, 500);
          } else {
            showToast(`${item.title}功能暂未实现`);
          }
        };

        // 组件挂载时执行
        onMounted(() => {
          console.log('Vue应用加载完成');
        });

        return {
          navItems,
          statsData,
          handleNavClick
        };
      }
    });

    // 挂载应用
    app.mount('#app');
    console.log('Vue应用挂载成功');
    
  } catch (error) {
    console.error('Vue应用初始化失败:', error);
    showFallbackContent();
  }
});

// 提示函数
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #637cec;
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    z-index: 9999;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(99, 125, 236, 0.3);
    animation: slideIn 0.3s ease;
  `;
  
  // 添加动画样式
  if (!document.getElementById('toast-styles')) {
    const styles = document.createElement('style');
    styles.id = 'toast-styles';
    styles.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 2500);
}

// 降级内容
function showFallbackContent() {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML = `
      <div style="text-align: center; padding: 50px; color: #4a5568;">
        <h1 style="color: #1a202c; margin-bottom: 20px;">功能导航</h1>
        <p style="margin-bottom: 30px;">选择功能模块，开始工作</p>
        <div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; margin-bottom: 40px;">
          <button onclick="window.location.href='calcencrypt.html'" style="padding: 14px 24px; background: #637cec; color: white; border: none; border-radius: 8px; cursor: pointer;">🧮 加密货币计算器</button>
          <button onclick="window.location.href='pwdgen.html'" style="padding: 14px 24px; background: #38a169; color: white; border: none; border-radius: 8px; cursor: pointer;">🔑 智能密码生成器</button>
          <button onclick="window.location.href='todolist.html'" style="padding: 14px 24px; background: #d69e2e; color: white; border: none; border-radius: 8px; cursor: pointer;">📝 智能待办管理器</button>
          <button onclick="window.location.href='decision-wheel.html'" style="padding: 14px 24px; background: #e53e3e; color: white; border: none; border-radius: 8px; cursor: pointer;">🎲 随机决策轮盘</button>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center;">
            <div><div style="font-size: 1.8rem; color: #637cec; margin-bottom: 8px;">4个</div><div style="font-size: 0.85rem; color: #718096;">可用功能</div></div>
            <div><div style="font-size: 1.8rem; color: #637cec; margin-bottom: 8px;">1个</div><div style="font-size: 0.85rem; color: #718096;">加密计算器</div></div>
            <div><div style="font-size: 1.8rem; color: #38a169; margin-bottom: 8px;">1个</div><div style="font-size: 0.85rem; color: #718096;">密码生成器</div></div>
            <div><div style="font-size: 1.8rem; color: #e53e3e; margin-bottom: 8px;">1个</div><div style="font-size: 0.85rem; color: #718096;">决策轮盘</div></div>
          </div>
        </div>
      </div>
    `;
  }
}