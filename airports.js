// airports.js
// 機場 IATA 代碼資料 + 中英文/代碼 對照查詢
// 結構: { iata, city(中文), cityEn(英文), name(機場名), country }
// 可自由擴充。autocomplete 與 toIata() 會比對 city / cityEn / iata / name。

const AIRPORTS = [
  // ── 台灣 ──
  { iata: "TPE", city: "台北", cityEn: "Taipei", name: "桃園國際機場", country: "台灣" },
  { iata: "TSA", city: "台北松山", cityEn: "Taipei Songshan", name: "松山機場", country: "台灣" },
  { iata: "KHH", city: "高雄", cityEn: "Kaohsiung", name: "高雄國際機場", country: "台灣" },
  { iata: "RMQ", city: "台中", cityEn: "Taichung", name: "台中清泉崗機場", country: "台灣" },
  { iata: "TNN", city: "台南", cityEn: "Tainan", name: "台南機場", country: "台灣" },
  { iata: "HUN", city: "花蓮", cityEn: "Hualien", name: "花蓮機場", country: "台灣" },
  { iata: "KNH", city: "金門", cityEn: "Kinmen", name: "金門機場", country: "台灣" },

  // ── 日本 ──
  { iata: "NRT", city: "東京成田", cityEn: "Tokyo Narita", name: "成田國際機場", country: "日本" },
  { iata: "HND", city: "東京羽田", cityEn: "Tokyo Haneda", name: "羽田機場", country: "日本" },
  { iata: "KIX", city: "大阪", cityEn: "Osaka", name: "關西國際機場", country: "日本" },
  { iata: "ITM", city: "大阪伊丹", cityEn: "Osaka Itami", name: "伊丹機場", country: "日本" },
  { iata: "NGO", city: "名古屋", cityEn: "Nagoya", name: "中部國際機場", country: "日本" },
  { iata: "FUK", city: "福岡", cityEn: "Fukuoka", name: "福岡機場", country: "日本" },
  { iata: "CTS", city: "札幌", cityEn: "Sapporo", name: "新千歲機場", country: "日本" },
  { iata: "OKA", city: "沖繩", cityEn: "Okinawa", name: "那霸機場", country: "日本" },
  { iata: "KOJ", city: "鹿兒島", cityEn: "Kagoshima", name: "鹿兒島機場", country: "日本" },
  { iata: "HIJ", city: "廣島", cityEn: "Hiroshima", name: "廣島機場", country: "日本" },
  { iata: "SDJ", city: "仙台", cityEn: "Sendai", name: "仙台機場", country: "日本" },
  { iata: "KMJ", city: "熊本", cityEn: "Kumamoto", name: "熊本機場", country: "日本" },

  // ── 韓國 ──
  { iata: "ICN", city: "首爾", cityEn: "Seoul", name: "仁川國際機場", country: "韓國" },
  { iata: "GMP", city: "首爾金浦", cityEn: "Seoul Gimpo", name: "金浦機場", country: "韓國" },
  { iata: "PUS", city: "釜山", cityEn: "Busan", name: "金海國際機場", country: "韓國" },
  { iata: "CJU", city: "濟州", cityEn: "Jeju", name: "濟州國際機場", country: "韓國" },

  // ── 中國 ──
  { iata: "PVG", city: "上海浦東", cityEn: "Shanghai Pudong", name: "浦東國際機場", country: "中國" },
  { iata: "SHA", city: "上海虹橋", cityEn: "Shanghai Hongqiao", name: "虹橋機場", country: "中國" },
  { iata: "PEK", city: "北京", cityEn: "Beijing", name: "首都國際機場", country: "中國" },
  { iata: "PKX", city: "北京大興", cityEn: "Beijing Daxing", name: "大興國際機場", country: "中國" },
  { iata: "CAN", city: "廣州", cityEn: "Guangzhou", name: "白雲國際機場", country: "中國" },
  { iata: "SZX", city: "深圳", cityEn: "Shenzhen", name: "寶安國際機場", country: "中國" },
  { iata: "CTU", city: "成都", cityEn: "Chengdu", name: "天府國際機場", country: "中國" },
  { iata: "XMN", city: "廈門", cityEn: "Xiamen", name: "高崎國際機場", country: "中國" },
  { iata: "HGH", city: "杭州", cityEn: "Hangzhou", name: "蕭山國際機場", country: "中國" },
  { iata: "HKG", city: "香港", cityEn: "Hong Kong", name: "香港國際機場", country: "香港" },
  { iata: "MFM", city: "澳門", cityEn: "Macau", name: "澳門國際機場", country: "澳門" },

  // ── 東南亞 ──
  { iata: "SIN", city: "新加坡", cityEn: "Singapore", name: "樟宜機場", country: "新加坡" },
  { iata: "BKK", city: "曼谷", cityEn: "Bangkok", name: "蘇凡納布機場", country: "泰國" },
  { iata: "DMK", city: "曼谷廊曼", cityEn: "Bangkok Don Mueang", name: "廊曼機場", country: "泰國" },
  { iata: "HKT", city: "普吉島", cityEn: "Phuket", name: "普吉國際機場", country: "泰國" },
  { iata: "CNX", city: "清邁", cityEn: "Chiang Mai", name: "清邁國際機場", country: "泰國" },
  { iata: "KUL", city: "吉隆坡", cityEn: "Kuala Lumpur", name: "吉隆坡國際機場", country: "馬來西亞" },
  { iata: "CGK", city: "雅加達", cityEn: "Jakarta", name: "蘇卡諾哈達機場", country: "印尼" },
  { iata: "DPS", city: "峇里島", cityEn: "Bali", name: "伍拉萊國際機場", country: "印尼" },
  { iata: "MNL", city: "馬尼拉", cityEn: "Manila", name: "尼諾伊艾奎諾機場", country: "菲律賓" },
  { iata: "CEB", city: "宿霧", cityEn: "Cebu", name: "麥克坦宿霧機場", country: "菲律賓" },
  { iata: "SGN", city: "胡志明市", cityEn: "Ho Chi Minh City", name: "新山一國際機場", country: "越南" },
  { iata: "HAN", city: "河內", cityEn: "Hanoi", name: "內牌國際機場", country: "越南" },
  { iata: "DAD", city: "峴港", cityEn: "Da Nang", name: "峴港國際機場", country: "越南" },
  { iata: "PNH", city: "金邊", cityEn: "Phnom Penh", name: "金邊國際機場", country: "柬埔寨" },
  { iata: "RGN", city: "仰光", cityEn: "Yangon", name: "仰光國際機場", country: "緬甸" },

  // ── 南亞 / 中東 ──
  { iata: "DEL", city: "新德里", cityEn: "Delhi", name: "英迪拉甘地機場", country: "印度" },
  { iata: "BOM", city: "孟買", cityEn: "Mumbai", name: "賈特拉帕蒂機場", country: "印度" },
  { iata: "DXB", city: "杜拜", cityEn: "Dubai", name: "杜拜國際機場", country: "阿聯酋" },
  { iata: "DOH", city: "杜哈", cityEn: "Doha", name: "哈馬德國際機場", country: "卡達" },
  { iata: "IST", city: "伊斯坦堡", cityEn: "Istanbul", name: "伊斯坦堡機場", country: "土耳其" },

  // ── 非洲 ──
  { iata: "ZNZ", city: "尚吉巴", cityEn: "Zanzibar", name: "阿貝德·阿瑪尼·卡魯姆國際機場（香料之島）", country: "坦尚尼亞" },
  { iata: "ARK", city: "阿魯沙", cityEn: "Arusha", name: "阿魯沙機場", country: "坦尚尼亞" },
  { iata: "JRO", city: "吉力馬札羅", cityEn: "Kilimanjaro", name: "吉力馬札羅國際機場", country: "坦尚尼亞" },
  { iata: "DAR", city: "三蘭港", cityEn: "Dar es Salaam", name: "朱利葉斯·尼雷爾國際機場", country: "坦尚尼亞" },

  // ── 大洋洲 ──
  { iata: "SYD", city: "雪梨", cityEn: "Sydney", name: "京斯福史密斯機場", country: "澳洲" },
  { iata: "MEL", city: "墨爾本", cityEn: "Melbourne", name: "墨爾本機場", country: "澳洲" },
  { iata: "BNE", city: "布里斯本", cityEn: "Brisbane", name: "布里斯本機場", country: "澳洲" },
  { iata: "PER", city: "伯斯", cityEn: "Perth", name: "伯斯機場", country: "澳洲" },
  { iata: "AKL", city: "奧克蘭", cityEn: "Auckland", name: "奧克蘭機場", country: "紐西蘭" },
  { iata: "GUM", city: "關島", cityEn: "Guam", name: "關島國際機場", country: "關島" },

  // ── 美洲 ──
  { iata: "LAX", city: "洛杉磯", cityEn: "Los Angeles", name: "洛杉磯國際機場", country: "美國" },
  { iata: "SFO", city: "舊金山", cityEn: "San Francisco", name: "舊金山國際機場", country: "美國" },
  { iata: "JFK", city: "紐約甘迺迪", cityEn: "New York JFK", name: "甘迺迪國際機場", country: "美國" },
  { iata: "EWR", city: "紐約紐瓦克", cityEn: "New York Newark", name: "紐瓦克機場", country: "美國" },
  { iata: "SEA", city: "西雅圖", cityEn: "Seattle", name: "西雅圖機場", country: "美國" },
  { iata: "ORD", city: "芝加哥", cityEn: "Chicago", name: "歐海爾國際機場", country: "美國" },
  { iata: "HNL", city: "檀香山", cityEn: "Honolulu", name: "檀香山機場", country: "美國" },
  { iata: "YVR", city: "溫哥華", cityEn: "Vancouver", name: "溫哥華國際機場", country: "加拿大" },
  { iata: "YYZ", city: "多倫多", cityEn: "Toronto", name: "皮爾遜國際機場", country: "加拿大" },

  // ── 歐洲 ──
  { iata: "LHR", city: "倫敦", cityEn: "London", name: "希斯洛機場", country: "英國" },
  { iata: "CDG", city: "巴黎", cityEn: "Paris", name: "戴高樂機場", country: "法國" },
  { iata: "FRA", city: "法蘭克福", cityEn: "Frankfurt", name: "法蘭克福機場", country: "德國" },
  { iata: "MUC", city: "慕尼黑", cityEn: "Munich", name: "慕尼黑機場", country: "德國" },
  { iata: "AMS", city: "阿姆斯特丹", cityEn: "Amsterdam", name: "史基浦機場", country: "荷蘭" },
  { iata: "FCO", city: "羅馬", cityEn: "Rome", name: "達文西機場", country: "義大利" },
  { iata: "MAD", city: "馬德里", cityEn: "Madrid", name: "巴拉哈斯機場", country: "西班牙" },
  { iata: "BCN", city: "巴塞隆納", cityEn: "Barcelona", name: "巴塞隆納機場", country: "西班牙" },
  { iata: "ZRH", city: "蘇黎世", cityEn: "Zurich", name: "蘇黎世機場", country: "瑞士" },
  { iata: "VIE", city: "維也納", cityEn: "Vienna", name: "維也納機場", country: "奧地利" },
];

// 將使用者輸入（中文城市/英文/IATA/機場名）轉成 IATA 代碼。
// 找不到回傳 null。
function toIata(input) {
  if (!input) return null;
  const q = String(input).trim().toLowerCase();
  if (!q) return null;

  // 1) 直接是 3 碼 IATA
  const byIata = AIRPORTS.find((a) => a.iata.toLowerCase() === q);
  if (byIata) return byIata.iata;

  // 2) 完全比對 中文城市 / 英文城市
  const exact = AIRPORTS.find(
    (a) => a.city.toLowerCase() === q || a.cityEn.toLowerCase() === q
  );
  if (exact) return exact.iata;

  // 3) 部分比對（城市/英文/機場名包含輸入字串）
  const partial = AIRPORTS.find(
    (a) =>
      a.city.toLowerCase().includes(q) ||
      a.cityEn.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  );
  if (partial) return partial.iata;

  // 4) 若使用者本來就打了看似 3 碼英文代碼，直接放行（讓平台自己判斷）
  if (/^[a-z]{3}$/.test(q)) return q.toUpperCase();

  return null;
}

// 給 autocomplete 用：回傳符合的機場清單（最多 limit 筆）
function searchAirports(input, limit = 8) {
  const q = String(input || "").trim().toLowerCase();
  if (!q) return [];
  return AIRPORTS.filter(
    (a) =>
      a.iata.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.cityEn.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  ).slice(0, limit);
}
