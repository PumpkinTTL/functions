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
            key: 'dashboard',
            icon: 'fas fa-chart-pie',
            title: '数据看板',
            color: '#637cec'
          },
          {
            key: 'analytics',
            icon: 'fas fa-chart-line',
            title: '数据分析',
            color: '#637cec'
          },
          {
            key: 'users',
            icon: 'fas fa-users',
            title: '用户管理',
            color: '#637cec'
          },
          {
            key: 'content',
            icon: 'fas fa-edit',
            title: '内容管理',
            color: '#637cec'
          },
          {
            key: 'system',
            icon: 'fas fa-cog',
            title: '系统设置',
            color: '#637cec'
          },
          {
            key: 'reports',
            icon: 'fas fa-file-alt',
            title: '报表中心',
            color: '#637cec'
          }
        ]);

        // 统计数据
        const statsData = ref([
          {
            key: 'total-users',
            title: '总用户数',
            value: 15420,
            suffix: '人',
            prefix: ''
          },
          {
            key: 'active-sessions',
            title: '活跃会话',
            value: 2847,
            suffix: '个',
            prefix: ''
          },
          {
            key: 'monthly-revenue',
            title: '月度收入',
            value: 892.6,
            suffix: '万',
            prefix: '¥'
          },
          {
            key: 'growth-rate',
            title: '增长率',
            value: 28.5,
            suffix: '%',
            prefix: '+'
          }
        ]);

        // 点击处理函数
        const handleNavClick = (item) => {
          console.log(`点击导航: ${item.title}`);
          
          // 创建简单提示
          showToast(`正在进入${item.title}...`);
        };

        // 组件挂载时执行
        onMounted(() => {
          console.log('Vue应用加载完成');
          
          // 模拟数据更新
          setInterval(() => {
            statsData.value[1].value = Math.floor(Math.random() * 1000) + 2000;
            statsData.value[3].value = parseFloat((Math.random() * 10 + 25).toFixed(1));
          }, 10000);
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
          <button onclick="showToast('数据看板功能')" style="padding: 14px 24px; background: #637cec; color: white; border: none; border-radius: 8px; cursor: pointer;">📊 数据看板</button>
          <button onclick="showToast('数据分析功能')" style="padding: 14px 24px; background: #637cec; color: white; border: none; border-radius: 8px; cursor: pointer;">📈 数据分析</button>
          <button onclick="showToast('用户管理功能')" style="padding: 14px 24px; background: #637cec; color: white; border: none; border-radius: 8px; cursor: pointer;">👥 用户管理</button>
          <button onclick="showToast('内容管理功能')" style="padding: 14px 24px; background: #637cec; color: white; border: none; border-radius: 8px; cursor: pointer;">✏️ 内容管理</button>
          <button onclick="showToast('系统设置功能')" style="padding: 14px 24px; background: #637cec; color: white; border: none; border-radius: 8px; cursor: pointer;">⚙️ 系统设置</button>
          <button onclick="showToast('报表中心功能')" style="padding: 14px 24px; background: #637cec; color: white; border: none; border-radius: 8px; cursor: pointer;">📄 报表中心</button>
        </div>
        <div style="background: white; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; text-align: center;">
            <div><div style="font-size: 1.8rem; color: #637cec; margin-bottom: 8px;">15420人</div><div style="font-size: 0.85rem; color: #718096;">总用户数</div></div>
            <div><div style="font-size: 1.8rem; color: #38a169; margin-bottom: 8px;">2847个</div><div style="font-size: 0.85rem; color: #718096;">活跃会话</div></div>
            <div><div style="font-size: 1.8rem; color: #d69e2e; margin-bottom: 8px;">¥892.6万</div><div style="font-size: 0.85rem; color: #718096;">月度收入</div></div>
            <div><div style="font-size: 1.8rem; color: #e53e3e; margin-bottom: 8px;">+28.5%</div><div style="font-size: 0.85rem; color: #718096;">增长率</div></div>
          </div>
        </div>
      </div>
    `;
  }
}