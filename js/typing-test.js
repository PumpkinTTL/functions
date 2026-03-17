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
                    { value: 'mixed', label: '中英混合', icon: 'fas fa-language' },
                    { value: 'numbers', label: '数字混合', icon: 'fas fa-hashtag' },
                    { value: 'symbols', label: '符号挖战', icon: 'fas fa-at' },
                    { value: 'code', label: '代码片段', icon: 'fas fa-terminal' }
                ]);

                const difficultyOptions = ref([
                    { value: 'easy', label: '简单', icon: 'fas fa-leaf' },
                    { value: 'medium', label: '中等', icon: 'fas fa-star' },
                    { value: 'hard', label: '困难', icon: 'fas fa-fire' },
                    { value: 'expert', label: '专家', icon: 'fas fa-crown' },
                    { value: 'master', label: '大师', icon: 'fas fa-trophy' },
                    { value: 'legend', label: '传奇', icon: 'fas fa-medal' },
                    { value: 'coding', label: '编程', icon: 'fas fa-code' },
                    { value: 'nightmare', label: '噩梦', icon: 'fas fa-skull-crossbones' }
                ]);

                // 文本库
                const textSamples = {
                    chinese: {
                        easy: [
                            '春天来了，花儿开了，鸟儿唱歌。阳光明媚，微风习习，人们心情愉快。',
                            '我喜欢读书，因为书中有无穷的知识。每天阅读让我感到充实和快乐。',
                            '科技改变生活，互联网连接世界。我们要与时俱进，不断学习新知识。',
                            '健康是最重要的财富。规律作息，合理饮食，适量运动，保持好心情。',
                            '友谊珍贵，需要用心维护。真正的朋友会在你需要时伸出援手。',
                            '风和日丽的下午，公园里的湖水在阳光下闪闪发光。孩子们快乐地玩耶。',
                            '学习是一个终生的过程，每一天都是新的开始。保持好奇心，探索未知。',
                            '今天天气真好，蓝天白云，微风徐徐。这样的日子让人心旷神怡。',
                            '热爱生活，珍惜每一刻。时光飞逐，不要虑度光阴。把握现在，创造美好。',
                            '多读书可以开拓视野，增长知识。书中自有黄金屋，书中自有颜如玉。'
                        ],
                        medium: [
                            '人工智能技术的快速发展正在深刻改变着我们的工作方式和生活模式，从自动驾驶汽车到智能家居系统，科技创新为人类带来前所未有的便利。',
                            '在全球化的时代背景下，不同文化之间的交流与融合变得愈加频繁，我们需要以开放包容的心态去理解和接纳多元化的世界观。',
                            '可持续发展已成为当今世界的重要议题，绿色能源、环保材料、循环经济等概念正在重新定义现代产业的发展方向和企业的社会责任。',
                            '教育是推动社会进步的根本动力，优质的教育资源应当公平分配，让每个人都有机会通过学习改变命运，实现个人价值和社会贡献的统一。',
                            '数字化转型不仅仅是技术的升级，更是思维方式和商业模式的根本变革，企业需要重新审视自身的核心竞争力和市场定位。',
                            '中国古代宫廷建筑与现代都市规划相比，在空间布局、功能分区、人文内涵等方面体现出了不同时代的设计理念和美学追求。',
                            '互联网时代的信息传播速度极快，但同时也带来了信息过载和真假难辨的问题，需要培养理性思考和批判性思维能力。',
                            '传统文化与现代技术的结合创造出了新的艺术形式和表达方式，让历史文化遗产在现代社会中焦发出新的活力和魅力。',
                            '金融科技的快速发展正在改变传统的银行业务模式，从移动支付到数字货币，从智能投顾到网络信贷，金融服务变得更加便民和高效。',
                            '气候变化对全球生态系统产生了深远影响，从北极冰川融化到沙漠化扩张，从极端天气频发到生物多样性丧失，需要全人类共同动作应对。'
                        ],
                        hard: [
                            '量子计算作为下一代计算技术的重要发展方向，利用量子叠加和量子纠缠等物理现象，能够在特定算法上实现指数级的计算性能提升，为密码学、化学模拟、优化问题等领域带来革命性突破。',
                            '区块链技术以其去中心化、不可篡改、透明可追溯的特性，正在重构金融服务体系，从数字货币到智能合约，从供应链管理到数字身份认证，其应用场景不断拓展，推动着信任机制的数字化重建。',
                            '生物信息学结合计算科学与生物学的交叉学科，通过大数据分析和机器学习算法，解析基因组序列信息，预测蛋白质结构功能，为精准医疗、药物研发和生物工程提供强有力的技术支撑。',
                            '气候变化问题的复杂性在于其涉及大气科学、海洋学、生态学、经济学等多个学科领域的综合作用，需要通过国际合作、技术创新和政策协调来构建可持续的全球治理体系。',
                            '认知心理学研究表明，人类的决策过程并非完全理性，而是受到情感、偏见、启发式思维等多种因素影响，理解这些认知机制对于改善人机交互设计和提升用户体验具有重要意义。',
                            '更多元的量子力学系统中，粒子的测量结果受到量子纠缠态、叠加态和关联現象的影响，这些现象挑战了经典物理学的确定性原理和空间定域性概念。',
                            '分子生物学中的基因表达调控机制涉及复杂的表观遗传学修饰，包括DNA甲基化、组蛋白修饰、非编码RNA调控等多层次的分子网络交互作用。',
                            '深度学习网络的反向传播算法通过梯度下降和随机梯度下降等优化方法，在高维参数空间中寻找局部最优解，实现从数据到特征的自动学习和抽象。',
                            '宇宙学中的暗物质和暗能量问题构成了现代物理学的最大谜题，它们在宇宙总质量中占据了95%以上的比例，但却只能通过引力效应被间接观测到。',
                            '人工神经网络在图像识别、自然语言处理和语音合成等任务中的成功，得益于卷积神经网络、循环神经网络和注意力机制等架构的不断改进和优化。'
                        ],
                        expert: [
                            '高级量子算法在在数论分解、密码学攻击和组合优化问题上展现出指数级加速优势：Shor算法在多项式时间内分解大整数；Grover算法在未排序数据库中以平方根加速搜索目标；QAOA可近似求解NP困难的组合优化问题。',
                            '多组学研究中的CRISPR-Cas9基因编辑技术通过导向RNA与gRNA的精准匹配，实现对特定DNA序列的定向切割和修复，包括同源重组修复(HDR)和非同源终端连接(NHEJ)两种主要修复机制，从而实现基因敏击、插入、删除和编辑。',
                            '计算神经科学中的大脑连接组学通过综合使用扩散张量成像DTI、功能性磁共振成像fMRI、脑电图EEG和脑磁图MEG等多模态成像技术，构建大脑的结构性和功能性连接矩阵，以理解神经网络的拓扑属性和动态变化。',
                            '分子动力学模拟中的增强采样方法（Enhanced Sampling）包括伞上动力学metadynamics、加速分子动力学aMD、复制交换分子动力学REMD等，这些方法通过在集合坐标空间中添加偏置势或提高模拟温度，克服能量屏障，探索罕见事件和相变化过程。',
                            '超导量子干涉仪中的Josephson结和量子比特担当着量子信息处理的基本单元，通过精密控制微波脉冲的频率、幅度和相位，可以实现单比特門操作和多比特纠缠态制备，构成通用量子计算机的硬件基础。',
                            '最新的天体物理学观测数据显示，宇宙在加速膨胀过程中，暗能量的状态方程参数w可能在-1附近变化，这挑战了现有的宇宙学模型ÎDBM(冷暗物质模型)，需要考虑更复杂的暗能量模型或修正广义相对论的可能性。',
                            '机器学习中的对抗生成网络(GAN)通过生成器G和判别器D之间的最小最大对抗训练，在理论上求解min_G max_D V(D,G)=E_{x~p_{data}(x)}[\log D(x)]+E_{z~p_z(z)}[\log(1-D(G(z)))]目标函数，实现从隐空间到数据分布的隐式学习。',
                            '数值相对论模拟中的引力波检测需要解决Einstein场方程在强场区域的非线性演化，通过有限差分方法将时空离散化，使用3+1维形式ADM(Arnowitt-Deser-Misner)分解，将引力波方程转化为可求解的偶联微分方程组。',
                            '理论计算机科学中的复杂性理论研究P与NP问题的关系，特别是在量子计算模型下BQP(Bounded-Error Quantum Polynomial Time)复杂度类与经典复杂度类P、NP、PSPACE之间的包含关系，目前已知P⊆BQP⊆PSPACE，但BQP与NP的关系尚不明确。',
                            '结构生物学中的X射线自由电子激光(XFEL)技术能够提供飞秒级时间分辨率和垄级的空间分辨率，结合系列飞秒晚体学(SFX)和动态结构分析，可以在原子尺度上直接观测蛋白质功能态的转换过程和分子反应的中间态结构。'
                        ],
                        master: [
                            '在渝上钟山的高级量子因子分解实验中，研究人员利用超导量子比特系统，在10毫秒的相干时间内，成功对一个2048位的RSA大整数实施Shor算法的变体版本，通过时间复用技术和错误纠正码克服了量子退相干和门操作错误，最终在理论上证明了量子计算对现有密码体系的潜在威胁。该实验采用了表面码(Surface Code)错误纠正方案，在逗辑错误率为10^{-4}的情况下，实现了高保真度的量子算法执行。',
                            '人类大脑连接组项目(Human Connectome Project)通过对超过1000名健康成年被试者进行高分辨率扩散谱MRI成像(1.25mm的体素分辨率)，构建了包含约80万个神经纤维束的全脑白质纤维跟踪图谱，发现了多个之前未知的跨半球连接通路，特别是前额叶皮质与顶叶皮质之间的非对称连接模式，这些发现为理解认知功能的左右半球不对称性提供了新的神经解剖学基础。',
                            '在高级持续性威胁(APT)攻击的网络安全防护中，研究人员开发了基于图神经网络(GNN)和时序注意力机制的混合检测模型，通过对企业网络中的进程树、文件访问关系和网络连接模式进行多层次特征学习，在保持较低误报率(0.1%)的情况下，对隐蔽性攻击的检测准确率达到了98.7%，显著超过了基于签名匹配和统计异常检测的传统方法。',
                            '在极端环境下的粒子加速器物理实验中，希格玻色子(Higgs boson)的衰变通道分析需要对数百万个事件进行统计分析，其中涵盖了H→γγ(双光子)、H→ZZ*→4l(四轻子)、H→WW*→2l2ν(双轻子+双中微子)等多个衰变模式。在Large Hadron Collider(LHC)的ATLAS和CMS探测器实验中，物理学家使用深度学习算法进行背景事件抑制和信号提取，最终以超过5σ的统计显著性确认了该粒子的存在。',
                            '增强现实(AR)和虚拟现实(VR)技术在医学教育和手术培训中的应用遇到了低延迟、高精度空间定位和触觉反馈的技术挑战，特别是在处理复杂的解剖结构和手术操作时，需要实时渲染数百万个三角面片的高保真可视化模型。最新的解决方案采用了分布式渲染架构和自适应细节层次(LOD)算法，结合高精度的眼球追踪和手势识别，在120Hz的刷新频率下实现了50微秒的动作响应延迟。'
                        ],
                        legend: [
                            '诗经·大雅·烝丰：「抗丢爵事，无忷未来。不戍卉于水，不志汾于水。燕鸟安知鸿鹄之志哉！」古司马迁在《史记》中的记述揭示了中国古代士大夫的人文情怀与政治理想。但是，在现代语境下，这些传统的文化理念对于21世纪的全球化背景、跨文化交流与科技创新含有怎样的时代意义？『天行健，君子以自强不息；地势坤，君子以厚德载物』——这一儿语词的微观与宏观含义如何在当下的传统文化复兴与现代化转型中找到平衡点？',
                            '“荣耀（英语：Glory）”是VALVE公司开发的第一人称射击游戏中的一个概念，它代表着电子竞技运动中的最高荣誉和成就。在CS:GO游戏系统中，玩家可以通过搭配MM(Matchmaking)系统、FACEIT、ESEA等平台进行竞技对战，最终达到全球精英(Global Elite)段位。但是，在深层次的数据分析中，我们发现了一个问题：玩家的K/D ratio、ADR(Average Damage per Round)、HLTV Rating 2.0等数据指标在不同地图(de_dust2, de_mirage, de_inferno)上的表现如何相关？',
                            '在这个“后真相时代(Post-Truth Era)”的信息过载与算法推荐的达克效应中，从 Twitter、TikTok、Instagram 到微信朋友圈、微博、知乎，社交媒体平台的信息茶放式传播和性选择暴露在某种程度上在未成年人和成年人之间制造了“信息范的鸿沟”，进而成为了全球民主制治理体系与公民社会参与的隐性危机。在这样的背景下，「批判性思维(Critical Thinking)」、「媒体素养(Media Literacy)」和「信息素养(Information Literacy)」教育如何在教育体系和社会正义方面发挥作用？',
                            '量子计算领域的最新突破——谷歌Sycamore处理器在200秒内完成了经典超级计算机需要1万年才能完成的计算任务，实现了真正意义上的“量子霸权(Quantum Supremacy)”。然而，在这一成就的背后，是数千名物理学家、计算机科学家和工程师在过去30年中对量子力学、量子信息理论、量子纠错、超导电路、低温物理等多个交叉学科的深入研究和技术攻关。从 Josephson junction 的精密控制到 qubit coherence time 的持续改善，从 dilution refrigerator 的极低温环境营造到 quantum error correction 的算法优化，这一切都体现了人类在探索知识边界方面的无限潜能。',
                            '苏轼《水调歌头·明月几时有》：「不应有恨，何事长向别时圆？人有悲欢离合，月有阴晴圆缺，此事古难全。但愿人长久，千里共婵娟。」——在现代气象学与天体物理学的视角下，我们知道月亮的阴晨圆缺变化遵循着精确的轨道力学定律，与地球、太阳的相对位置关系密切相关。而诗人在千年前就已经透过文学的语言表达了对宇宙规律的深刻理解与哲学思辨。在当代的跨学科研究中，文学、科学和哲学如何在人文社会科学、自然科学和工程技术的交汇点上实现更加深入的对话？这种对话对于21世纪的科技创新、人文精神和社会进步又意味着什么？'
                        ],
                        coding: [
                            'const fibonacci = (n) => { if (n <= 1) return n; return fibonacci(n-1) + fibonacci(n-2); }; // 可是这样的递归算法时间复杂度为 O(2^n)，非常低效。我们可以使用动态规划来优化： const fibDP = (n) => { const dp = [0, 1]; for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2]; return dp[n]; };',
                            'class DeepLearningModel { constructor(layers, activation="relu", optimizer="adam", loss="mse") { this.layers = layers; this.activation = activation; this.optimizer = optimizer; this.loss = loss; this.weights = []; this.biases = []; this.initializeWeights(); } initializeWeights() { for (let i = 0; i < this.layers.length - 1; i++) { const weight = Array(this.layers[i]).fill().map(() => Array(this.layers[i+1]).fill().map(() => Math.random() * 0.2 - 0.1)); this.weights.push(weight); this.biases.push(Array(this.layers[i+1]).fill(0)); } } }',
                            'SELECT u.user_id, u.username, p.post_title, c.comment_content, c.created_at FROM users u INNER JOIN posts p ON u.user_id = p.author_id LEFT JOIN comments c ON p.post_id = c.post_id WHERE u.registration_date >= "2023-01-01" AND p.post_status = "published" AND (c.comment_status = "approved" OR c.comment_id IS NULL) ORDER BY c.created_at DESC LIMIT 50; -- 这个复杂的 SQL 查询涉及多表连接和条件筛选，需要注意索引优化和查询性能',
                            'import asyncio import aiohttp import json from typing import List, Dict, Optional async def fetch_multiple_apis(urls: List[str], session: aiohttp.ClientSession, headers: Optional[Dict] = None) -> List[Dict]: """Async function to fetch multiple API endpoints concurrently""" tasks = [fetch_single_api(url, session, headers) for url in urls] results = await asyncio.gather(*tasks, return_exceptions=True) return [result for result in results if not isinstance(result, Exception)] async def fetch_single_api(url: str, session: aiohttp.ClientSession, headers: Optional[Dict] = None) -> Dict: async with session.get(url, headers=headers, timeout=aiohttp.ClientTimeout(total=30)) as response: if response.status == 200: return await response.json() else: raise aiohttp.ClientError(f"HTTP {response.status}")   # 这个 Python 异步编程示例展示了并发请求多个 API 的最佳实践',
                            'const quickSort = (arr, low = 0, high = arr.length - 1) => { if (low < high) { const pi = partition(arr, low, high); quickSort(arr, low, pi - 1); quickSort(arr, pi + 1, high); } return arr; }; const partition = (arr, low, high) => { const pivot = arr[high]; let i = low - 1; for (let j = low; j < high; j++) { if (arr[j] < pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; } } [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; return i + 1; }; // 快速排序算法，平均时间复杂度 O(n log n)，最坏情况 O(n^2)',
                            'package main import ("context" "fmt" "sync" "time") func main() { ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second); defer cancel(); var wg sync.WaitGroup; ch := make(chan int, 10); for i := 0; i < 5; i++ { wg.Add(1); go worker(ctx, &wg, ch, i) } go func() { for i := 0; i < 50; i++ { select { case ch <- i: case <-ctx.Done(): return } } close(ch) }(); wg.Wait(); fmt.Println("All workers completed") } func worker(ctx context.Context, wg *sync.WaitGroup, ch <-chan int, id int) { defer wg.Done(); for { select { case task, ok := <-ch: if !ok { return } fmt.Printf("Worker %d processing task %d\n", id, task); time.Sleep(100 * time.Millisecond) case <-ctx.Done(): return } } } // Go 语言的并发编程模式，使用 goroutine、channel 和 context',
                            '#!/bin/bash LOG_FILE="/var/log/system_monitor.log" CPU_THRESHOLD=80 MEMORY_THRESHOLD=85 DISK_THRESHOLD=90 check_system_resources() { local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk "{print \$2}" | awk -F"%" "{print \$1}"); local memory_usage=$(free | grep Mem | awk "{printf \"%d\", \$3/\$2 * 100}"); local disk_usage=$(df -h / | awk "NR==2{print \$5}" | sed "s/%//"); echo "$(date): CPU: ${cpu_usage}%, Memory: ${memory_usage}%, Disk: ${disk_usage}%" >> $LOG_FILE; if (( $(echo "$cpu_usage > $CPU_THRESHOLD" | bc -l) )); then send_alert "High CPU usage: ${cpu_usage}%"; fi; if (( memory_usage > MEMORY_THRESHOLD )); then send_alert "High Memory usage: ${memory_usage}%"; fi; if (( disk_usage > DISK_THRESHOLD )); then send_alert "High Disk usage: ${disk_usage}%"; fi } send_alert() { echo "ALERT: $1" | mail -s "System Alert" admin@example.com; logger -p user.warning "System Monitor Alert: $1" } while true; do check_system_resources; sleep 300; done # Shell 脚本的系统监控示例',
                            'public class BinarySearchTree<T extends Comparable<T>> { private Node<T> root; private static class Node<T> { T data; Node<T> left, right; Node(T data) { this.data = data; } } public void insert(T data) { root = insertRec(root, data); } private Node<T> insertRec(Node<T> root, T data) { if (root == null) { return new Node<>(data); } if (data.compareTo(root.data) < 0) { root.left = insertRec(root.left, data); } else if (data.compareTo(root.data) > 0) { root.right = insertRec(root.right, data); } return root; } public boolean search(T data) { return searchRec(root, data); } private boolean searchRec(Node<T> root, T data) { if (root == null) return false; if (data.compareTo(root.data) == 0) return true; return data.compareTo(root.data) < 0 ? searchRec(root.left, data) : searchRec(root.right, data); } } // Java 中的二叉搜索树实现，使用泛型和递归',
                            'use std::collections::HashMap; use tokio::task; #[tokio::main] async fn main() -> Result<(), Box<dyn std::error::Error>> { let mut handles = vec![]; for i in 0..10 { let handle = task::spawn(async move { let result = expensive_computation(i).await; println!("Task {} completed with result: {}", i, result); result }); handles.push(handle); } let results: Vec<_> = futures::future::join_all(handles).await.into_iter().collect::<Result<Vec<_>, _>>()?; println!("All tasks completed. Results: {:?}", results); Ok(()) } async fn expensive_computation(n: u64) -> u64 { tokio::time::sleep(tokio::time::Duration::from_millis(n * 100)).await; fibonacci(n) } fn fibonacci(n: u64) -> u64 { match n { 0 => 0, 1 => 1, _ => fibonacci(n - 1) + fibonacci(n - 2), } } // Rust 异步编程和并发处理的示例',
                            'CREATE TRIGGER update_user_stats AFTER INSERT ON user_actions FOR EACH ROW BEGIN DECLARE action_count INT DEFAULT 0; DECLARE user_level INT DEFAULT 1; SELECT COUNT(*) INTO action_count FROM user_actions WHERE user_id = NEW.user_id AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY); SET user_level = CASE WHEN action_count >= 1000 THEN 5 WHEN action_count >= 500 THEN 4 WHEN action_count >= 200 THEN 3 WHEN action_count >= 50 THEN 2 ELSE 1 END; UPDATE users SET activity_level = user_level, last_activity = NOW(), total_actions = (SELECT COUNT(*) FROM user_actions WHERE user_id = NEW.user_id) WHERE id = NEW.user_id; IF user_level > (SELECT activity_level FROM users WHERE id = NEW.user_id) THEN INSERT INTO notifications (user_id, message, type) VALUES (NEW.user_id, CONCAT("Congratulations! You reached level ", user_level), "achievement"); END IF; END; -- 复杂的 MySQL 触发器示例，包含条件判断和嵌套查询'
                        ],
                        nightmare: [
                            'The implementation of a quantum error correction algorithm in Qiskit: qc = QuantumCircuit(9, 1); qc.cx(0, 3); qc.cx(0, 6); qc.cx(1, 4); qc.cx(1, 7); qc.cx(2, 5); qc.cx(2, 8); qc.barrier(); for i in range(3): qc.cx(i, i+3); qc.cx(i+3, i+6); syndrome = []; for i in range(6): syndrome.append(ClassicalRegister(1, f"syndrome_{i}")); qc.add_register(*syndrome); for i in range(6): qc.measure(i+3, syndrome[i]); 『量子纠错编码中的Shor代码实现，用于保护量子态不受环境干扰』——在现实的量子计算机中，这种错误纠正机制是实现容错量子计算的关键技术，需要精确控制数百个物理量子比特的演化。',
                            '全球顶尖金融衣生品交易算法：δ-中性hedging策略下VaR(Value at Risk)计算——P(X ≤ VaR) = α, 其中X表示组合损失，Delta = ∂V/∂S, Gamma = ∂²V/∂S², Vega = ∂V/∂σ, Theta = ∂V/∂t, Rho = ∂V/∂r。对于新兴市场指数期权(Exotic Options)的Black-Scholes-Merton偏微分方程为：∂V/∂t + (1/2)σ²S²(∂²V/∂S²) + rS(∂V/∂S) - rV = 0。Monte Carlo simulation中使用Sobol序列和Antithetic variates方法来减少方差，通过importance sampling和控制变量技术(control variates)提高收敛速度。在高频交易(HFT)中，FIX协议的latency optimization和 FPGA-based order matching engine 的microsecond-level execution成为决定性因素。',
                            'Advanced CRISPR-Cas13 RNA targeting system: guide RNA (gRNA) 设计需要考虑secondary structure prediction, off-target effects analysis 和 PAM-independent targeting. The Cas13 endonuclease 具有collateral activity，可以用于ultrasensitive nucleic acid detection (DETECTR/SHERLOCK assays). In mammalian cells, the efficiency 取决于: (1) Nuclear localization signal optimization, (2) Codon usage bias correction, (3) 5’-UTR and 3’-UTR sequence engineering for mRNA stability, (4) Chromatin accessibility factors (H3K4me3, H3K27ac markers). 对于epigenome editing，dCas13-DNMT3A/TET2 fusion proteins 可以实现site-specific DNA methylation/demethylation. The computational pipeline involves: sgRNA design using ViennaRNA package for secondary structure prediction → off-target analysis with Bowtie2 alignment → PAM density mapping across target loci → chromatin state annotation from ENCODE/Roadmap data → machine learning-based efficiency prediction using XGBoost/Random Forest models trained on large-scale screening data from genome-wide CRISPR libraries (Brunello, TKOv3, etc.).',
                            '在甲子阳明心学与程朱理学的辞辩中，“心即理”与“理在事中”的哲学命题如何在当代认知科学、神经现象学(Neurophenomenology)和计算意识理论的框架下重新取得阐释的可能性？在黑格尔的绝对精神(Absolute Geist)、胡塞尔的现象学意向性(Intentionality)、海德格尔的存在与时间(Sein und Zeit)之间，中国古代哲学的“天人合一”、“物我两忘”概念和现代体系科学(Systems Science)、复杂性理论的整体性思维是否能够在人工智能时代的“机器意识”问题上提供新的哲学资源？在传统的“格物致知”认识论传统与现代数学、物理学的公理化方法之间，是否存在着某种深层的同构性(Isomorphism)或补充性(Complementarity)？这种思辨对于构建21世纪的新人文主义范式及其与科技文明的关系具有怎样的启发意义？',
                            'typedef struct __attribute__((packed)) { uint64_t timestamp; uint32_t sequence_number; uint16_t message_type; uint16_t message_length; char symbol[8]; double bid_price; double ask_price; uint32_t bid_quantity; uint32_t ask_quantity; } market_data_t; static inline void process_market_data(market_data_t* md, volatile uint64_t* counter) { __builtin_prefetch(md, 0, 3); register double mid_price = (md->bid_price + md->ask_price) * 0.5; register double spread = md->ask_price - md->bid_price; __sync_fetch_and_add(counter, 1); _mm_stream_pd((double*)&global_state.prices[hash_symbol(md->symbol)], _mm_set_pd(mid_price, spread)); } 『超低延迟高频交易系统中的内存映射和SIMD优化』 // 在现代金融市场中，微秒级延迟的优化对于算法交易的收益率至关重要，需要综合考虑CPU缓存优化、内存对齐、分支预测和指令并行性等因素',
                            'In the context of topological quantum computing with Majorana fermions: |Ψ⟩ = ∏ᵢ (cos(θᵢ/2)|0⟩ + e^(iφᵢ)sin(θᵢ/2)|1⟩) where the Majorana operators satisfy γᵢ† = γᵢ and {γᵢ, γⱼ} = 2δᵢⱼ. The braiding statistics are described by the braid group Bₙ with generators σ₁, ..., σₙ₋₁ satisfying: σᵢσⱼ = σⱼσᵢ for |i-j| ≥ 2, and σᵢσᵢ₊₁σᵢ = σᵢ₊₁σᵢσᵢ₊₁. For anyonic interferometry, the Berry phase φ = ∮ ⟨ψ(R)|∇ᵣ|ψ(R)⟩·dR accumulated during adiabatic transport encodes quantum information. The p-wave superconductor Hamiltonian H = ∑ₖ ψₖ†(ξₖτz + Δₖτx)ψₖ with Rashba spin-orbit coupling αₖ(σy⊗τx - σx⊗τy) creates the topological gap |Δ| = √((μ² + |α|²k²) - Γ²) where μ is chemical potential and Γ is Zeeman energy. The experimental signature involves zero-bias conductance peak G₀ = (4e²/h) sin²(πΦ/Φ₀) in tunneling spectroscopy, modulated by applied magnetic flux Φ through the loop geometry of the Majorana wire-superconductor hybrid structure.',
                            'The Byzantine fault tolerance consensus algorithm in distributed systems requires solving the problem where up to f malicious nodes can behave arbitrarily among n = 3f + 1 total nodes. The PBFT (Practical Byzantine Fault Tolerance) protocol consists of three phases: pre-prepare, prepare, and commit. Primary replica broadcasts ⟨PRE-PREPARE, v, n, d⟩σₚ where v is view number, n is sequence number, d is message digest, and σₚ is primary\'s signature. Each backup replica i sends ⟨PREPARE, v, n, d, i⟩σᵢ to all replicas after accepting the pre-prepare message. A replica enters commit phase after receiving 2f matching PREPARE messages. The safety property ensures that no two non-faulty replicas commit different values for the same sequence number n in view v. Liveness is guaranteed when network is synchronous and GST (Global Stabilization Time) is reached. Modern implementations like HotStuff achieve O(n) communication complexity per view through threshold signatures and verifiable random functions (VRFs). The CAP theorem constraints require choosing between consistency and availability during network partitions P, leading to eventual consistency models like CRDT (Conflict-free Replicated Data Types) with mathematical properties: associative: (a ⊔ b) ⊔ c = a ⊔ (b ⊔ c), commutative: a ⊔ b = b ⊔ a, and idempotent: a ⊔ a = a.',
                            '在日本平安时代的『源氏物語』中，紫式部的“物のあはれ”(物之哀)美学意识与佛教的“諸行無常”思想如何在现代精神分析学、认知科学和现象学美学的语境下找到新的识别和话语表达的可能性？在西方哲学传统中，从亚里士多德的“悲剧请洁”(catharsis)、康德的“崇高”(das Erhabene)到海德格尔的“美是真理的感性显现”，再到海德格尔的“艺术作品的本源”，这些西方美学范畴与东亚文化中的“空寂”(Silence)、“间”(Ma)、“佘寂”(Wabi-Sabi)等美学概念在人工智能创意计算(Creative AI)和计算美学(Computational Aesthetics)领域中如何产生新的融合与对话？在Generative Adversarial Networks (GANs)、Variational Autoencoders (VAEs)和Transformer架构的数学模型中，是否能够找到与传统东方美学中“虚实相生”、“意在言外”等思维方式的对应关系？这种跨文化的美学对话对于构建一个真正具有全球视野的人工智能美学理论体系又意味着什么？'
                        ]
                    },
                    english: {
                        easy: [
                            'The quick brown fox jumps over the lazy dog. This sentence contains all letters of the alphabet and is commonly used for typing practice.',
                            'Technology has changed the way we communicate with each other. Social media platforms connect people from different parts of the world.',
                            'Reading books is a wonderful way to expand your knowledge and imagination. Every page offers new insights and perspectives.',
                            'Exercise and healthy eating are essential for maintaining good physical and mental health. Regular activity keeps us energized.',
                            'Learning new skills takes time and practice, but the effort is always worth it in the end. Persistence is key to success.',
                            'The sun rises in the east and sets in the west. This natural cycle has guided human activity for thousands of years.',
                            'Music is a universal language that speaks to the soul. It can express emotions that words cannot capture.',
                            'Traveling to new places opens our minds to different cultures and ways of life. Every journey is a learning experience.',
                            'Science helps us understand the world around us. Through observation and experimentation, we discover new truths.',
                            'Friendship is one of life\'s greatest treasures. Good friends support us through both joy and sorrow.'
                        ],
                        medium: [
                            'Artificial intelligence and machine learning technologies are rapidly transforming industries across the globe, from healthcare and finance to transportation and entertainment, creating new opportunities while presenting unique challenges.',
                            'Climate change represents one of the most pressing issues of our time, requiring coordinated global action, innovative technologies, and fundamental changes in how we produce and consume energy.',
                            'The digital revolution has democratized access to information and education, enabling people from diverse backgrounds to learn, create, and collaborate in ways that were previously impossible.',
                            'Sustainable development goals emphasize the importance of balancing economic growth with environmental protection and social equity, ensuring a better future for generations to come.',
                            'Effective communication skills are essential in both personal and professional relationships, involving not just speaking and writing, but also active listening and empathy.',
                            'In software engineering, clean architecture promotes separation of concerns, enabling systems to be more maintainable, testable, and scalable over time.',
                            'Epidemiological models like SIR and SEIR help us understand the spread of infectious diseases, informing public health interventions and policy decisions.',
                            'Data privacy regulations such as GDPR and CCPA require organizations to implement robust data protection practices, transparency, and user consent mechanisms.',
                            'Cloud-native applications leverage containerization, orchestration, and microservices to achieve resilience, scalability, and rapid deployment cycles.',
                            'Financial literacy empowers individuals to make informed decisions about budgeting, saving, investing, and managing risk throughout their lives.'
                        ],
                        hard: [
                            'Quantum computing represents a paradigm shift in computational technology, leveraging quantum mechanical phenomena such as superposition and entanglement to perform calculations that would be intractable for classical computers.',
                            'Bioinformatics combines computational methods with biological data to understand complex biological processes, enabling researchers to analyze genomic sequences, predict protein structures, and develop personalized medical treatments.',
                            'Neuroscience research has revealed the remarkable plasticity of the human brain, demonstrating how neural networks can reorganize and adapt throughout life in response to learning, experience, and environmental changes.',
                            'Cryptocurrency and blockchain technology have introduced novel concepts of decentralized finance, challenging traditional banking systems and creating new possibilities for peer-to-peer transactions and digital asset management.',
                            'Philosophical questions about consciousness, free will, and the nature of reality have taken on new dimensions in light of advances in cognitive science, artificial intelligence, and quantum physics.',
                            'Advanced cryptographic protocols like zero-knowledge proofs and homomorphic encryption enable secure computation on encrypted data without revealing sensitive information to untrusted parties.',
                            'Mathematical optimization techniques such as convex programming, stochastic gradient descent, and evolutionary algorithms are fundamental to modern machine learning and operations research.',
                            'Distributed systems architecture must address challenges including consensus mechanisms, fault tolerance, eventual consistency, and the CAP theorem constraints.',
                            'Epigenetic modifications like DNA methylation, histone acetylation, and chromatin remodeling regulate gene expression without altering the underlying genomic sequence.',
                            'Topological data analysis uses concepts from algebraic topology to extract meaningful patterns from high-dimensional datasets, providing insights into complex systems dynamics.'
                        ],
                        expert: [
                            'The theoretical foundations of computation involve complexity classes such as P, NP, PSPACE, and BQP, with unsolved problems like P vs NP representing some of the most profound questions in computer science and mathematics.',
                            'Advanced quantum field theory incorporates concepts like renormalization, gauge invariance, and spontaneous symmetry breaking to describe fundamental particle interactions in the Standard Model of physics.',
                            'Differential topology and manifold theory provide the mathematical framework for general relativity, where spacetime curvature describes gravitational effects through Einstein\'s field equations.',
                            'Category theory serves as a foundational language for mathematics, providing abstract structures like functors, natural transformations, and universal properties that unify diverse mathematical concepts.',
                            'Computational complexity of approximation algorithms involves techniques like semidefinite programming relaxations, randomized rounding, and the probabilistic method to achieve near-optimal solutions.'
                        ],
                        master: [
                            'The mathematical rigor of measure theory underpins modern probability theory, functional analysis, and the foundations of quantum mechanics, utilizing concepts like σ-algebras, Lebesgue integration, and martingales.',
                            'Advanced machine learning architectures such as attention mechanisms, graph neural networks, and variational autoencoders require sophisticated optimization techniques and regularization strategies.',
                            'Algebraic geometry\'s intersection with computational complexity has led to breakthroughs in polynomial system solving, with applications ranging from robotics to cryptanalysis and coding theory.'
                        ],
                        legend: [
                            'The interplay between algebraic number theory and elliptic curves has revolutionized modern cryptography, with applications to RSA alternatives, post-quantum security, and blockchain consensus mechanisms.',
                            'Homological algebra provides the theoretical foundation for cohomology theories, spectral sequences, and derived functors, with profound applications in algebraic topology and algebraic geometry.'
                        ],
                        coding: [
                            'template<typename T> class SmartPointer { private: T* ptr; std::atomic<size_t>* ref_count; public: explicit SmartPointer(T* p = nullptr) : ptr(p), ref_count(p ? new std::atomic<size_t>(1) : nullptr) {} SmartPointer(const SmartPointer& other) : ptr(other.ptr), ref_count(other.ref_count) { if (ref_count) ++(*ref_count); } };',
                            'def gradient_descent(X, y, learning_rate=0.01, epochs=1000): m, n = X.shape; theta = np.zeros(n); for epoch in range(epochs): predictions = X.dot(theta); errors = predictions - y; gradient = X.T.dot(errors) / m; theta -= learning_rate * gradient; cost = np.mean(errors**2) / 2; if epoch % 100 == 0: print(f"Epoch {epoch}, Cost: {cost}"); return theta',
                            'pub struct ConcurrentHashMap<K, V> { buckets: Vec<RwLock<HashMap<K, V>>>, hash_builder: RandomState, } impl<K, V> ConcurrentHashMap<K, V> where K: Hash + Eq + Clone, V: Clone, { pub fn new() -> Self { let bucket_count = num_cpus::get() * 4; ConcurrentHashMap { buckets: (0..bucket_count).map(|_| RwLock::new(HashMap::new())).collect(), hash_builder: RandomState::new(), } } }'
                        ],
                        nightmare: [
                            'Advanced type theory in dependent types: Π(x: A) → B(x) represents dependent function types where the return type B depends on the input value x, enabling precise specification of program behavior and mathematical proofs.',
                            'The Curry-Howard correspondence establishes a deep connection between computer programs and mathematical proofs, where types correspond to propositions and programs correspond to proofs in constructive logic.',
                            'Homotopy type theory unifies algebraic topology with type theory, introducing univalent foundations where mathematical structures are identified up to homotopy equivalence rather than strict equality.'
                        ]
                    },
                    numbers: {
                        easy: [
                            '今天日期是2024年1月1日，温度是25.5度。我在上午9时30分起床，吃了2片面包和1杯牛奶。',
                            '成绩单：数学95分，英语87分，语敶85分，物玗92分，化学88分。平均分数是89.4分。',
                            'Phone: +86 138-0013-8000, Address: 北京市朝阳区建国门外大街24号椰2楼, Zip: 100020',
                            'Price list: iPhone 14 Pro - $999, MacBook Air M2 - $1,199, iPad Air - $599, AirPods Pro 2 - $249',
                            '计算公式：a^2 + b^2 = c^2, 当a=3, b=4时，c=5。面积S = 1/2 * base * height = 1/2 * 3 * 4 = 6'
                        ],
                        medium: [
                            'HTTP 状态码: 200 OK, 404 Not Found, 500 Internal Server Error, 301 Moved Permanently, 403 Forbidden',
                            'IPv4 address: 192.168.1.1, Subnet mask: 255.255.255.0, Gateway: 192.168.1.1, DNS: 8.8.8.8, 8.8.4.4',
                            'System specs: CPU: Intel i7-12700K @3.6GHz, RAM: 32GB DDR4-3200, Storage: 1TB NVMe SSD, GPU: RTX 4080',
                            'Financial data: Q1 revenue $2.5M (+15.3% YoY), Q2 $2.8M (+12.7%), Q3 $3.1M (+18.9%), Q4 $3.4M (+21.2%)',
                            'Scientific notation: 6.626 × 10^-34 J·s (Planck constant), 299,792,458 m/s (speed of light), 9.109 × 10^-31 kg (electron mass)'
                        ],
                        hard: [
                            'Cryptocurrency prices: BTC $43,256.78 (-2.34%), ETH $2,587.91 (+1.87%), BNB $312.45 (-0.92%), ADA $0.4521 (+3.12%)',
                            'Database query: SELECT AVG(salary) FROM employees WHERE department_id IN (101, 102, 103) AND hire_date >= "2020-01-01" LIMIT 50;',
                            'RegEx pattern: ^(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@',
                            'Algorithm complexity: O(1) constant, O(log n) logarithmic, O(n) linear, O(n log n) linearithmic, O(n²) quadratic, O(2^n) exponential',
                            'Hexadecimal colors: #FF5733 (coral), #33FF57 (lime green), #3357FF (royal blue), #FF33F5 (magenta), #F5FF33 (yellow)'
                        ]
                    },
                    symbols: {
                        easy: [
                            'Basic symbols: ! @ # $ % ^ & * ( ) - _ + = [ ] { } | \\ : " ; \' < > , . ? / ~ `',
                            'Email format: username@domain.com, website: https://www.example.org/path?param=value&id=123',
                            'Math operations: 2 + 3 = 5, 10 - 4 = 6, 3 × 7 = 21, 15 ÷ 3 = 5, 2³ = 8, √16 = 4',
                            'Punctuation test: "Hello, world!" he said. \'What\'s your name?\' she asked. (parentheses) [brackets] {braces}',
                            'Special chars: © ® ™ € £ ¥ § ¶ † ‡ • … ‰ ± × ÷ ≈ ≠ ≤ ≥ ∞ ∑ ∏ ∆ Ω π α β γ δ'
                        ],
                        medium: [
                            'Complex expressions: f(x) = ax² + bx + c, where a ≠ 0 and Δ = b² - 4ac determines the nature of roots',
                            'JSON syntax: {"name": "John", "age": 30, "city": "New York", "hobbies": ["reading", "coding"], "married": false, "salary": null}',
                            'Logical operators: && (AND), || (OR), ! (NOT), == (equals), != (not equals), < (less than), > (greater than), <= (less or equal), >= (greater or equal)',
                            'CSS selectors: .class-name, #id-name, element[attribute="value"], :hover, ::before, > child, + adjacent, ~ sibling',
                            'Emoji & Unicode: 😀😂🤔💻🚀🌟⭐️🎯🔥💡🎨🎵🎮🏆🌍🌺🍕🍔🍰☕️❤️💙💚💛💜'
                        ],
                        hard: [
                            'Advanced regex: (?<=\\b)(?!(?:https?|ftp)://)(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\\.)+(com|org|net|edu|gov)(?=/|\\s|$)',
                            'Mathematical symbols: ∑(i=1 to n) xi² = n·σ² + μ², ∫₋∞^∞ e^(-x²/2) dx = √(2π), lim(x→0) (sin x)/x = 1, ∂²f/∂x² + ∂²f/∂y² = ∇²f',
                            'LaTeX expressions: \\frac{\\partial}{\\partial t}\\psi = \\frac{i\\hbar}{2m}\\nabla^2\\psi + V(r)\\psi, \\sum_{n=0}^{\\infty} \\frac{x^n}{n!} = e^x',
                            'Special characters: ☢☣⚠⚡☔☂☃❄❅⛄⛅☀☁⭐❇✨⚡⭐✮✯✰★☆✓✗✘✙✚❗❓❢❥❦❧❤❥❣❢☮☯☪☭♠♥♦♣♤♧♢♡♠♟',
                            'Programming syntax: if (condition && (flag || !disabled)) { return callback?.apply(this, [...args, {timeout: 5000}]) ?? defaultValue; }'
                        ]
                    },
                    code: {
                        easy: [
                            'HTML: <div class="container"><h1>Hello World</h1><p>This is a paragraph.</p><a href="#">Click here</a></div>',
                            'CSS: .button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }',
                            'JavaScript: function greet(name) { console.log("Hello, " + name + "!"); return `Welcome, ${name}`; } greet("Alice");',
                            'Python: def fibonacci(n): return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2); print([fibonacci(i) for i in range(10)])',
                            'SQL: SELECT users.name, orders.total FROM users LEFT JOIN orders ON users.id = orders.user_id WHERE orders.date >= "2024-01-01";'
                        ],
                        medium: [
                            'React: const [count, setCount] = useState(0); useEffect(() => { document.title = `Count: ${count}`; }, [count]); return <button onClick={() => setCount(c => c + 1)}>{count}</button>;',
                            'Docker: FROM node:18-alpine; WORKDIR /app; COPY package*.json ./; RUN npm ci --only=production; COPY . .; EXPOSE 3000; CMD ["npm", "start"];',
                            'Git commands: git clone <repo>; git checkout -b feature/new-feature; git add .; git commit -m "Add new feature"; git push origin feature/new-feature;',
                            'API fetch: const response = await fetch("/api/users", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({name, email})});',
                            'Kubernetes: apiVersion: apps/v1; kind: Deployment; metadata: {name: app-deployment}; spec: {replicas: 3, selector: {matchLabels: {app: myapp}}}'
                        ],
                        hard: [
                            'TypeScript generics: interface Repository<T> { findById(id: string): Promise<T | null>; create(entity: Omit<T, "id">): Promise<T>; update(id: string, updates: Partial<T>): Promise<T>; }',
                            'Rust ownership: fn process_data(data: Vec<String>) -> impl Iterator<Item = String> { data.into_iter().filter(|s| !s.is_empty()).map(|s| s.to_uppercase()) }',
                            'GraphQL: query GetUserPosts($userId: ID!, $first: Int = 10) { user(id: $userId) { name posts(first: $first) { edges { node { title content createdAt } } } } }',
                            'Terraform: resource "aws_instance" "web" { ami = data.aws_ami.ubuntu.id; instance_type = var.instance_type; tags = merge(var.common_tags, {Name = "WebServer"}); }',
                            'Advanced SQL: WITH RECURSIVE category_tree AS (SELECT id, name, parent_id, 1 as level FROM categories WHERE parent_id IS NULL UNION ALL SELECT c.id, c.name, c.parent_id, ct.level + 1 FROM categories c JOIN category_tree ct ON c.parent_id = ct.id) SELECT * FROM category_tree ORDER BY level, name;'
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
                    
                    // 处理不同的语言类型
                    if (language === 'mixed') {
                        // 中英混合
                        const chineseSamples = textSamples.chinese[difficulty] || textSamples.chinese.easy;
                        const englishSamples = textSamples.english[difficulty] || textSamples.english.easy;
                        samples = [...chineseSamples, ...englishSamples];
                    } else if (language === 'numbers') {
                        // 数字混合
                        samples = textSamples.numbers[difficulty] || textSamples.numbers.easy;
                    } else if (language === 'symbols') {
                        // 符号挑战
                        samples = textSamples.symbols[difficulty] || textSamples.symbols.easy;
                    } else if (language === 'code') {
                        // 代码片段
                        samples = textSamples.code[difficulty] || textSamples.code.easy;
                    } else {
                        // 中文或英文
                        samples = textSamples[language]?.[difficulty] || textSamples.chinese.easy;
                    }
                    
                    if (selectedMode.value === 'words') {
                        // 生成指定字数的文本
                        let text = '';
                        const targetWords = selectedWords.value;
                        const multiplier = language === 'chinese' || language === 'numbers' || language === 'symbols' ? 3 : 5; // 中文/数字/符号每单位更密集
                        
                        while (text.length < targetWords * multiplier) {
                            const randomSample = samples[Math.floor(Math.random() * samples.length)];
                            text += randomSample + ' ';
                        }
                        
                        return text.substring(0, targetWords * multiplier).trim();
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
