// 创建Vue应用
const { createApp, ref } = Vue;

const App = {
  setup() {
    // 定义导航项数据
    const navItems = ref([
      {
        key: 'home',
        icon: '🏠',
        title: '首页',
        description: '返回系统首页'
      },
      {
        key: 'analytics',
        icon: '📊',
        title: '数据分析',
        description: '查看业务数据报表'
      },
      {
        key: 'settings',
        icon: '⚙️',
        title: '系统设置',
        description: '配置系统参数'
      },
      {
        key: 'users',
        icon: '👤',
        title: '用户管理',
        description: '管理系统用户'
      },
      {
        key: 'documents',
        icon: '📝',
        title: '文档中心',
        description: '查看系统文档'
      },
      {
        key: 'contact',
        icon: '📞',
        title: '联系我们',
        description: '获取联系信息'
      }
    ]);

    // 处理导航点击事件
    const handleNavClick = (item) => {
      console.log('点击导航项:', item.title);
      // 这里可以添加路由跳转逻辑
      // 例如: window.location.href = item.path;
    };

    return {
      navItems,
      handleNavClick
    };
  }
};

// 创建应用实例
const app = createApp(App);

// 挂载应用
app.mount('#app');
