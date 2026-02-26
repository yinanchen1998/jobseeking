import type { AITool, DailyPost, AdminUser } from '@/types';

// 真实的求职 AI 工具数据
export const mockTools: AITool[] = [
  // ============ 简历优化类 ============
  {
    id: '1',
    slug: 'jobscan',
    name: 'Jobscan',
    chineseName: 'Jobscan简历优化',
    tagline: 'ATS简历扫描优化，提升简历通过率',
    description: 'Jobscan 是领先的 ATS（求职者追踪系统）简历优化工具，通过 AI 分析你的简历与职位描述的匹配度，提供具体的优化建议。',
    website: 'https://www.jobscan.co',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=jobscan',
    category: 'resume',
    status: 'published',
    content: {
      founderBackground: '由 James Hu 于2014年创立，专注于解决简历无法通过ATS系统筛选的问题',
      problemSolved: [
        '简历被ATS系统自动筛选淘汰，无法到达HR手中',
        '不知道简历与职位描述的匹配度如何',
        '缺乏针对特定职位的关键词优化'
      ],
      userValue: [
        { feature: 'ATS匹配度评分', desc: '实时显示简历与职位的匹配分数' },
        { feature: '关键词优化建议', desc: '自动识别缺失的关键词并推荐添加' },
        { feature: '简历格式化', desc: '确保简历格式符合ATS系统要求' }
      ],
      targetUsers: '正在投递外企、大厂职位的求职者',
      howToUse: [
        '上传简历或粘贴简历内容',
        '粘贴目标职位的职位描述（JD）',
        '查看匹配度评分和优化建议',
        '根据建议修改简历后重新评分'
      ],
      useCases: [
        {
          scenario: '外企求职',
          before: '投递20份简历无回应，怀疑被ATS过滤',
          after: '优化后匹配度从45%提升到85%，获得3个面试邀请'
        }
      ],
      pricing: {
        free: '每月5次免费扫描，基础匹配报告',
        pro: '$49.95/月 - 无限扫描，完整优化建议',
        premium: '$89.95/月 - 包含求职信优化、LinkedIn优化'
      },
      pros: ['ATS算法模拟准确', '界面直观易用', '支持多种文件格式'],
      cons: ['高级功能价格较高', '主要针对英文简历优化']
    },
    rating: 9.2,
    viewCount: 15890,
    isFeatured: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-20T10:30:00Z',
    publishedAt: '2024-01-20T09:00:00Z',
    source: 'producthunt'
  },
  {
    id: '2',
    slug: 'rezi',
    name: 'Rezi',
    chineseName: 'Rezi AI简历',
    tagline: 'AI驱动的智能简历生成器',
    description: 'Rezi 是一款专注于 ATS 友好的 AI 简历生成器，帮助用户在几分钟内创建专业简历。',
    website: 'https://www.rezi.ai',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=rezi',
    category: 'resume',
    status: 'published',
    content: {
      founderBackground: '由 Jacob Jacquet 创立，旨在通过AI技术简化简历创建过程',
      problemSolved: [
        '不知道如何开始写简历',
        '简历格式混乱不专业',
        '花费大量时间调整排版'
      ],
      userValue: [
        { feature: 'AI内容生成', desc: '根据职位自动生成简历内容' },
        { feature: 'ATS友好模板', desc: '所有模板都经过ATS兼容性测试' },
        { feature: '实时预览', desc: '编辑时实时查看简历效果' }
      ],
      targetUsers: '应届毕业生、转行求职者',
      howToUse: [
        '选择简历模板',
        '输入基本信息和工作经历',
        '使用AI生成和优化内容',
        '导出PDF或Word格式'
      ],
      useCases: [
        {
          scenario: '零经验求职',
          before: '完全不知道简历怎么写',
          after: 'AI生成的简历专业完整，获得多个面试机会'
        }
      ],
      pricing: {
        free: '基础模板，1份简历',
        pro: '$29/月 - 无限简历，AI生成',
        premium: '$89一次性 - 终身访问所有功能'
      },
      pros: ['AI生成内容质量高', '模板简洁专业', '导出格式多样'],
      cons: ['中文支持有限', 'AI生成次数有限制']
    },
    rating: 8.8,
    viewCount: 12340,
    isFeatured: true,
    createdAt: '2024-01-18T08:00:00Z',
    updatedAt: '2024-01-22T14:20:00Z',
    publishedAt: '2024-01-22T09:00:00Z',
    source: 'producthunt'
  },
  {
    id: '3',
    slug: 'chaojijianli',
    name: '超级简历',
    chineseName: '超级简历 WonderCV',
    tagline: '智能简历制作工具，专业模板一键生成',
    description: '国内领先的智能简历制作平台，提供专业的简历模板和AI优化功能。',
    website: 'https://www.wondercv.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=wondercv',
    category: 'resume',
    status: 'published',
    content: {
      founderBackground: '由国内顶尖互联网团队创立，专注中文求职市场',
      problemSolved: [
        '中文简历排版复杂',
        '不了解国内HR的简历偏好',
        '简历内容不知道怎么写'
      ],
      userValue: [
        { feature: '智能一页', desc: '自动调整内容，确保简历一页完成' },
        { feature: '案例库', desc: '海量名企Offer简历案例参考' },
        { feature: 'AI检查', desc: '智能检测简历问题并给出建议' }
      ],
      targetUsers: '国内求职者、应届毕业生',
      howToUse: [
        '选择适合的简历模板',
        '填写个人信息和经历',
        '使用AI检查优化简历',
        '导出PDF投递'
      ],
      useCases: [
        {
          scenario: '秋招准备',
          before: '简历内容空洞，不知道突出什么',
          after: '参考案例库优化后，获得大厂面试机会'
        }
      ],
      pricing: {
        free: '基础模板，3份简历',
        pro: '¥19/月 - 15份简历，AI检查',
        premium: '¥99终身 - 无限简历，导师辅导优惠'
      },
      pros: ['中文支持优秀', '模板适合国内市场', '案例库丰富'],
      cons: ['高级功能需要付费', '部分模板较为普通']
    },
    rating: 8.9,
    viewCount: 25680,
    isFeatured: true,
    createdAt: '2024-01-20T08:00:00Z',
    updatedAt: '2024-01-25T11:00:00Z',
    publishedAt: '2024-01-25T09:00:00Z',
    source: 'manual'
  },
  
  // ============ 面试准备类 ============
  {
    id: '4',
    slug: 'interviewing-io',
    name: 'interviewing.io',
    chineseName: '匿名技术面试平台',
    tagline: '与一线大厂工程师进行匿名模拟面试',
    description: 'interviewing.io 是一个匿名技术面试平台，求职者可以与来自 Google、Facebook 等大厂的工程师进行模拟面试。',
    website: 'https://interviewing.io',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=interviewing',
    category: 'interview',
    status: 'published',
    content: {
      founderBackground: '由 Aline Lerner 创立，前技术招聘专家',
      problemSolved: [
        '面试紧张，无法发挥真实水平',
        '缺乏真实的面试练习机会',
        '面试表现无法获得专业反馈'
      ],
      userValue: [
        { feature: '匿名面试', desc: '隐藏个人信息，专注于技术能力' },
        { feature: '大厂面试官', desc: '面试官来自顶级科技公司' },
        { feature: '详细反馈', desc: '面试后获得专业改进建议' }
      ],
      targetUsers: '准备技术面试的工程师',
      howToUse: [
        '注册并选择面试类型',
        '预约模拟面试时间',
        '进行在线技术面试',
        '查看反馈报告并针对性提升'
      ],
      useCases: [
        {
          scenario: 'Google面试准备',
          before: '对算法面试没有信心，缺乏实战经验',
          after: '经过5次模拟面试，成功通过Google面试'
        }
      ],
      pricing: {
        free: '免费观看面试录像',
        pro: '$150-250/次 - 模拟面试',
        premium: '$500+/月 - 包月辅导计划'
      },
      pros: ['面试官质量高', '匿名机制公平', '反馈专业详细'],
      cons: ['价格较高', '主要面向英文面试', '时间预约较难']
    },
    rating: 9.5,
    viewCount: 9870,
    isFeatured: true,
    createdAt: '2024-01-22T08:00:00Z',
    updatedAt: '2024-01-28T09:30:00Z',
    publishedAt: '2024-01-28T09:00:00Z',
    source: 'producthunt'
  },
  {
    id: '5',
    slug: 'niuke',
    name: '牛客网',
    chineseName: '牛客网 NowCoder',
    tagline: '求职备考平台，笔试面试题库+AI模拟面试',
    description: '国内最大的程序员求职备考社区，提供海量笔试面试题库、AI模拟面试和求职交流。',
    website: 'https://www.nowcoder.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=nowcoder',
    category: 'interview',
    status: 'published',
    content: {
      founderBackground: '由牛客网团队创立，专注程序员求职领域',
      problemSolved: [
        '找不到目标公司的笔试面试题',
        '缺乏真实的面试环境练习',
        '求职信息不对称'
      ],
      userValue: [
        { feature: '公司题库', desc: '按公司分类的真实笔试面试题' },
        { feature: 'AI模拟面试', desc: 'AI面试官进行行为面试练习' },
        { feature: '求职社区', desc: '与同期求职者交流面经' }
      ],
      targetUsers: '准备国内互联网大厂面试的学生',
      howToUse: [
        '刷目标公司的笔试题库',
        '参加模拟面试练习',
        '阅读面经和求职经验',
        '参与社区讨论'
      ],
      useCases: [
        {
          scenario: '字节跳动面试',
          before: '不知道面试流程和题型',
          after: '刷完题库后，面试遇到多道原题'
        }
      ],
      pricing: {
        free: '大部分题库免费',
        pro: '¥199/年 - 模拟面试次数增加',
        premium: '¥999/年 - 包含课程和1对1辅导'
      },
      pros: ['题库全面', '社区活跃', '针对国内公司'],
      cons: ['部分内容需付费', '广告较多', '界面稍显复杂']
    },
    rating: 9.0,
    viewCount: 45670,
    isFeatured: true,
    createdAt: '2024-01-25T08:00:00Z',
    updatedAt: '2024-01-30T10:00:00Z',
    publishedAt: '2024-01-30T09:00:00Z',
    source: 'manual'
  },
  {
    id: '6',
    slug: 'yoodli',
    name: 'Yoodli',
    chineseName: 'Yoodli AI面试教练',
    tagline: 'AI驱动的面试练习和反馈平台',
    description: 'Yoodli 使用 AI 技术帮助你练习面试演讲，分析你的语速、填充词、眼神接触等，提供个性化改进建议。',
    website: 'https://yoodli.ai',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=yoodli',
    category: 'interview',
    status: 'published',
    content: {
      founderBackground: '由 Varun Puri 和 Esha Joshi 创立，Google AI 背景',
      problemSolved: [
        '面试时说话紧张、语无伦次',
        '不知道自己的表达问题在哪里',
        '缺乏面试演讲练习机会'
      ],
      userValue: [
        { feature: 'AI语音分析', desc: '分析语速、停顿、填充词使用' },
        { feature: '视频反馈', desc: '评估眼神接触和肢体语言' },
        { feature: '个性化建议', desc: '基于AI分析的改进建议' }
      ],
      targetUsers: '需要提升面试表达能力的人',
      howToUse: [
        '选择面试问题或话题',
        '录制视频回答',
        '查看AI分析报告',
        '针对性练习改进'
      ],
      useCases: [
        {
          scenario: '行为面试准备',
          before: '说话太快，经常使用"嗯""啊"等填充词',
          after: '经过练习，表达更流畅自信'
        }
      ],
      pricing: {
        free: '基础分析功能',
        pro: '$12/月 - 详细报告，无限练习',
        premium: '$48/月 - 团队功能，高级分析'
      },
      pros: ['AI分析精准', '界面简洁', '反馈即时'],
      cons: ['主要支持英文', '高级功能较贵']
    },
    rating: 8.6,
    viewCount: 7890,
    isFeatured: false,
    createdAt: '2024-01-28T08:00:00Z',
    updatedAt: '2024-02-01T11:00:00Z',
    publishedAt: '2024-02-01T09:00:00Z',
    source: 'producthunt'
  },
  
  // ============ 职业规划类 ============
  {
    id: '7',
    slug: 'teal',
    name: 'Teal',
    chineseName: 'Teal 求职工作区',
    tagline: '一站式求职管理平台，从简历到Offer全程跟踪',
    description: 'Teal 是一个综合性的求职管理平台，提供简历构建、职位追踪、面试准备和薪资谈判等全方位工具。',
    website: 'https://www.tealhq.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=teal',
    category: 'career',
    status: 'published',
    content: {
      founderBackground: '由 Dave Fano 创立，前 WeWork 高管',
      problemSolved: [
        '求职过程混乱，无法追踪申请状态',
        '简历与职位匹配度低',
        '缺乏系统的求职规划'
      ],
      userValue: [
        { feature: '求职CRM', desc: '像管理销售漏斗一样管理求职' },
        { feature: '简历AI', desc: '根据职位自动调整简历内容' },
        { feature: '职位追踪', desc: '自动保存和追踪感兴趣的职位' }
      ],
      targetUsers: '积极求职的职场人',
      howToUse: [
        '创建个人档案和简历',
        '使用浏览器插件保存职位',
        '追踪每个申请的进度',
        '使用AI优化每份简历'
      ],
      useCases: [
        {
          scenario: '大规模求职',
          before: '申请了50家公司后完全混乱',
          after: '系统化管理，拿到5个offer'
        }
      ],
      pricing: {
        free: '基础简历构建，5个职位追踪',
        pro: '$9/周 或 $29/月 - 无限追踪，AI功能',
        premium: '$79/月 - 包含职业教练'
      },
      pros: ['功能全面', 'Chrome插件方便', 'AI简历优化实用'],
      cons: ['价格较高', '学习曲线较陡']
    },
    rating: 8.7,
    viewCount: 11230,
    isFeatured: true,
    createdAt: '2024-02-05T08:00:00Z',
    updatedAt: '2024-02-10T10:00:00Z',
    publishedAt: '2024-02-10T09:00:00Z',
    source: 'producthunt'
  },
  {
    id: '8',
    slug: 'maimai',
    name: '脉脉',
    chineseName: '脉脉职场社区',
    tagline: '中国领先的职场社交和求职平台',
    description: '脉脉是中国最大的职场社交平台，提供公司点评、薪资查询、内推机会和职业人脉拓展。',
    website: 'https://maimai.cn',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=maimai',
    category: 'career',
    status: 'published',
    content: {
      founderBackground: '由林凡创立，前搜狗技术高管',
      problemSolved: [
        '不了解目标公司的真实情况',
        '找不到内推渠道',
        '职场人脉拓展困难'
      ],
      userValue: [
        { feature: '公司点评', desc: '查看员工对公司的真实评价' },
        { feature: '职言区', desc: '匿名讨论职场话题' },
        { feature: '内推广场', desc: '寻找目标公司的内推机会' }
      ],
      targetUsers: '想了解公司内幕的求职者',
      howToUse: [
        '注册并完善职业档案',
        '搜索目标公司查看评价',
        '在职场社区交流信息',
        '寻找内推机会'
      ],
      useCases: [
        {
          scenario: 'Offer选择',
          before: '拿到两个offer不知道选哪个',
          after: '查看两家公司的员工评价后做出明智选择'
        }
      ],
      pricing: {
        free: '基础社区功能',
        pro: '¥30/月 - 查看访客，更多曝光',
        premium: '¥198/年 - 会员专属功能'
      },
      pros: ['国内公司信息全', '社区活跃', '内推机会多'],
      cons: ['信息真实性参差不齐', '广告较多', '隐私保护需加强']
    },
    rating: 8.4,
    viewCount: 67890,
    isFeatured: false,
    createdAt: '2024-02-08T08:00:00Z',
    updatedAt: '2024-02-12T10:00:00Z',
    publishedAt: '2024-02-12T09:00:00Z',
    source: 'manual'
  },
  
  // ============ 技能提升类 ============
  {
    id: '9',
    slug: 'leetcode',
    name: 'LeetCode',
    chineseName: '力扣',
    tagline: '全球极客挚爱的技术成长平台',
    description: 'LeetCode 是全球最大的程序员技术提升平台，提供海量算法题目、面试题库和竞赛。',
    website: 'https://leetcode.cn',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=leetcode',
    category: 'skill',
    status: 'published',
    content: {
      founderBackground: '成立于2015年，硅谷工程师创立',
      problemSolved: [
        '算法基础薄弱，面试笔试过不了',
        '缺乏系统的算法学习路径',
        '找不到适合面试的题目'
      ],
      userValue: [
        { feature: '海量题库', desc: '2000+算法题目，按难度分类' },
        { feature: '公司题库', desc: '各公司高频面试题合集' },
        { feature: '学习路径', desc: '从入门到精通的系统化学习' }
      ],
      targetUsers: '准备技术面试的程序员',
      howToUse: [
        '选择适合的难度开始刷题',
        '按公司分类练习高频题',
        '参加周赛检验水平',
        '查看题解学习最优解'
      ],
      useCases: [
        {
          scenario: '算法面试准备',
          before: '算法基础薄弱，笔试经常挂',
          after: '刷题200道后，顺利通过大厂算法面试'
        }
      ],
      pricing: {
        free: '大部分题目免费',
        pro: '¥299/年 - 解锁付费题，模拟面试',
        premium: '¥499/年 - 包含课程和优先判题'
      },
      pros: ['题库最全', '社区题解丰富', '针对面试'],
      cons: ['部分题目需付费', '会员价格较高']
    },
    rating: 9.3,
    viewCount: 89230,
    isFeatured: true,
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
    publishedAt: '2024-02-15T09:00:00Z',
    source: 'manual'
  },
  {
    id: '10',
    slug: 'pramp',
    name: 'Pramp',
    chineseName: '免费同伴模拟面试',
    tagline: '与真实求职者互相模拟面试，完全免费',
    description: 'Pramp 是一个免费的对等模拟面试平台，你可以与其他求职者互相进行模拟面试。',
    website: 'https://www.pramp.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=pramp',
    category: 'skill',
    status: 'published',
    content: {
      founderBackground: '由 Refael 和 Yahav 创立，以色列创业者',
      problemSolved: [
        '找不到人一起练习面试',
        '模拟面试服务太贵',
        '缺乏真实的面试体验'
      ],
      userValue: [
        { feature: '免费配对', desc: '与水平相当的求职者配对' },
        { feature: '多种类型', desc: '算法、系统设计、行为面试等' },
        { feature: '互相反馈', desc: '面试后互相给出改进建议' }
      ],
      targetUsers: '预算有限的求职者',
      howToUse: [
        '注册并选择面试类型',
        '预约可用的面试时间',
        '与配对伙伴进行面试',
        '交换反馈并改进'
      ],
      useCases: [
        {
          scenario: '预算有限的求职者',
          before: '模拟面试服务太贵，没钱练习',
          after: '在Pramp免费练习了10次，面试表现大幅提升'
        }
      ],
      pricing: {
        free: '所有核心功能免费',
        pro: '付费课程和辅导',
        premium: '企业团队版'
      },
      pros: ['完全免费', '社区活跃', '多种面试类型'],
      cons: ['配对质量不稳定', '需要协调时间', '主要靠自学']
    },
    rating: 8.5,
    viewCount: 15670,
    isFeatured: false,
    createdAt: '2024-02-12T08:00:00Z',
    updatedAt: '2024-02-18T10:00:00Z',
    publishedAt: '2024-02-18T09:00:00Z',
    source: 'producthunt'
  },
  
  // ============ 职位匹配类 ============
  {
    id: '11',
    slug: 'lazyapply',
    name: 'LazyApply',
    chineseName: '自动求职投递工具',
    tagline: '一键自动投递数百份工作，解放你的时间',
    description: 'LazyApply 可以自动在 LinkedIn、Indeed 等平台上批量投递简历，大幅提升求职效率。',
    website: 'https://lazyapply.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=lazyapply',
    category: 'matching',
    status: 'published',
    content: {
      founderBackground: '由求职 frustrated 的工程师创立',
      problemSolved: [
        '手动投递简历太耗时',
        '申请量上不去',
        '重复填写相同信息'
      ],
      userValue: [
        { feature: '自动填充', desc: '自动填写申请表单' },
        { feature: '批量投递', desc: '一天投递数百个职位' },
        { feature: '多平台支持', desc: '支持LinkedIn、Indeed等' }
      ],
      targetUsers: '需要大规模投递的求职者',
      howToUse: [
        '安装浏览器插件',
        '设置简历和求职偏好',
        '选择目标职位',
        '一键自动投递'
      ],
      useCases: [
        {
          scenario: '大规模求职',
          before: '一天只能手动投递10份简历',
          after: '使用LazyApply一天投递200份，获得多个面试'
        }
      ],
      pricing: {
        free: '限量自动投递',
        pro: '$99/月 - 无限投递',
        premium: '$249终身 - 所有功能'
      },
      pros: ['效率极高', '节省时间', '多平台支持'],
      cons: ['投递质量可能下降', '部分平台限制', '需要仔细筛选']
    },
    rating: 8.3,
    viewCount: 9870,
    isFeatured: false,
    createdAt: '2024-02-15T08:00:00Z',
    updatedAt: '2024-02-20T10:00:00Z',
    publishedAt: '2024-02-20T09:00:00Z',
    source: 'producthunt'
  },
  {
    id: '12',
    slug: 'boss',
    name: 'Boss直聘',
    chineseName: 'Boss直聘',
    tagline: '找工作，直接跟老板谈',
    description: '国内领先的求职招聘平台，可以直接与招聘方在线沟通，快速获得面试机会。',
    website: 'https://www.zhipin.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=boss',
    category: 'matching',
    status: 'published',
    content: {
      founderBackground: '由赵鹏于2013年创立',
      problemSolved: [
        '投递简历后石沉大海',
        '不知道HR是否看了简历',
        '面试机会获取慢'
      ],
      userValue: [
        { feature: '直聊功能', desc: '直接与招聘方在线沟通' },
        { feature: '快速反馈', desc: '沟通后快速获得面试邀请' },
        { feature: '职位丰富', desc: '覆盖各行业各城市职位' }
      ],
      targetUsers: '国内各层次求职者',
      howToUse: [
        '创建在线简历',
        '浏览并筛选职位',
        '主动与Boss沟通',
        '获取面试邀请'
      ],
      useCases: [
        {
          scenario: '快速求职',
          before: '投递简历后一周没回应',
          after: '当天与3个Boss沟通，第二天获得面试'
        }
      ],
      pricing: {
        free: '基础功能免费',
        pro: '¥68/月 - 简历置顶，更多曝光',
        premium: '¥198/月 - 优先展示'
      },
      pros: ['沟通高效', '职位多', '反馈快'],
      cons: ['部分骚扰信息', '中介较多', '高级功能贵']
    },
    rating: 8.6,
    viewCount: 125670,
    isFeatured: true,
    createdAt: '2024-02-18T08:00:00Z',
    updatedAt: '2024-02-22T10:00:00Z',
    publishedAt: '2024-02-22T09:00:00Z',
    source: 'manual'
  },
  
  // ============ GitHub 开源项目 ============
  {
    id: '13',
    slug: 'resume-matcher',
    name: 'Resume Matcher',
    chineseName: '开源简历匹配工具',
    tagline: 'AI驱动的开源简历优化工具，一键解析匹配JD',
    description: 'Resume Matcher 是一个开源的 AI 简历优化工具，可以解析简历和职位描述，提供关键词匹配和建议。',
    website: 'https://github.com/srbhr/Resume-Matcher',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=resumematcher',
    category: 'resume',
    status: 'published',
    content: {
      founderBackground: '开源社区项目，由 srbhr 维护',
      problemSolved: [
        '商业ATS工具太贵',
        '想要私有化部署',
        '需要定制化功能'
      ],
      userValue: [
        { feature: '完全免费', desc: '开源免费，无使用限制' },
        { feature: '本地部署', desc: '数据不上传云端，保护隐私' },
        { feature: '可定制', desc: '可以根据需求修改代码' }
      ],
      targetUsers: '技术背景的求职者、开发者',
      howToUse: [
        '克隆GitHub仓库',
        '安装依赖并配置',
        '上传简历和JD',
        '查看匹配度报告'
      ],
      useCases: [
        {
          scenario: '隐私敏感用户',
          before: '不想把简历上传到第三方平台',
          after: '本地部署Resume Matcher，安全又免费'
        }
      ],
      pricing: {
        free: '完全免费开源',
        pro: '自行部署服务器成本',
        premium: '自定义开发成本'
      },
      pros: ['完全免费', '开源可定制', '本地部署保护隐私'],
      cons: ['需要技术背景', '部署较复杂', '功能相对简单']
    },
    rating: 8.2,
    viewCount: 5670,
    isFeatured: false,
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-02-25T10:00:00Z',
    publishedAt: '2024-02-25T09:00:00Z',
    source: 'github'
  },
  {
    id: '14',
    slug: 'openresume',
    name: 'OpenResume',
    chineseName: '开源简历生成器',
    tagline: '免费开源的ATS友好简历生成器',
    description: 'OpenResume 是一个免费开源的简历生成器，生成的简历完全 ATS 友好，支持实时预览。',
    website: 'https://github.com/xitanggg/openresume',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=openresume',
    category: 'resume',
    status: 'published',
    content: {
      founderBackground: '开源项目，社区驱动',
      problemSolved: [
        '找不到免费的ATS友好简历工具',
        '在线工具导出有水印',
        '担心简历数据隐私'
      ],
      userValue: [
        { feature: '完全免费', desc: '无广告、无水印、无限制' },
        { feature: 'ATS优化', desc: '模板专为ATS系统设计' },
        { feature: '实时预览', desc: '编辑时即时查看效果' }
      ],
      targetUsers: '预算有限的求职者',
      howToUse: [
        '访问GitHub Pages版本',
        '或使用npm本地运行',
        '填写简历信息',
        '导出PDF'
      ],
      useCases: [
        {
          scenario: '学生求职',
          before: '没钱购买付费简历工具',
          after: '使用OpenResume免费制作专业简历'
        }
      ],
      pricing: {
        free: '完全免费',
        pro: '自行部署成本',
        premium: '捐赠支持开发'
      },
      pros: ['完全免费', 'ATS友好', '可本地使用'],
      cons: ['模板选择较少', '需要自己部署']
    },
    rating: 8.0,
    viewCount: 4320,
    isFeatured: false,
    createdAt: '2024-02-22T08:00:00Z',
    updatedAt: '2024-02-28T10:00:00Z',
    publishedAt: '2024-02-28T09:00:00Z',
    source: 'github'
  },
  {
    id: '15',
    slug: 'ecoute',
    name: 'Ecoute',
    chineseName: '实时面试助手',
    tagline: '实时转录面试问题并生成回答建议',
    description: 'Ecoute 使用 OpenAI GPT-4 实时转录面试问题，并为求职者生成回答建议。',
    website: 'https://github.com/SevaSk/ecoute',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=ecoute',
    category: 'interview',
    status: 'published',
    content: {
      founderBackground: '由 SevaSk 开发的开源项目',
      problemSolved: [
        '面试时紧张忘记要点',
        '需要面试时的提示',
        '想练习面试回答'
      ],
      userValue: [
        { feature: '实时转录', desc: '实时转录面试官的问题' },
        { feature: 'AI建议', desc: '生成可能的回答方向' },
        { feature: '本地运行', desc: '隐私安全，数据不泄露' }
      ],
      targetUsers: '需要面试辅助的求职者（注意：正式面试使用需谨慎）',
      howToUse: [
        '克隆GitHub仓库',
        '配置OpenAI API Key',
        '运行程序',
        '开始面试时启用'
      ],
      useCases: [
        {
          scenario: '面试练习',
          before: '面试时经常答非所问',
          after: '使用Ecoute练习，学会更好地组织回答'
        }
      ],
      pricing: {
        free: '开源免费（需OpenAI API）',
        pro: 'OpenAI API使用费用',
        premium: '自行部署服务器'
      },
      pros: ['实时反馈', '开源可定制', '本地运行'],
      cons: ['需要OpenAI API', '仅支持英文', '使用需谨慎']
    },
    rating: 7.8,
    viewCount: 8920,
    isFeatured: false,
    createdAt: '2024-02-25T08:00:00Z',
    updatedAt: '2024-03-01T10:00:00Z',
    publishedAt: '2024-03-01T09:00:00Z',
    source: 'github'
  },
  
  // ============ 更多国内产品 ============
  {
    id: '16',
    slug: 'zhitong',
    name: '职徒简历',
    chineseName: '职徒简历 52cv',
    tagline: '智能简历制作+AI测评，提升面试率',
    description: '职徒简历提供智能简历制作、AI测评和海量案例库，帮助求职者打造高通过率简历。',
    website: 'https://www.52cv.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=52cv',
    category: 'resume',
    status: 'published',
    content: {
      founderBackground: '专注中文求职市场的简历工具团队',
      problemSolved: [
        '简历不知道如何写',
        '不知道简历问题在哪里',
        '缺乏参考案例'
      ],
      userValue: [
        { feature: 'AI测评', desc: '智能评分并指出问题' },
        { feature: '案例库', desc: '各行业优秀简历参考' },
        { feature: '导师辅导', desc: '可预约专业导师修改' }
      ],
      targetUsers: '国内求职者、应届生',
      howToUse: [
        '选择模板创建简历',
        '使用AI测评检查问题',
        '参考案例库优化',
        '导出投递'
      ],
      useCases: [
        {
          scenario: '简历优化',
          before: '简历投递无回应',
          after: '优化后面试邀约增加3倍'
        }
      ],
      pricing: {
        free: '基础功能',
        pro: '¥29/月 - AI测评，更多模板',
        premium: '¥199/次 - 导师1对1辅导'
      },
      pros: ['AI测评实用', '案例丰富', '导师专业'],
      cons: ['高级功能较贵', '部分模板需付费']
    },
    rating: 8.5,
    viewCount: 23450,
    isFeatured: false,
    createdAt: '2024-03-01T08:00:00Z',
    updatedAt: '2024-03-05T10:00:00Z',
    publishedAt: '2024-03-05T09:00:00Z',
    source: 'manual'
  },
  {
    id: '17',
    slug: 'shixiseng',
    name: '实习僧',
    chineseName: '实习僧',
    tagline: '大学生实习求职平台',
    description: '专注大学生实习求职的平台，提供海量实习岗位和校招信息。',
    website: 'https://www.shixiseng.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=shixiseng',
    category: 'matching',
    status: 'published',
    content: {
      founderBackground: '专注大学生求职市场',
      problemSolved: [
        '找不到实习机会',
        '校招信息分散',
        '缺乏求职经验'
      ],
      userValue: [
        { feature: '实习岗位', desc: '专注实习岗位，数量丰富' },
        { feature: '校招日历', desc: '汇总各大公司校招时间' },
        { feature: '经验分享', desc: '面经和求职经验分享' }
      ],
      targetUsers: '大学生、应届生',
      howToUse: [
        '创建学生档案',
        '浏览实习/校招岗位',
        '投递简历',
        '参加面试'
      ],
      useCases: [
        {
          scenario: '找实习',
          before: '不知道哪里找实习',
          after: '在实习僧找到心仪实习'
        }
      ],
      pricing: {
        free: '基础求职功能',
        pro: '简历置顶等服务',
        premium: '求职辅导课程'
      },
      pros: ['专注实习', '岗位多', '适合学生'],
      cons: ['主要面向学生', '社招岗位少']
    },
    rating: 8.3,
    viewCount: 45670,
    isFeatured: false,
    createdAt: '2024-03-05T08:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z',
    publishedAt: '2024-03-10T09:00:00Z',
    source: 'manual'
  },
  {
    id: '18',
    slug: 'kanzhun',
    name: '看准网',
    chineseName: '看准网',
    tagline: '查工资、聊面试、评公司',
    description: '看准网提供公司点评、薪资查询、面试经验分享，帮助求职者了解目标公司。',
    website: 'https://www.kanzhun.com',
    logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=kanzhun',
    category: 'career',
    status: 'published',
    content: {
      founderBackground: '国内知名的职场信息平台',
      problemSolved: [
        '不了解公司真实情况',
        '不知道薪资水平',
        '面试流程不清楚'
      ],
      userValue: [
        { feature: '公司点评', desc: '员工真实评价' },
        { feature: '薪资查询', desc: '了解各公司各岗位薪资' },
        { feature: '面经分享', desc: '面试经验参考' }
      ],
      targetUsers: '想了解公司内幕的求职者',
      howToUse: [
        '搜索目标公司',
        '查看员工评价',
        '参考面经',
        '了解薪资范围'
      ],
      useCases: [
        {
          scenario: 'Offer选择',
          before: '不知道两家公司该选哪个',
          after: '查看评价后做出明智选择'
        }
      ],
      pricing: {
        free: '基础信息免费',
        pro: '详细薪资数据',
        premium: '企业版'
      },
      pros: ['信息真实', '数据丰富', '参考性强'],
      cons: ['评价可能有偏差', '部分信息需付费']
    },
    rating: 8.4,
    viewCount: 56780,
    isFeatured: false,
    createdAt: '2024-03-08T08:00:00Z',
    updatedAt: '2024-03-12T10:00:00Z',
    publishedAt: '2024-03-12T09:00:00Z',
    source: 'manual'
  }
];

export const mockDailyPosts: DailyPost[] = [
  {
    id: '1',
    postDate: '2024-03-15',
    toolIds: ['1'],
    status: 'published',
    createdAt: '2024-03-15T08:00:00Z'
  },
  {
    id: '2',
    postDate: '2024-03-14',
    toolIds: ['4'],
    status: 'published',
    createdAt: '2024-03-14T08:00:00Z'
  },
  {
    id: '3',
    postDate: '2024-03-13',
    toolIds: ['7'],
    status: 'published',
    createdAt: '2024-03-13T08:00:00Z'
  }
];

export const mockAdminUser: AdminUser = {
  id: '1',
  username: 'admin',
  email: 'admin@jobaiscout.com',
  role: 'admin'
};

// 功能分类标签
export const categoryLabels: Record<string, string> = {
  all: '全部',
  resume: '简历优化',
  interview: '面试模拟',
  career: '职业规划',
  skill: '技能提升',
  matching: '职位匹配'
};

// 来源类型标签
export const sourceLabels: Record<string, { label: string; color: string; icon: string }> = {
  producthunt: { label: 'Product Hunt', color: 'bg-orange-100 text-orange-700', icon: '🔥' },
  github: { label: 'GitHub', color: 'bg-gray-800 text-white', icon: '🐙' },
  website: { label: '网站', color: 'bg-blue-100 text-blue-700', icon: '🌐' },
  app: { label: 'App', color: 'bg-purple-100 text-purple-700', icon: '📱' },
  extension: { label: '插件', color: 'bg-green-100 text-green-700', icon: '🧩' },
  chrome: { label: 'Chrome插件', color: 'bg-green-100 text-green-700', icon: '🧩' },
  web: { label: '小程序', color: 'bg-cyan-100 text-cyan-700', icon: '💬' },
  manual: { label: '精选', color: 'bg-[#7e43ff]/10 text-[#7e43ff]', icon: '✨' }
};

export const categoryColors: Record<string, string> = {
  resume: 'bg-blue-500',
  interview: 'bg-green-500',
  career: 'bg-purple-500',
  skill: 'bg-orange-500',
  matching: 'bg-pink-500'
};
