export const patientsData = [
  {
    id: "p1",
    bed: "6楼16床",
    name: "张三",
    gender: "男",
    age: 65,
    roundTime: "2026-03-18 16:25",
    tags: ["呼吸机试用", "血压波动", "胸闷症状", "心脏检查安排", "睡眠呼吸障碍", "心脏微循环检查"],
    riskLevel: "medium",
    riskMessage: "高血压风险 / 心脏微循环问题 / 睡眠呼吸暂停风险",
    audioDuration: 103,
    summary: "患者因血压波动和睡眠问题今日试用了呼吸机，反馈佩戴感受尚可。同时存在胸闷症状，明日将进行心脏微循环检查以进一步明确诊断。医师指出血压波动与睡眠质量相关。",
    entities: [
      { term: "血压波动", basis: "你这个晚上睡觉睡不好了，第二天他血压它就会高" },
      { term: "睡眠问题", basis: "你这个晚上睡觉睡不好了，第二天他血压它就会高" },
      { term: "呼吸机", basis: "今天去拿这个机器了、戴的好像是还可以" },
      { term: "胸闷", basis: "平时也是胸口闷啊" },
      { term: "心脏微循环检查", basis: "明天哎对对对要吃牛奶的那个检查" }
    ],
    healthRecord: {
      diagnosis: [
        { label: "主要诊断", value: "高血压、睡眠呼吸障碍（疑似）" },
        { label: "合并问题", value: "心脏微循环问题（待确诊）、胸闷" }
      ],
      indicators: [
        { name: "血压", value: "波动", status: "warning" },
        { name: "睡眠质量", value: "差", status: "warning" },
        { name: "胸闷症状", value: "有", status: "warning" }
      ],
      medications: [
        { name: "呼吸机治疗", dosage: "试用中", usage: "夜间佩戴" }
      ]
    },
    doctorTodos: [
      { id: "t1_1", text: "完善明日心脏微循环检查", completed: false },
      { id: "t1_2", text: "评估呼吸机治疗效果", completed: false },
      { id: "t1_3", text: "监测血压波动情况", completed: false },
      { id: "t1_4", text: "根据检查结果调整治疗方案", completed: false }
    ],
    patientTodos: [
      { id: "pt1_1", text: "配合明日心脏微循环检查（牛奶检查）", importance: 3, pushed: false },
      { id: "pt1_2", text: "持续使用呼吸机并反馈使用感受", importance: 3, pushed: false },
      { id: "pt1_3", text: "记录睡眠质量和血压变化", importance: 3, pushed: false }
    ]
  },
  {
    id: "p2",
    bed: "6楼17床",
    name: "李四",
    gender: "女",
    age: 58,
    roundTime: "2026-03-18 16:26",
    tags: ["血管狭窄", "缺血症状明显", "支架置入咨询", "症状敏感性", "非优势型血管", "保守治疗", "无需支架"],
    riskLevel: "medium",
    riskMessage: "缺血事件风险中等 / 血管病变进展风险低",
    audioDuration: 43,
    summary: "患者血管较细（非优势型血管），但对缺血非常敏感，心电图变化和自觉症状明显。经评估，当前血管病变不需要放置支架，建议继续保守治疗观察。",
    entities: [
      { term: "血管较细", basis: "就它本身它那根血管就不是一个优势型的一个血管" },
      { term: "非优势型血管", basis: "就它本身它那根血管就不是一个优势型的一个血管" },
      { term: "缺血", basis: "他对那根血管还是比较敏感的" },
      { term: "心电图变化", basis: "一有缺血，他其实症状实际是一个是心电图的变化非常明显" },
      { term: "支架", basis: "是不要放，不需要这个地方不需要放啊好" }
    ],
    healthRecord: {
      diagnosis: [
        { label: "主要诊断", value: "心血管疾病（缺血症状）" },
        { label: "血管情况", value: "非优势型血管，较细" },
        { label: "治疗决策", value: "不需要放置支架" }
      ],
      indicators: [
        { name: "心电图(静息)", value: "基本正常", status: "normal" },
        { name: "心电图(缺血)", value: "变化明显", status: "warning" },
        { name: "血管类型", value: "非优势型", status: "normal" }
      ],
      medications: [
        { name: "药物治疗", dosage: "常规剂量", usage: "保守治疗方案" }
      ]
    },
    doctorTodos: [
      { id: "t2_1", text: "继续药物治疗方案", completed: false },
      { id: "t2_2", text: "密切监测缺血症状发作", completed: false },
      { id: "t2_3", text: "定期复查心电图变化", completed: false },
      { id: "t2_4", text: "如症状加重及时评估支架必要性", completed: false }
    ],
    patientTodos: [
      { id: "pt2_1", text: "记录胸痛发作频率和程度", importance: 3, pushed: false },
      { id: "pt2_2", text: "按时服药，配合治疗", importance: 3, pushed: false },
      { id: "pt2_3", text: "及时报告任何不适症状", importance: 3, pushed: false }
    ]
  },
  {
    id: "p3",
    bed: "6楼20床",
    name: "王五",
    gender: "男",
    age: 72,
    roundTime: "2026-03-18 16:28",
    tags: ["血压控制良好", "轻微头晕症状", "用药依从性好", "动态血压监测中", "脑梗死病史", "脑出血病史", "预防脑梗"],
    riskLevel: "medium",
    riskMessage: "脑梗复发风险中等 / 血压波动风险低",
    audioDuration: 98,
    summary: "患者目前血压控制良好（近期血压约100mmHg左右），存在轻微头晕症状，可能与既往腔梗/脑出血病史导致的脑缺血有关。当前药物治疗方案有效，正在使用动态血压监测设备，明日归还并评估整体血压情况。",
    entities: [
      { term: "血压控制良好", basis: "这两天血压都还蛮好、都一百零几这个样子" },
      { term: "头晕", basis: "有点脑缺血造的可能是跟原来腔梗过啊什么这些有关系" },
      { term: "脑缺血", basis: "有点脑缺血造的可能是跟原来腔梗过啊什么这些有关系" },
      { term: "腔梗", basis: "原来有过腔肿的可能是有脑出血的这个情况在" },
      { term: "脑出血", basis: "原来有过腔肿的可能是有脑出血的这个情况在" },
      { term: "动态血压监测", basis: "这个机器今天背上去了是吧、明天8点钟还回去" }
    ],
    healthRecord: {
      diagnosis: [
        { label: "主要诊断", value: "脑梗死、脑出血病史" },
        { label: "合并问题", value: "轻微脑缺血症状（头晕）" },
        { label: "治疗目的", value: "预防脑梗复发" }
      ],
      indicators: [
        { name: "血压", value: "约100-110mmHg", status: "normal" },
        { name: "动态血压监测", value: "进行中", status: "normal" }
      ],
      medications: [
        { name: "预防脑梗药物", dosage: "需调整观察", usage: "按医嘱服药" }
      ]
    },
    doctorTodos: [
      { id: "t3_1", text: "明日8点收回动态血压监测设备并分析数据", completed: false },
      { id: "t3_2", text: "根据血压监测结果调整药物", completed: false },
      { id: "t3_3", text: "关注脑缺血症状变化", completed: false },
      { id: "t3_4", text: "评估是否可以出院", completed: false }
    ],
    patientTodos: [
      { id: "pt3_1", text: "配合动态血压监测，保持正常活动", importance: 3, pushed: false },
      { id: "pt3_2", text: "记录头晕发作情况", importance: 3, pushed: false },
      { id: "pt3_3", text: "按时服药，配合药物调整", importance: 3, pushed: false }
    ]
  }
];
