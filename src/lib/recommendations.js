/* ============================================
   TwoLyp — Content Recommendations
   Curated suggestions that cycle by date.
   No API needed — pure front-end data.
   ============================================ */

export const TRAVEL_RECOMMENDATIONS = [
  { id: 'tr-1', title: '大理洱海', subtitle: '风花雪月的浪漫之城', description: '租一辆小电驴环洱海骑行，在古城小巷牵手漫步，傍晚去龙龛码头看日落把天空染成橘色。', bestSeason: '春/秋', budget: '中等', emoji: '🏔️', tags: ['自然', '古镇'] },
  { id: 'tr-2', title: '三亚', subtitle: '永远夏天的海岛', description: '在亚龙湾踩沙滩，傍晚去椰梦长廊看日落，晚上吃海鲜大排档，什么都不用想。', bestSeason: '冬/春', budget: '中等', emoji: '🏖️', tags: ['海岛', '度假'] },
  { id: 'tr-3', title: '丽江古城', subtitle: '慢下来的旧时光', description: '在四方街听纳西古乐，爬上狮子山俯瞰整座古城的屋顶，夜晚在酒吧街喝一杯微醺。', bestSeason: '春/秋', budget: '低', emoji: '🏮', tags: ['古镇', '文艺'] },
  { id: 'tr-4', title: '厦门', subtitle: '海风里的文艺小城', description: '坐渡轮去鼓浪屿走走，在环岛路骑双人自行车，去曾厝垵吃沙茶面和各种小吃。', bestSeason: '春/秋', budget: '低', emoji: '🌊', tags: ['海滨', '文艺'] },
  { id: 'tr-5', title: '成都', subtitle: '来了就不想走的城市', description: '去熊猫基地看滚滚，在宽窄巷子掏耳朵喝茶，晚上去玉林路吃串串香到深夜。', bestSeason: '四季皆宜', budget: '低', emoji: '🐼', tags: ['美食', '休闲'] },
  { id: 'tr-6', title: '青岛', subtitle: '红瓦绿树碧海蓝天', description: '在栈桥喂海鸥，去八大关拍复古照片，傍晚在小麦岛上看海上日落配一袋啤酒。', bestSeason: '夏/秋', budget: '低', emoji: '🍺', tags: ['海滨', '文艺'] },
  { id: 'tr-7', title: '西安', subtitle: '穿越千年的古都', description: '在城墙上骑自行车绕一圈，去回民街从街头吃到街尾，看兵马俑的时候偷偷惊叹。', bestSeason: '春/秋', budget: '低', emoji: '🏯', tags: ['历史', '美食'] },
  { id: 'tr-8', title: '杭州西湖', subtitle: '淡妆浓抹总相宜', description: '租一艘手划船在湖上慢慢漂，走断桥残雪的路线，去龙井村喝一杯明前龙井。', bestSeason: '春/秋', budget: '低', emoji: '🍵', tags: ['自然', '文艺'] },
  { id: 'tr-9', title: '苏州', subtitle: '园林里的江南梦', description: '逛拙政园感受移步换景，在平江路坐乌篷船听评弹，尝一碗正宗的苏式汤面。', bestSeason: '春/秋', budget: '低', emoji: '🌿', tags: ['古镇', '文艺'] },
  { id: 'tr-10', title: '重庆', subtitle: '8D魔幻山城', description: '坐轻轨穿过居民楼，在洪崖洞拍千与千寻同款夜景，找一家巷子里的老火锅吃到冒汗。', bestSeason: '秋/冬', budget: '低', emoji: '🌶️', tags: ['美食', '城市'] },
  { id: 'tr-11', title: '西双版纳', subtitle: '假装在东南亚', description: '逛星光夜市吃到撑，去中科院热带植物园看跳舞草，在告庄的夜市里淘手工艺品。', bestSeason: '冬/春', budget: '中等', emoji: '🌴', tags: ['自然', '异域'] },
  { id: 'tr-12', title: '稻城亚丁', subtitle: '蓝色星球最后净土', description: '徒步到牛奶海看那抹不可思议的蓝，在洛绒牛场看雪山倒影，累到说不出话但值得。', bestSeason: '秋', budget: '高', emoji: '🗻', tags: ['徒步', '自然'] },
  { id: 'tr-13', title: '桂林阳朔', subtitle: '山水甲天下', description: '坐竹筏在漓江上漂流，租电动车穿梭在十里画廊的田野间，晚上逛西街吃啤酒鱼。', bestSeason: '春/秋', budget: '低', emoji: '🛶', tags: ['自然', '休闲'] },
  { id: 'tr-14', title: '敦煌', subtitle: '大漠孤烟的壮阔', description: '在鸣沙山骑骆驼看日落，去莫高窟面对千年壁画发呆，夜里的星空低到仿佛伸手可触。', bestSeason: '秋', budget: '中等', emoji: '🐫', tags: ['历史', '自然'] },
  { id: 'tr-15', title: '拉萨', subtitle: '离天空最近的地方', description: '在大昭寺前看磕长头的信徒，去布达拉宫广场看日落，在甜茶馆里喝一杯甜茶发呆。', bestSeason: '夏/秋', budget: '高', emoji: '🙏', tags: ['文化', '自然'] },
  { id: 'tr-16', title: '北海道', subtitle: '白色恋人的故乡', description: '冬天在小樽运河看雪灯，夏天去富良野看薰衣草花海，泡着温泉看漫天飞雪。', bestSeason: '冬/夏', budget: '高', emoji: '❄️', tags: ['自然', '温泉'] },
  { id: 'tr-17', title: '京都', subtitle: '千年古都的四季', description: '穿和服走在花见小路，在岚山竹林里迷路，在伏见稻荷大社的千本的鸟居下合影。', bestSeason: '春/秋', budget: '高', emoji: '⛩️', tags: ['文化', '美食'] },
  { id: 'tr-18', title: '首尔', subtitle: '潮流与传统并存', description: '在北村韩屋村穿韩服拍照，去明洞扫货，晚上在汉江边吃炸鸡喝啤酒。', bestSeason: '春/秋', budget: '中等', emoji: '🇰🇷', tags: ['购物', '美食'] },
  { id: 'tr-19', title: '巴厘岛', subtitle: '神明居住的岛屿', description: '在乌布的梯田里荡秋千，去海神庙看日落，在私人泳池别墅里什么都不做。', bestSeason: '夏/秋', budget: '高', emoji: '🌺', tags: ['海岛', '度假'] },
  { id: 'tr-20', title: '清迈', subtitle: '泰北的小清新', description: '逛周日夜市吃芒果糯米饭，去素贴山看全城夜景，在大象保护营和大象互动。', bestSeason: '冬/春', budget: '低', emoji: '🐘', tags: ['文化', '美食'] },
  { id: 'tr-21', title: '马尔代夫', subtitle: '人间天堂', description: '住水上屋从阳台直接跳进海里，浮潜看海龟和魔鬼鱼，夜晚在沙滩上看银河。', bestSeason: '冬/春', budget: '高', emoji: '🏝️', tags: ['海岛', '度假'] },
  { id: 'tr-22', title: '圣托里尼', subtitle: '蓝白色的童话', description: '在伊亚小镇等全世界最美的日落，沿着蓝顶教堂的阶梯牵手走，吃一顿悬崖边的晚餐。', bestSeason: '夏/秋', budget: '高', emoji: '🇬🇷', tags: ['浪漫', '海岛'] },
  { id: 'tr-23', title: '巴黎', subtitle: '永远的爱情之城', description: '在塞纳河上坐游船看两岸灯火，去蒙马特高地看日落，在铁塔下野餐配红酒和奶酪。', bestSeason: '春/秋', budget: '高', emoji: '🗼', tags: ['浪漫', '文化'] },
  { id: 'tr-24', title: '布拉格', subtitle: '千塔之城的童话', description: '在查理大桥上接吻，去老城广场看天文钟报时，找一家地下酒窖喝一杯捷克啤酒。', bestSeason: '春/秋', budget: '中等', emoji: '🏰', tags: ['浪漫', '历史'] },
  { id: 'tr-25', title: '瑞士', subtitle: '阿尔卑斯山下的人间', description: '坐冰川快车穿越雪山湖泊，在因特拉肯玩滑翔伞，去少女峰上看云海翻涌。', bestSeason: '夏/冬', budget: '高', emoji: '🇨🇭', tags: ['自然', '冒险'] },
  { id: 'tr-26', title: '冰岛', subtitle: '冰与火之歌的真实取景地', description: '泡蓝湖温泉看极光，在黑沙滩上拍照，自驾环岛公路看瀑布和冰川。', bestSeason: '冬/夏', budget: '高', emoji: '🌌', tags: ['自然', '冒险'] },
  { id: 'tr-27', title: '新西兰', subtitle: '中土世界的纯净', description: '在皇后镇蹦极或跳伞，去霍比特村重温电影，在米尔福德峡湾坐游轮看瀑布。', bestSeason: '春/秋', budget: '高', emoji: '🥝', tags: ['自然', '冒险'] },
  { id: 'tr-28', title: '土耳其卡帕多奇亚', subtitle: '热气球下的奇幻地貌', description: '清晨坐热气球看上百个热气球同时升空，住洞穴酒店，在仙人烟囱间骑马。', bestSeason: '春/秋', budget: '中等', emoji: '🎈', tags: ['浪漫', '冒险'] },
  { id: 'tr-29', title: '威尼斯', subtitle: '水上迷宫', description: '坐贡多拉穿梭在窄窄的运河里，在圣马可广场喂鸽子，迷路本身就是风景。', bestSeason: '春/秋', budget: '高', emoji: '🚣', tags: ['浪漫', '历史'] },
  { id: 'tr-30', title: '摩洛哥', subtitle: '北非的彩色梦境', description: '在马拉喀什的集市里讨价还价，去撒哈拉骑骆驼看星空，住进蓝色的舍夫沙万。', bestSeason: '春/秋', budget: '中等', emoji: '🕌', tags: ['文化', '冒险'] },
]

export const SEASONAL_ACTIVITIES = [
  { id: 'sa-1', title: '一起看樱花', description: '找一个周末去公园野餐赏花，带上毯子和零食，拍下最美的合影', emoji: '🌸', month: 3, season: 'spring' },
  { id: 'sa-2', title: '春日骑行', description: '沿着河边或绿道骑双人自行车，享受春风拂面的感觉', emoji: '🚲', month: 4, season: 'spring' },
  { id: 'sa-3', title: '一起做青团', description: '买艾草汁和糯米粉，一起包豆沙馅的青团，做丑了也开心', emoji: '🟢', month: 4, season: 'spring' },
  { id: 'sa-4', title: '520 表白日', description: '写一封手写信给对方，或者准备一个小惊喜，让普通的日子变得特别', emoji: '💕', month: 5, season: 'spring' },
  { id: 'sa-5', title: '夏日夜市', description: '穿上最凉快的衣服，逛夜市从头吃到尾，买一对情侣手链', emoji: '🏮', month: 7, season: 'summer' },
  { id: 'sa-6', title: '一起看日出', description: '找一个高处或海边，凌晨出发等太阳升起，拍一张逆光剪影', emoji: '🌅', month: 7, season: 'summer' },
  { id: 'sa-7', title: '泳池派对', description: '去水上乐园或者游泳池，互相拍照，比赛谁游得快', emoji: '🏊', month: 8, season: 'summer' },
  { id: 'sa-8', title: '七夕节', description: '不管在一起多久，每年七夕都认真过。准备礼物、吃顿好的、拍一张合照', emoji: '🎋', month: 8, season: 'summer' },
  { id: 'sa-9', title: '一起看银杏', description: '秋天去看金黄色的银杏大道，踩落叶，拍一组秋天的照片', emoji: '🍂', month: 11, season: 'autumn' },
  { id: 'sa-10', title: '万圣节变装', description: '各自准备一套搞怪或可爱的装扮，一起出门逛街吓人', emoji: '🎃', month: 10, season: 'autumn' },
  { id: 'sa-11', title: '中秋赏月', description: '买一盒好吃的月饼，找个能看到月亮的地方，一起赏月聊天', emoji: '🌕', month: 9, season: 'autumn' },
  { id: 'sa-12', title: '一起包饺子', description: '冬至那天一起包饺子，比赛谁包得好看，煮一锅热气腾腾的', emoji: '🥟', month: 12, season: 'winter' },
  { id: 'sa-13', title: '圣诞节交换礼物', description: '各自偷偷准备一份礼物，设定预算上限，打开的时候看对方表情', emoji: '🎄', month: 12, season: 'winter' },
  { id: 'sa-14', title: '跨年倒数', description: '一起倒数到零点的瞬间，许愿、拥抱、拍一张跨年的照片', emoji: '🎆', month: 12, season: 'winter' },
  { id: 'sa-15', title: '春节旅行', description: '趁着春节假期去一个没去过的城市，体验当地的年味', emoji: '🧧', month: 1, season: 'winter' },
  { id: 'sa-16', title: '一起做年夜饭', description: '分工合作做一桌年夜饭，不管好不好吃都是一起完成的', emoji: '🍽️', month: 1, season: 'winter' },
  { id: 'sa-17', title: '情人节惊喜', description: '不用很贵重，一封手写的情书、一束花、一顿用心准备的晚餐', emoji: '🌹', month: 2, season: 'winter' },
  { id: 'sa-18', title: '一起看流星雨', description: '查好流星雨时间，带上毯子和热饮，找个光污染少的地方等流星', emoji: '☄️', month: 8, season: 'summer' },
  { id: 'sa-19', title: '一起种一棵树', description: '春天买一棵小树苗一起种下，每年同一天回去看看它长高了多少', emoji: '🌱', month: 3, season: 'spring' },
  { id: 'sa-20', title: '纪念日重温', description: '回到第一次约会/认识的地方，走同样的路线，对比当时和现在的感受', emoji: '📍', month: 6, season: 'summer' },
]

export const WATCH_RECOMMENDATIONS = [
  { id: 'wr-1', title: '爱在黎明破晓前', type: 'movie', description: '两个陌生人在火车上相遇，用一整夜的对话坠入爱河。看完会想和身边的人一直聊天。', emoji: '🎬', year: 1995, rating: 8.8 },
  { id: 'wr-2', title: '爱在日落黄昏时', type: 'movie', description: '九年后他们在巴黎重逢，人生已经不同但心动还在。三部曲里最让人感慨的一部。', emoji: '🎬', year: 2004, rating: 8.9 },
  { id: 'wr-3', title: '爱在午夜降临前', type: 'movie', description: '十八年后的真实婚姻生活，争吵和甜蜜交织。看完会更珍惜眼前人。', emoji: '🎬', year: 2013, rating: 8.8 },
  { id: 'wr-4', title: '爱乐之城', type: 'movie', description: '在洛杉矶追梦的爵士乐手和女演员，爱情和理想不可兼得。音乐和画面美到窒息。', emoji: '🎵', year: 2016, rating: 8.4 },
  { id: 'wr-5', title: '情书', type: 'movie', description: '岩井俊二的经典，一封寄往天国的信牵出一段青涩暗恋。适合下雪天窝在沙发上看。', emoji: '💌', year: 1995, rating: 8.9 },
  { id: 'wr-6', title: '你的名字。', type: 'movie', description: '互换身体的少男少女跨越时空寻找彼此。新海诚的画面每一帧都可以当壁纸。', emoji: '🌠', year: 2016, rating: 8.5 },
  { id: 'wr-7', title: '时空恋旅人', type: 'movie', description: '拥有穿越时间能力的男人，最终明白最珍贵的不是改变过去，而是好好过每一天。', emoji: '⏰', year: 2013, rating: 8.6 },
  { id: 'wr-8', title: '初恋这件小事', type: 'movie', description: '泰国校园纯爱经典，暗恋一个人可以让人变得更好。看完会想起自己青春里的某个人。', emoji: '🎒', year: 2010, rating: 8.3 },
  { id: 'wr-9', title: '怦然心动', type: 'movie', description: '两个小孩视角的初恋故事，纯真又深刻。"斯人若彩虹，遇上方知有。"', emoji: '🌈', year: 2010, rating: 9.0 },
  { id: 'wr-10', title: '请回答1988', type: 'series', description: '首尔双门洞五家人的温暖日常，笑着笑着就哭了。最适合两个人一起追的韩剧。', emoji: '📺', year: 2015, rating: 9.7 },
  { id: 'wr-11', title: '爱的迫降', type: 'series', description: '韩国财阀千金意外降落朝鲜，和军官的跨国恋爱。甜到上头的高颜值剧。', emoji: '📺', year: 2019, rating: 8.0 },
  { id: 'wr-12', title: '鬼怪', type: 'series', description: '千年不死鬼怪与命中注定新娘的奇幻爱情。孔侑和金高银的化学反应太好了。', emoji: '📺', year: 2016, rating: 8.5 },
  { id: 'wr-13', title: '想见你', type: 'series', description: '穿越时空寻找你的悬疑爱情剧，烧脑又催泪。许光汉的少年感太杀了。', emoji: '📺', year: 2019, rating: 9.2 },
  { id: 'wr-14', title: '去有风的地方', type: 'series', description: '刘亦菲和李现的治愈系田园剧，看完想去大理住一阵。节奏慢但很舒服。', emoji: '📺', year: 2023, rating: 8.2 },
  { id: 'wr-15', title: '以家人之名', type: 'series', description: '三个没有血缘的孩子组成一个家的故事，温暖到心坎里。适合周末慢慢看。', emoji: '📺', year: 2020, rating: 7.8 },
  { id: 'wr-16', title: '花样年华', type: 'movie', description: '王家卫的极致美学，两个已婚人的暧昧与克制。每一帧都是一幅油画。', emoji: '🎬', year: 2000, rating: 8.7 },
  { id: 'wr-17', title: '重庆森林', type: 'movie', description: '失恋的警察和便利店女孩的故事，金城武吃过期凤梨罐头的经典桥段。', emoji: '🎬', year: 1994, rating: 8.8 },
  { id: 'wr-18', title: ' Begin Again', type: 'movie', description: '失意的音乐制作人和街头歌手在纽约用音乐治愈彼此。原声带好听到循环。', emoji: '🎵', year: 2013, rating: 8.5 },
  { id: 'wr-19', title: '心灵奇旅', type: 'movie', description: '皮克斯探讨人生意义的动画，活着本身就是最大的火花。看完会想好好生活。', emoji: '🎬', year: 2020, rating: 8.8 },
  { id: 'wr-20', title: '夏日大作战', type: 'movie', description: '细田守的夏日动画，大家庭的热血与温情。适合夏天吃着西瓜一起看。', emoji: '🎬', year: 2009, rating: 8.6 },
  { id: 'wr-21', title: '心动的信号', type: 'variety', description: '素人恋爱观察综艺，看别人暧昧上头比自己谈恋爱还刺激。适合一起嗑CP。', emoji: '📺', year: 2018, rating: 7.5 },
  { id: 'wr-22', title: '幸福三重奏', type: 'variety', description: '明星夫妻的日常生活真人秀，看别人的相处模式也能学到东西。', emoji: '📺', year: 2018, rating: 7.0 },
  { id: 'wr-23', title: '慢游全世界', type: 'variety', description: '明星情侣/好友的慢旅行综艺，看完会种草很多目的地。', emoji: '📺', year: 2023, rating: 7.5 },
  { id: 'wr-24', title: '告白气球', type: 'music', description: '周杰伦的甜歌天花板，MV 在巴黎拍的，适合表白的时候放给对方听。', emoji: '🎵', year: 2016, rating: 9.0 },
  { id: 'wr-25', title: '最重要的决定', type: 'music', description: '范玮琪的经典情歌，歌词写的是认定一个人的决心。婚礼常用曲目。', emoji: '🎵', year: 2011, rating: 8.5 },
]

/**
 * Get today's recommendation by type, cycling through the list by date.
 * @param {'travel'|'seasonal'|'watch'} type
 * @param {number} offset - optional offset for variety (e.g., 0 for first card, 1 for second)
 * @returns {object} recommendation item
 */
export function getTodayRecommendation(type, offset = 0) {
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)

  if (type === 'travel') {
    return TRAVEL_RECOMMENDATIONS[(dayOfYear + offset) % TRAVEL_RECOMMENDATIONS.length]
  }
  if (type === 'seasonal') {
    const currentMonth = today.getMonth() + 1
    // Prefer activities matching current month/season, fallback to any
    const seasonal = SEASONAL_ACTIVITIES.filter(a =>
      a.month === currentMonth || a.month === ((currentMonth % 12) + 1)
    )
    const pool = seasonal.length > 0 ? seasonal : SEASONAL_ACTIVITIES
    return pool[(dayOfYear + offset) % pool.length]
  }
  if (type === 'watch') {
    return WATCH_RECOMMENDATIONS[(dayOfYear + offset) % WATCH_RECOMMENDATIONS.length]
  }
  return null
}
