/**
 * 京华·仕途 V1.2 极简版 —— 全部游戏内容。
 *
 * 这里的模拟区、街道、人物、项目、事件都是虚构内容,只用于游戏玩法;
 * 真实公开数据仅作为行政区划名称参考,不代表任何现实机构或个人。
 */
import type { EndingDef, GameEvent, Person, Position, ProjectDef } from "./types";

export const AUTHOR = "kris 雷";

export const MONTH_NAMES = [
  "一月", "二月", "三月", "四月", "五月", "六月",
  "七月", "八月", "九月", "十月", "十一月", "十二月",
];

/**
 * 4×4 区级示意图。
 *
 * 名称参考北京行政区划命名习惯,但东华区是本作虚构的模拟区,
 * 其余名称只用于地图示意,不承载任何真实统计数据。
 */
export const DISTRICTS_GRID: { name: string; row: number; col: number; current?: boolean }[] = [
  { name: "北岭区", row: 1, col: 1 }, { name: "云山区", row: 1, col: 2 },
  { name: "清河区", row: 1, col: 3 }, { name: "雁栖区", row: 1, col: 4 },
  { name: "西城区", row: 2, col: 1 }, { name: "东城区", row: 2, col: 2 },
  { name: "东华区", row: 2, col: 3, current: true }, { name: "朝阳区", row: 2, col: 4 },
  { name: "丰台区", row: 3, col: 1 }, { name: "石景山区", row: 3, col: 2 },
  { name: "海淀区", row: 3, col: 3 }, { name: "门头沟区", row: 3, col: 4 },
  { name: "房山区", row: 4, col: 1 }, { name: "通州区", row: 4, col: 2 },
  { name: "大兴区", row: 4, col: 3 }, { name: "顺义区", row: 4, col: 4 },
];

/** 一个模拟区。 */
export const DISTRICT = {
  name: "东华区",
  note: "模拟城区,参考北京行政区划命名方式,不代表真实区县数据。",
  /** 4×4 示意网格中的位置。 */
  grid: { row: 2, col: 3 },
};

/** 一个模拟街道。 */
export const STREET = {
  name: "新桥街道",
  note: "模拟基层街道,下辖 6 个社区。",
  communities: ["北苑社区", "长桥社区", "和平里社区", "新桥东社区", "南河沿社区", "育才社区"],
  /** 辖区示意图上的 6 个区块。 */
  blocks: 6,
};

export const POSITIONS: Position[] = [
  {
    id: "level1", level: 1, stage: "基层起步", title: "街道办综合科 科员",
    duty: "承办日常公文、接待群众、盯办具体事项。",
    promote: { grade: 3, achievement: 60 },
  },
  {
    id: "level2", level: 2, stage: "基层起步", title: "街道办综合科 副科长",
    duty: "牵头具体工作,协调科室之间的事项。",
    promote: { grade: 3.2, achievement: 100 },
  },
  {
    id: "level3", level: 3, stage: "中层担当", title: "街道办综合科 科长",
    duty: "统筹业务,带队伍,对结果负责。",
    promote: { grade: 3.4, achievement: 145 },
  },
  {
    id: "level4", level: 4, stage: "中层担当", title: "街道办 副主任",
    duty: "分管一片,决定资源投向和干部使用建议。",
    promote: { grade: 3.6, achievement: 180 },
  },
  {
    id: "level5", level: 5, stage: "领导岗位", title: "区职能局 副局长",
    duty: "跨街道统筹,承担全区条线责任。",
    promote: { grade: 3.8, achievement: 215 },
  },
  {
    id: "level6", level: 6, stage: "领导岗位", title: "区政府 副职",
    duty: "分管一方,在复杂局面中作长期取舍。",
    promote: { grade: 4, achievement: 9999 },
  },
];

export const PERSONS: Person[] = [
  { id: "chen", name: "陈秉正", role: "街道办主任", affiliation: "街道办", tag: "上级", ability: 88, style: "重结果、看程序", note: "你的第一位直接上级,提拔你看实绩也看风险。", initialTrust: 55 },
  { id: "song", name: "宋晚晴", role: "党工委副书记", affiliation: "街道办", tag: "上级", ability: 84, style: "稳健、讲协调", note: "分管党建与综合协调,关键时候愿意替你说话。", initialTrust: 52 },
  { id: "qi", name: "齐乐山", role: "城市建设科科长", affiliation: "城市建设科", tag: "同级", ability: 79, style: "懂工程、脾气直", note: "项目落地要靠他,利益诱惑也常在他身边。", initialTrust: 50 },
  { id: "zhou", name: "周之桐", role: "民生服务科科长", affiliation: "民生服务科", tag: "同级", ability: 82, style: "群众工作细致", note: "群众诉求找她最有效,但她的工作量长期紧张。", initialTrust: 54 },
  { id: "yu", name: "俞燕", role: "纪工委书记", affiliation: "纪工委", tag: "监督", ability: 90, style: "只认证据", note: "不站队、不客套,是否经得起查由你决定。", initialTrust: 45 },
  { id: "he", name: "何可为", role: "区发改委主任科员", affiliation: "区发改委", tag: "外部", ability: 76, style: "流程熟、消息灵", note: "立项和资金流程上的关键联络人。", initialTrust: 48 },
];

export const PROJECTS: ProjectDef[] = [
  { id: "drain", name: "南河沿积水点改造工程", summary: "改造低洼路段排水管网,汛期前完成主体。", budget: 380, months: 6, category: "市政工程" },
  { id: "park", name: "老旧小区停车位改造", summary: "整合边角地,新增停车位并规范管理。", budget: 150, months: 4, category: "民生工程" },
  { id: "service", name: "社区服务中心升级", summary: "一层改造成便民服务大厅,方便群众办事。", budget: 90, months: 3, category: "公共服务" },
];

export const ENDINGS: EndingDef[] = [
  {
    id: "promoted", title: "一路履职", tone: "good",
    summary: "你凭借稳定的季度评价与扎实的实绩,进入了更高的领导岗位。",
    detail: "回头看你做的每一个选择:该顶住的顶住了,该让步的让了步,该留下的痕迹留下了。评价表上一句“敢于担当、作风扎实”,是几年里一笔一笔写出来的。",
  },
  {
    id: "expert", title: "专业立身", tone: "good",
    summary: "你把项目与财政管得清清楚楚,成了大家认可的业务骨干。",
    detail: "你不追求每一件事都出头,但凡是你经手的项目,账目清楚、进度明白、验收材料齐全。多年之后,同事换了几批,大家还是说:这件事交给老周,放心。",
  },
  {
    id: "oversight", title: "监督之路", tone: "good",
    summary: "你办事讲程序、证据留得足,被推荐到纪检监察岗位。",
    detail: "你见过太多“差一点就把自己搭进去”的人。因为你从不在材料上含糊,组织把你放到了更需要较真的位置上。",
  },
  {
    id: "retire", title: "平稳收官", tone: "neutral",
    summary: "职务没有再上一步,但你守住了底线,也办成了不少实事。",
    detail: "有的干部一辈子没上过主席台,可街坊提到他就点头。任职文件上最后一页只有一行字,而你的履历里,写满了小区里换好的管子和装好的路灯。",
  },
  {
    id: "investigated", title: "接受审查调查", tone: "bad",
    summary: "廉政风险积累到了无法掩饰的程度,你被立案审查调查。",
    detail: "从第一笔“顺手收下”的礼物,到第一次在验收材料上签字,你都以为只是权宜之计。后果不是一天来的,所以也来不及在一天内挽回。",
  },
];

function eventList(events: GameEvent[]): GameEvent[] {
  return events;
}

export const EVENTS: GameEvent[] = eventList([
  {
    id: "evt_first_visit",
    title: "第一件群众诉求",
    category: "appeal",
    months: [1],
    require: { minMonth: 1, notFlags: ["firstVisitDone"] },
    body: "到岗第二天,长桥社区一位老人到综合科反映:楼道声控灯坏了三个月,物业说没钱换。老人情绪激动,要求当天给答复。",
    hint: "群众诉求先看事实,再定责任。态度和效果都影响评价。",
    choices: [
      {
        id: "a", label: "当天到现场核实,协调物业先换灯",
        result: "你当场联系物业与社区,当晚灯换上。老人第二天给街道送来一封手写的感谢信。",
        effects: { satisfaction: 6, orgTrust: 3, achievement: 6, budget: -2 },
        relation: { id: "zhou", trust: 4 },
        flags: ["firstVisitDone"],
      },
      {
        id: "b", label: "按流程登记后转办物业,定期限",
        result: "你登记入台账并明确七天办结。事情办成了,但老人觉得“等了三天才有人来看”。",
        effects: { satisfaction: 2, orgTrust: 4, achievement: 3 },
        flags: ["firstVisitDone"],
      },
      {
        id: "c", label: "先向科长汇报,听安排再动",
        result: "科长认可你的谨慎,但这件小事拖了两天,楼道灯的事传到社区群里。",
        effects: { orgTrust: 2, satisfaction: -2, achievement: 2 },
        flags: ["firstVisitDone"],
      },
    ],
  },
  {
    id: "evt_drain_call",
    title: "南河沿积水点投诉",
    category: "appeal",
    months: [3, 4, 5],
    require: { minMonth: 2, notFlags: ["drainComplaintDone"] },
    body: "汛期临近,南河沿社区居民集中反映:去年大雨,小区门口积水到膝盖,今年还没有动工迹象。十多名居民要求街道给出方案。",
    hint: "民生问题拖不过汛期。先解决问题,还是先解释清楚,是两种不同的路。",
    choices: [
      {
        id: "a", label: "现场踏勘后推动立项,把它列进年度工程",
        result: "你牵头做了现场记录,把项目推上街道年度建设计划,居民代表当场表示配合。",
        effects: { satisfaction: 8, achievement: 8, budget: -10 },
        project: { id: "drain", progress: 5 },
        relation: { id: "qi", trust: 3 },
        flags: ["drainComplaintDone"],
      },
      {
        id: "b", label: "先做应急排水准备,向上争取资金",
        result: "你协调配齐抽水泵与沙袋,资金问题报区里争取。居民认可应急方案,但对根治仍有疑问。",
        effects: { satisfaction: 4, orgTrust: 4, stability: 4, budget: -4 },
        flags: ["drainComplaintDone"],
      },
      {
        id: "c", label: "如实说明资金困难,承诺年内研究",
        result: "说明了困难,群众情绪有所缓和,但社区群里出现“年年说研究”的声音。",
        effects: { satisfaction: -4, orgTrust: 1, stability: -2 },
        flags: ["drainComplaintDone"],
      },
    ],
  },
  {
    id: "evt_parking_complaint",
    title: "老旧小区停车乱象",
    category: "appeal",
    months: [4, 5, 6],
    require: { minMonth: 3, notFlags: ["parkingDone"] },
    body: "北苑社区两栋楼之间车辆随意停放,挤占消防通道。居民既有抱怨停车的,也有反对改造占用绿地的,意见不一。",
    hint: "同一件事往往有两拨群众。只顺着一边走,另一边就会变成新的问题。",
    choices: [
      {
        id: "a", label: "召开居民议事会,当场定方案再施工",
        result: "你请来两拨居民代表一起坐下来,最终定下“缩绿地、保通道”的方案,争议少了,工期也清楚了。",
        effects: { satisfaction: 7, stability: 6, achievement: 7, budget: -6 },
        project: { id: "park", progress: 8 },
        relation: { id: "song", trust: 4 },
        flags: ["parkingDone"],
      },
      {
        id: "b", label: "先清理消防通道,车位问题慢慢谈",
        result: "通道当天清理通畅,安全隐患解除,但停车矛盾仍然存在。",
        effects: { stability: 5, satisfaction: 2, achievement: 3 },
        flags: ["parkingDone"],
      },
      {
        id: "c", label: "让社区自行协商,街道暂不介入",
        result: "社区协商两周没有结果,居民开始直接向上反映“街道不管”。",
        effects: { satisfaction: -3, stability: -3, achievement: 1 },
        flags: ["parkingDone"],
      },
    ],
  },
  {
    id: "evt_budget_plan",
    title: "年度预算怎么分",
    category: "governance",
    months: [2, 3],
    require: { minMonth: 2, notFlags: ["budgetPlanDone"] },
    body: "街道年度建设资金有限。城市建设科要保工程,民生服务科希望增加社区养老和托育投入,两边都有道理。",
    hint: "财政预算不是算术题,是把有限的资源放在最需要的地方。",
    choices: [
      {
        id: "a", label: "保在建工程,先完成再谈新项目",
        result: "工程资金得到保障,进度压力缓解;民生服务科对今年的投入表示遗憾。",
        effects: { achievement: 6, orgTrust: 3, budget: 20 },
        project: { id: "drain", progress: 4 },
        relation: { id: "qi", trust: 4, },
        flags: ["budgetPlanDone"],
      },
      {
        id: "b", label: "向民生倾斜,把服务升级列进计划",
        result: "社区服务中心升级正式排上日程,群众办事的期待被点亮。",
        effects: { satisfaction: 7, achievement: 5, budget: -10 },
        project: { id: "service", progress: 6 },
        relation: { id: "zhou", trust: 5 },
        flags: ["budgetPlanDone"],
      },
      {
        id: "c", label: "平均分配,谁也不得罪",
        result: "每个方向都有一点钱,但每个项目都差一口气。",
        effects: { orgTrust: 2, achievement: 2, budget: -4 },
        flags: ["budgetPlanDone"],
      },
    ],
  },
  {
    id: "evt_service_delay",
    title: "服务大厅工期拖延",
    category: "project",
    require: { flags: ["budgetPlanDone"], notFlags: ["serviceDelayDone"] },
    body: "社区服务中心改造开工两周,施工方提出原方案中的承重墙体无法拆改,必须变更设计,否则工期再拖一个月。",
    hint: "工期与质量冲突时,先弄清事实,再决定要不要变更。",
    choices: [
      {
        id: "a", label: "请设计方复核,变更方案并补手续",
        result: "设计复核后调整了布局,虽然慢了十天,但手续齐全、质量可控。",
        effects: { achievement: 6, orgTrust: 5, budget: -8 },
        project: { id: "service", progress: 8, quality: 4 },
        relation: { id: "qi", trust: 3 },
        flags: ["serviceDelayDone"],
      },
      {
        id: "b", label: "要求施工方按原方案加人赶工",
        result: "工期保住了,但施工队对承重墙做了临时处理,留下了隐患。",
        effects: { achievement: 8, orgTrust: 2, stability: -3, integrityRisk: 3 },
        project: { id: "service", progress: 12, quality: -8 },
        flags: ["serviceDelayDone"],
      },
      {
        id: "c", label: "暂停施工,先向街道报请调整计划",
        result: "街道同意调整,进度慢了,但没有留下质量问题。",
        effects: { orgTrust: 4, achievement: 3, budget: -3 },
        project: { id: "service", progress: 3, quality: 2 },
        flags: ["serviceDelayDone"],
      },
    ],
  },
  {
    id: "evt_flood_night",
    title: "汛期的一夜",
    category: "governance",
    months: [6, 7, 8],
    require: { minMonth: 5, notFlags: ["floodDone"] },
    major: true,
    body: "凌晨两点,区里发布暴雨橙色预警。南河沿低洼路段已开始积水,附近有 200 多户居民。是否启动转移,需要你现在决定。",
    hint: "应急处理没有完美选项,只有代价更小的选择。",
    choices: [
      {
        id: "a", label: "立即组织转移低洼区住户,同步抢排",
        result: "32 户居民连夜转移到社区服务中心,积水退去后无一人受伤。代价是一夜调动了不少人力物力。",
        effects: { stability: 10, satisfaction: 8, orgTrust: 8, achievement: 10, budget: -25 },
        relation: { id: "chen", trust: 5 },
        flags: ["floodDone", "floodHandledWell"],
      },
      {
        id: "b", label: "先加强巡查抽排,暂不转移",
        result: "雨量比预报小,积水在天亮前退去。事后有人说你运气好,也有人问万一更大怎么办。",
        effects: { stability: 3, orgTrust: 4, achievement: 5, integrityRisk: 2 },
        flags: ["floodDone"],
      },
      {
        id: "c", label: "等待区里统一指令,暂不作决定",
        result: "指令在四十分钟后到达,积水已上涨了 20 厘米。没有出事,但你被记了一次“响应偏慢”。",
        effects: { stability: -5, orgTrust: -4, satisfaction: -4, achievement: 2 },
        flags: ["floodDone"],
      },
    ],
  },
  {
    id: "evt_data_supply",
    title: "一项数据两种口径",
    category: "governance",
    months: [8, 9, 10],
    require: { minMonth: 6, notFlags: ["dataDone"] },
    body: "季度报表临近。上报口径下,群众诉求办结率是 96%,但你掌握的台账里,有三件其实只是“已答复”并未真正解决。",
    hint: "数字能让你好看一个季度,也能让问题在未来某天一起回来。",
    choices: [
      {
        id: "a", label: "按实际情况上报,说明未办结原因",
        result: "报表的分数低了一些,但你在备注里写清了原因和计划,核查时站得住。",
        effects: { orgTrust: 6, achievement: 4, integrityRisk: -3 },
        flags: ["dataDone", "honestData"],
      },
      {
        id: "b", label: "按口径上报,加快补办剩下的三件",
        result: "你把三件事压给承办人限期一周办完。数字好看,团队压力陡增。",
        effects: { achievement: 6, orgTrust: 1, integrityRisk: 2 },
        relation: { id: "zhou", trust: -2 },
        flags: ["dataDone"],
      },
      {
        id: "c", label: "按上报口径填报,不额外说明",
        result: "报表顺利过关。但你在备注栏里空着的那一行,以后有机会被重新翻开。",
        effects: { achievement: 5, orgTrust: 1, integrityRisk: 5 },
        flags: ["dataDone"],
      },
    ],
  },
  {
    id: "evt_procurement_dinner",
    title: "施工方的饭局",
    category: "integrity",
    require: { minMonth: 3, notFlags: ["dinnerDone"] },
    body: "南河沿工程的施工负责人通过齐乐山约你吃饭,说“认识一下,方便以后工作”,还提到可以帮你“打听一下”区里的资金安排。",
    hint: "饭局本身不违法,但项目关系里的饭局,往往决定了以后的验收好不好开口。",
    choices: [
      {
        id: "a", label: "婉拒饭局,需要沟通就到办公室谈",
        result: "你回复“有事办公室谈”。齐乐山觉得你有点较真,但项目上的事反而更清楚了。",
        effects: { integrityRisk: -4, orgTrust: 4, achievement: 2 },
        relation: { id: "qi", trust: -1, },
        flags: ["dinnerDone"],
      },
      {
        id: "b", label: "去吃饭,只谈工作不碰钱",
        result: "饭吃得还算干净,但席间对方不断试探工期和验收,你多了一层说不清的顾虑。",
        effects: { integrityRisk: 3, achievement: 1 },
        relation: { id: "qi", trust: 3 },
        flags: ["dinnerDone"],
      },
      {
        id: "c", label: "赴约并收下对方递来的购物卡",
        result: "卡面金额不大,但从此每次验收签字,你都会先想到那张卡。",
        effects: { integrityRisk: 12, budget: 2, achievement: 2 },
        relation: { id: "qi", trust: 4 },
        flags: ["dinnerDone", "tookGift"],
      },
    ],
  },
  {
    id: "evt_gift_follow",
    title: "一张卡的追问",
    category: "integrity",
    require: { flags: ["tookGift"], notFlags: ["giftFollowDone"] },
    major: true,
    body: "纪工委例行提醒谈话中,俞燕问起你与工程承包方的往来。她手上有一份关于某次晚宴的反映材料,没有点名。",
    hint: "廉政风险越早处理代价越小。主动说明永远比被发现便宜。",
    choices: [
      {
        id: "a", label: "主动说明情况并上交购物卡,作出书面说明",
        result: "俞燕记录在案,建议谈话提醒。你损失了一些面子,但把风险切断了。",
        effects: { integrityRisk: -12, orgTrust: 5, achievement: -3 },
        relation: { id: "yu", trust: 8 },
        flags: ["giftFollowDone", "selfReported"],
      },
      {
        id: "b", label: "只说明工作往来,不提购物卡",
        result: "谈话顺利结束。但那份材料被存档,以后还会有第二次谈话。",
        effects: { integrityRisk: 6, orgTrust: 1 },
        flags: ["giftFollowDone"],
      },
      {
        id: "c", label: "先私下找齐乐山商量怎么应对",
        result: "齐乐山劝你“别多想”,但这件本来只涉及你的事,变成了两个人的事。",
        effects: { integrityRisk: 9, orgTrust: -3 },
        relation: { id: "qi", trust: 3 },
        flags: ["giftFollowDone", "colluded"],
      },
    ],
  },
  {
    id: "evt_audit_ready",
    title: "审计前的自查",
    category: "integrity",
    months: [6, 7, 8],
    require: { minMonth: 5, notFlags: ["auditDone"] },
    body: "区审计局将对街道在建工程开展专项审计。齐乐山提议先把部分材料“补规范”,理由是“大家都这么干”。",
    hint: "补材料与补事实,是完全不同的两件事。",
    choices: [
      {
        id: "a", label: "组织如实自查,缺什么补什么",
        result: "自查发现两处手续不全,提前整改到位。审计进场时,情况说明比谁都有底气。",
        effects: { orgTrust: 8, integrityRisk: -6, achievement: 5, budget: -5 },
        relation: { id: "qi", trust: -2 },
        flags: ["auditDone", "cleanAudit"],
      },
      {
        id: "b", label: "同意先补齐材料,把时间对上",
        result: "表面上看不出问题,但你清楚有几份签字的时间不是原本那天。",
        effects: { achievement: 4, integrityRisk: 8, orgTrust: 2 },
        relation: { id: "qi", trust: 4 },
        flags: ["auditDone", "paddedPaperwork"],
      },
      {
        id: "c", label: "把选择交回街道办,请分管领导定",
        result: "分管领导要求按规定自查,你少担了一层责任,但也被认为“主意不够硬”。",
        effects: { orgTrust: 3, integrityRisk: -2, achievement: 2 },
        flags: ["auditDone"],
      },
    ],
  },
  {
    id: "evt_team_burden",
    title: "同事的工作量",
    category: "personnel",
    months: [4, 5, 9, 10],
    require: { minMonth: 3, notFlags: ["teamDone"] },
    body: "周之桐连续两个月加班处理诉求,已经出现情绪。她提出希望把一部分台账工作移给综合科,但综合科也人手紧张。",
    hint: "人事关系不是好感度,是把活分给合适的人,并让结果落得下来。",
    choices: [
      {
        id: "a", label: "重新分工,把台账流程简化一半",
        result: "你拉着两个科室一起砍掉重复填报,周之桐的压力明显缓解,办理效率反而提高。",
        effects: { orgTrust: 5, achievement: 6, satisfaction: 3 },
        relation: { id: "zhou", trust: 7 },
        flags: ["teamDone", "easedWorkload"],
      },
      {
        id: "b", label: "向上申请增加一名借调人员",
        result: "借调申请批了两个月。短期缓解,但对面的科室又缺了人。",
        effects: { orgTrust: 3, achievement: 3, budget: -6 },
        relation: { id: "zhou", trust: 4 },
        flags: ["teamDone"],
      },
      {
        id: "c", label: "请她再坚持,汛期后统一调整",
        result: "她没再说什么,但此后几次跨科室协作,民生服务科的态度明显消极。",
        effects: { achievement: 2, orgTrust: -2, satisfaction: -2 },
        relation: { id: "zhou", trust: -5 },
        flags: ["teamDone"],
      },
    ],
  },
  {
    id: "evt_promotion_review",
    title: "一次晋升考察",
    category: "personnel",
    require: { minMonth: 8, notFlags: ["promoReviewDone"] },
    body: "组织部门到街道开展干部考察,谈话中问到你与同事的协作,以及几件争议事项的处理过程。",
    hint: "考察不是让你表现,而是让别人替你说话。",
    choices: [
      {
        id: "a", label: "如实说明成绩与不足,提供完整材料",
        result: "谈话对象普遍评价你“实在、能担事”。组织部门记下了这一点。",
        effects: { orgTrust: 8, achievement: 5, integrityRisk: -2 },
        flags: ["promoReviewDone"],
      },
      {
        id: "b", label: "重点汇报亮点工作,回避问题",
        result: "汇报听着漂亮,但谈话对象补充的细节和你说的不太一致。",
        effects: { orgTrust: -3, achievement: 3 },
        flags: ["promoReviewDone"],
      },
      {
        id: "c", label: "请熟悉的同事帮忙多说几句好话",
        result: "有人帮你说了话,也有人察觉到这层安排。",
        effects: { orgTrust: 2, achievement: 3, integrityRisk: 3 },
        relation: { id: "song", trust: 2 },
        flags: ["promoReviewDone"],
      },
    ],
  },
  {
    id: "evt_media_report",
    title: "一条短视频",
    category: "governance",
    require: { minMonth: 4, notFlags: ["mediaDone"] },
    body: "一位居民拍到南河沿积水点尚未动工,配文“承诺了半年没动静”,视频在当地转发过千。",
    hint: "舆情不等于事实,但拖着不回应,舆情就会替你定事实。",
    choices: [
      {
        id: "a", label: "当天公开回应进度和节点,邀请居民监督",
        result: "你以街道名义回应了工期节点,并请居民代表参与监督。评论区逐渐转向理性。",
        effects: { satisfaction: 5, stability: 4, orgTrust: 4, achievement: 4 },
        relation: { id: "song", trust: 3 },
        flags: ["mediaDone"],
      },
      {
        id: "b", label: "联系平台处理视频,不公开回应",
        result: "视频下架了,但“被删了”的截图流传得更广。",
        effects: { satisfaction: -5, stability: -3, integrityRisk: 3 },
        flags: ["mediaDone"],
      },
      {
        id: "c", label: "先核实拍摄时间和现状,再对外说明",
        result: "核实发现视频拍摄于一个月前,现状已有变化。说明发出后,舆论很快平息。",
        effects: { satisfaction: 3, stability: 5, orgTrust: 3, achievement: 3 },
        flags: ["mediaDone"],
      },
    ],
  },
  {
    id: "evt_year_end",
    title: "年度总结怎么写",
    category: "governance",
    months: [12, 1],
    require: { minMonth: 10, notFlags: ["yearDone"] },
    body: "年度总结需要上报。几项指标完成得一般,但有两项亮点工作。写材料的人问你,要不要把亮点说成“全面突破”。",
    hint: "材料是给上面看的,但账是给自己留的。",
    choices: [
      {
        id: "a", label: "优点缺点都写,提出明年改进清单",
        result: "总结不够漂亮,但每一项不足后面都跟着具体措施。分管领导批了“实”。",
        effects: { orgTrust: 7, achievement: 5, integrityRisk: -3 },
        flags: ["yearDone"],
      },
      {
        id: "b", label: "突出亮点,问题一笔带过",
        result: "材料好看,但问答环节被追问了两次。",
        effects: { achievement: 4, orgTrust: -1 },
        flags: ["yearDone"],
      },
      {
        id: "c", label: "把问题归因于客观条件",
        result: "表面上没有责任,但同事私下都觉得“以后跟他干,出事先甩锅”。",
        effects: { orgTrust: -5, achievement: 2 },
        relation: { id: "zhou", trust: -3 },
        flags: ["yearDone"],
      },
    ],
  },
  {
    id: "evt_project_drain_wrap",
    title: "排水工程验收",
    category: "project",
    require: { flags: ["drainComplaintDone"], notFlags: ["drainWrapDone"] },
    body: "南河沿积水点改造即将完工,施工方申请验收。抽查发现两处管道接口的施工记录不完整。",
    hint: "验收签字是最容易被追责的地方,也是最应该慢下来的地方。",
    choices: [
      {
        id: "a", label: "要求补做检测,合格后再验收",
        result: "补测花了一周时间,其中一处接口返工。验收材料完整,你签得安心。",
        effects: { achievement: 7, orgTrust: 6, integrityRisk: -4, budget: -6 },
        project: { id: "drain", progress: 12, quality: 8 },
        relation: { id: "qi", trust: -2 },
        flags: ["drainWrapDone"],
      },
      {
        id: "b", label: "先验收,要求限期补齐记录",
        result: "工程交付使用,记录问题留在整改清单上,半年后仍有两页空白。",
        effects: { achievement: 6, orgTrust: 2, integrityRisk: 5 },
        project: { id: "drain", progress: 14, quality: -4 },
        flags: ["drainWrapDone"],
      },
      {
        id: "c", label: "按施工方意见签认,不再追记录",
        result: "验收当天很顺利,但这份签字以后可能被人重新拿出来。",
        effects: { achievement: 8, integrityRisk: 9 },
        project: { id: "drain", progress: 16, quality: -8 },
        relation: { id: "qi", trust: 5 },
        flags: ["drainWrapDone"],
      },
    ],
  },
  {
    id: "evt_integrity_talk",
    title: "纪工委的提醒",
    category: "integrity",
    require: { integrityRiskAbove: 30, notFlags: ["integrityTalkDone"] },
    major: true,
    body: "俞燕约你谈话。她提到近期收到的几条反映,涉及项目往来和一次材料补签,希望你能说明情况。",
    hint: "这是给你的一次机会,不是一次审问的结束。",
    choices: [
      {
        id: "a", label: "如实说明全部经过,主动整改",
        result: "你提交了书面说明和整改措施,纪工委按谈话提醒处理,风险被显著降下来。",
        effects: { integrityRisk: -16, orgTrust: 4, achievement: -3 },
        relation: { id: "yu", trust: 6 },
        flags: ["integrityTalkDone", "cooperated"],
      },
      {
        id: "b", label: "只承认与己无关的部分",
        result: "谈话结束,但你的说明与已有材料存在两处不一致。",
        effects: { integrityRisk: 4, orgTrust: -2 },
        flags: ["integrityTalkDone"],
      },
      {
        id: "c", label: "否认所有问题",
        result: "俞燕没有再问,只在记录本上写下日期。",
        effects: { integrityRisk: 8, orgTrust: -5 },
        relation: { id: "yu", trust: -6 },
        flags: ["integrityTalkDone", "denied"],
      },
    ],
  },
  {
    id: "evt_project_service_open",
    title: "服务大厅启用",
    category: "project",
    require: { flags: ["serviceDelayDone"], notFlags: ["serviceOpenDone"] },
    body: "社区服务中心一层改造完成,是否把原来分散在三个窗口的事项全部集中到大厅办理?集中后前两周会更慢。",
    hint: "改革要承担短期的难看,换来长期的效率。",
    choices: [
      {
        id: "a", label: "一次性集中,配足引导人员",
        result: "前两周排队变长,但一个月后群众办事平均少跑两趟。",
        effects: { satisfaction: 8, achievement: 8, orgTrust: 5, budget: -12 },
        project: { id: "service", progress: 15, quality: 4 },
        relation: { id: "zhou", trust: 5 },
        flags: ["serviceOpenDone", "serviceReform"],
      },
      {
        id: "b", label: "先集中高频事项,其余逐步过渡",
        result: "过渡平稳,没有出现排队拥堵,改革效果慢一些但扎实。",
        effects: { satisfaction: 5, achievement: 6, orgTrust: 4 },
        project: { id: "service", progress: 12, quality: 6 },
        flags: ["serviceOpenDone"],
      },
      {
        id: "c", label: "暂时维持原窗口,等条件成熟再说",
        result: "大厅空着一半,居民问“改了跟没改一样”吗。",
        effects: { satisfaction: -3, achievement: 2, orgTrust: -2 },
        flags: ["serviceOpenDone"],
      },
    ],
  },
  {
    id: "evt_park_accept",
    title: "车位改造收尾",
    category: "project",
    require: { flags: ["parkingDone"], notFlags: ["parkAcceptDone"] },
    body: "停车位改造进入收尾,原本承诺的 120 个车位因管线迁移只落实了 96 个,部分居民要求补偿性改善绿化。",
    hint: "承诺和现实有差距时,主动补位比拖着解释更有用。",
    choices: [
      {
        id: "a", label: "增补绿化与照明,重新公示车位台账",
        result: "补种了行道树、加装了路灯,居民代表实地看过后接受了方案。",
        effects: { satisfaction: 7, stability: 5, achievement: 5, budget: -10 },
        project: { id: "park", progress: 16, quality: 6 },
        relation: { id: "zhou", trust: 4 },
        flags: ["parkAcceptDone"],
      },
      {
        id: "b", label: "如实说明差距,不再增加投入",
        result: "居民接受了说明,但仍有人念叨“说话不算数”。",
        effects: { achievement: 3, stability: 1, satisfaction: -2 },
        project: { id: "park", progress: 14, quality: 2 },
        flags: ["parkAcceptDone"],
      },
      {
        id: "c", label: "把部分绿地划作车位,凑足数量",
        result: "车位数量对上了,绿化争议重新回到社区群。",
        effects: { achievement: 5, satisfaction: -4, stability: -3, integrityRisk: 2 },
        project: { id: "park", progress: 16, quality: -3 },
        flags: ["parkAcceptDone"],
      },
    ],
  },
  {
    id: "evt_oversight_route",
    title: "去纪检监察岗位的机会",
    category: "personnel",
    require: { minMonth: 10, notFlags: ["oversightOfferDone"] },
    body: "区里征求岗位意向。因为你在几次核查中材料扎实、程序清楚,纪检部门希望调你过去。",
    hint: "这是路线的分岔口,不是升与不升的问题。",
    choices: [
      {
        id: "a", label: "接受调动,走监督执纪路线",
        result: "你开始接触全新的工作,手上第一件事就是整理往年的问题线索。",
        effects: { orgTrust: 6, achievement: 6, integrityRisk: -4 },
        flags: ["oversightOfferDone", "tookOversight"],
      },
      {
        id: "b", label: "留在街道,继续做业务工作",
        result: "你选择留在熟悉的地方,项目与民生工作还需要人。",
        effects: { achievement: 5, orgTrust: 2 },
        flags: ["oversightOfferDone"],
      },
      {
        id: "c", label: "暂不表态,看看再说",
        result: "机会等不了太久,一周后这个岗位定了别人。",
        effects: { orgTrust: -3, achievement: 1 },
        flags: ["oversightOfferDone"],
      },
    ],
  },
  {
    id: "evt_major_test",
    title: "一次没有先例的处置",
    category: "governance",
    require: { minMonth: 11, notFlags: ["majorTestDone"] },
    major: true,
    body: "区内一处老旧楼体出现外墙脱落,涉及 3 栋楼 96 户居民。维修资金需要走应急程序,但鉴定报告还要三天才能出。",
    hint: "先保安全,还是先等程序,是基层最难的取舍之一。",
    choices: [
      {
        id: "a", label: "先设警戒、组织临时避险,同步走应急程序",
        result: "居民安全得到保障,程序在三天内补齐。有人质疑小题大做,但没有人受伤。",
        effects: { stability: 8, satisfaction: 7, orgTrust: 6, achievement: 8, budget: -20 },
        relation: { id: "chen", trust: 5 },
        flags: ["majorTestDone"],
      },
      {
        id: "b", label: "先做局部围挡,等鉴定报告",
        result: "报告出来后排除了风险。三天里居民自己拉起了警戒线,网上有议论。",
        effects: { stability: -2, satisfaction: -4, orgTrust: 3, achievement: 3 },
        flags: ["majorTestDone"],
      },
      {
        id: "c", label: "将情况上报区里,请区里决定",
        result: "区里要求先避险。指令发出时已是第二天下午。",
        effects: { orgTrust: 2, stability: -3, satisfaction: -3, achievement: 2 },
        flags: ["majorTestDone"],
      },
    ],
  },
]);

export const EVENT_INDEX: Record<string, GameEvent> = Object.fromEntries(
  EVENTS.map((e) => [e.id, e]),
);

export const PERSON_INDEX: Record<string, Person> = Object.fromEntries(
  PERSONS.map((p) => [p.id, p]),
);

export const PROJECT_INDEX: Record<string, ProjectDef> = Object.fromEntries(
  PROJECTS.map((p) => [p.id, p]),
);

export const POSITION_INDEX: Record<string, Position> = Object.fromEntries(
  POSITIONS.map((p) => [p.id, p]),
);
