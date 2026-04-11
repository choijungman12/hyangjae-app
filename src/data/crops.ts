export interface CropData {
  id: string;
  name: string;
  /** 공통 정식월 (하위호환 - UI에서는 plantingSmartFarm/OpenField 우선 사용) */
  planting: number[];
  harvesting: number[];
  color: string;
  emoji: string;
  gradient: string;
  image: string;
  /** 스마트팜(시설재배) 정식 적기 월 (0=1월) */
  plantingSmartFarm: number[];
  /** 노지재배 정식 적기 월 */
  plantingOpenField: number[];
  /** 스마트팜 수확 월 */
  harvestingSmartFarm: number[];
  /** 노지재배 수확 월 */
  harvestingOpenField: number[];
  tasks: {
    planting: string;
    growing: string;
    harvesting: string;
  };
  /** 생육 관리 상세 포인트 (bullet list) */
  growingPoints: string[];
  /** 환경 관리 기준 */
  envGuide: {
    temp: string;
    humidity: string;
    light: string;
    ec: string;
    ph: string;
    water: string;
  };
}

export const CROPS: CropData[] = [
  {
    id: 'wasabi',
    name: '고추냉이',
    planting: [2, 3, 8, 9],
    harvesting: [8, 9, 10, 11, 0, 1],
    color: 'emerald',
    emoji: '🌿',
    gradient: 'from-emerald-400 to-teal-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 7, 8, 9, 10, 11],   // 연중 가능, 봄·가을 최적
    plantingOpenField: [2, 3, 8, 9],                       // 3~4월, 9~10월
    harvestingSmartFarm: [0, 1, 2, 7, 8, 9, 10, 11],
    harvestingOpenField: [8, 9, 10, 11],
    tasks: {
      planting: '종묘 정식 후 차광막(50~60%) 설치, 온도 15~18°C 세팅, 관수 시작',
      growing: 'EC·pH 일 1회 측정, 습도 70~80% 유지, 무름병·진딧물 예방 점검',
      harvesting: '근경 직경 3~4cm · 무게 80~120g 도달 시 수확, 저온(5°C) 저장'
    },
    growingPoints: [
      '온도: 주간 15~18°C · 야간 12~15°C 유지 — 20°C 초과 시 생육 저하',
      'EC 농도: 초기 1.0~1.2 → 중기 1.2~1.5 mS/cm 단계적 상승',
      'pH: 6.0~6.5 유지 — 매일 체크, 5.5 이하 시 생육 불량',
      '차광: 50~60% 차광막 필수 — 직사광선 노출 시 잎 황화',
      '관수: 토양 항상 촉촉하게 — 과습 시 무름병 발생 주의',
      '무름병 예방: 통풍 개선, 습도 80% 초과 방지, 이병주 즉시 제거',
      '진딧물·응애 예방: 황색 끈끈이 트랩 + 천적 활용',
      '근경 비대 확인: 월 1회 시료주 채취하여 크기 측정',
    ],
    envGuide: {
      temp: '15~18°C (최적), 20°C 이상 금지',
      humidity: '70~80%',
      light: '50~60% 차광 (반음지)',
      ec: '1.0~1.5 mS/cm',
      ph: '6.0~6.5',
      water: '연중 충분한 수분 공급, 배수 양호',
    }
  },
  {
    id: 'strawberry',
    name: '딸기',
    planting: [8, 9],
    harvesting: [1, 2, 3, 4],
    color: 'red',
    emoji: '🍓',
    gradient: 'from-red-400 to-pink-500',
    image: '',
    plantingSmartFarm: [7, 8, 9, 10],   // 8~10월 정식, 시설은 조금 이르게 가능
    plantingOpenField: [8, 9],            // 9~10월
    harvestingSmartFarm: [0, 1, 2, 3, 4],
    harvestingOpenField: [4, 5],
    tasks: {
      planting: '런너 묘 또는 포트 묘 정식, 화아분화 유도 후 정식 권장',
      growing: '온도·습도 관리, 수정벌 투입(개화기), 적화·적과 작업 꾸준히',
      harvesting: '80~90% 착색 시 수확 — 온도 낮은 아침 수확, 선별 포장'
    },
    growingPoints: [
      '정식 전 화아분화 확인: 야간 13°C 이하 2주 이상 처리 필요',
      '온도: 주간 20~25°C · 야간 10~15°C — 고온 시 기형과 발생',
      '수정벌: 개화 시작 직후 벌통 투입, 2~3주마다 교체',
      '적화·적과: 기형화 제거, 한 화방 당 7~8과 착과 유도',
      '잿빛곰팡이병: 과습·밀식 방지, 예방 살균제 7~10일 간격 살포',
      '런너 제거: 에너지 분산 방지 — 발생 즉시 제거',
      '야간 보온: 저온기 커튼 내려 야간 10°C 이상 유지',
      'EC 관리: 착과기 0.6~0.8 mS/cm 유지 — 과도한 농도 과실 품질 저하',
    ],
    envGuide: {
      temp: '20~25°C (주간), 10~15°C (야간)',
      humidity: '60~70%',
      light: '풀 광 (70~90% 투광)',
      ec: '0.6~0.8 mS/cm (착과기)',
      ph: '5.5~6.5',
      water: '착과 시작 후 충분한 수분 공급',
    }
  },
  {
    id: 'basil',
    name: '바질',
    planting: [3, 4, 5],
    harvesting: [6, 7, 8, 9],
    color: 'green',
    emoji: '🌱',
    gradient: 'from-green-400 to-emerald-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 스마트팜 연중 재배
    plantingOpenField: [3, 4, 5],                                   // 4~6월
    harvestingSmartFarm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    harvestingOpenField: [6, 7, 8, 9],
    tasks: {
      planting: '씨앗 파종(25~30°C 발아) 또는 삽목 이식, 32셀 트레이 육묘 3~4주',
      growing: '꽃대 제거로 잎 품질 유지, 순따기 촉진, EC·온도 일관 관리',
      harvesting: '상단 잎 4매 이상 전개 시 2~3절 수확 — 줄기 1/3 이상 남기기'
    },
    growingPoints: [
      '온도: 22~28°C 유지 — 15°C 이하 시 생육 정지, 동해 주의',
      '꽃대 제거: 발견 즉시 제거 — 꽃 피면 잎이 질기고 향 감소',
      '순따기: 주기적으로 끝눈 제거 → 곁가지 발달 촉진',
      '광 요구량: 일조 6~8시간 이상 — 부족 시 도장 현상',
      'EC: 1.2~1.8 mS/cm — 잎 수확 후 질소 위주 보충',
      '진딧물 주의: 신엽 발생 부위 집중 관찰, 초기 방제',
      '잎 세척: 출하 전 깨끗이 세척, 상온 유통 금지',
      '수확 주기: 스마트팜 연중 7~10일 간격 반복 수확 가능',
    ],
    envGuide: {
      temp: '22~28°C',
      humidity: '60~70%',
      light: '6~8시간 이상 (1만~2만 lux)',
      ec: '1.2~1.8 mS/cm',
      ph: '6.0~7.0',
      water: '건조 시 즉시 관수, 과습 주의',
    }
  },
  {
    id: 'lettuce',
    name: '상추',
    planting: [2, 3, 9, 10],
    harvesting: [4, 5, 6, 11, 0, 1],
    color: 'lime',
    emoji: '🥬',
    gradient: 'from-lime-400 to-green-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], // 연중 재배
    plantingOpenField: [2, 3, 9, 10],                              // 3~4월, 10~11월
    harvestingSmartFarm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    harvestingOpenField: [4, 5, 11, 0, 1],
    tasks: {
      planting: '파종 후 20~25일 육묘, 본엽 3~4매 시 정식 — 株間 20~25cm',
      growing: 'EC 1.0~1.5, 16~18시간 보광, 볼트(추대) 방지 위해 고온 차단',
      harvesting: '정식 후 30~40일, 50~60g 이상 시 뿌리 포함 수확'
    },
    growingPoints: [
      '온도: 15~20°C (생육 최적) — 25°C 이상 추대 발생 주의',
      '보광: LED 16~18시간/일 — 일장 관리로 연중 추대 억제',
      '수경재배 EC: 1.0~1.5 mS/cm — 고온기에는 낮게 유지',
      '팁 번(Tip burn) 예방: 칼슘 충분 공급, 바람 순환 확보',
      '수확 회전: 정식 후 30~40일 수확 → 스마트팜 연 8~10회 회전 가능',
      '품종 선택: 여름철 내고온성 품종, 겨울철 내한성 품종 구분',
      '병해: 균핵병·잿빛곰팡이 — 과습 방지, 하우스 환기 중요',
      '노지 고온기(6~8월): 차광 50% 적용 — 추대 방지',
    ],
    envGuide: {
      temp: '15~20°C',
      humidity: '65~75%',
      light: '16~18시간/일 (보광 포함)',
      ec: '1.0~1.5 mS/cm',
      ph: '5.8~6.5',
      water: '균일한 수분 공급, 배수 원활',
    }
  },
  {
    id: 'tomato',
    name: '토마토',
    planting: [1, 2, 7, 8],
    harvesting: [5, 6, 7, 11, 0],
    color: 'orange',
    emoji: '🍅',
    gradient: 'from-orange-400 to-red-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 7, 8, 9, 10, 11],   // 연중 2작기
    plantingOpenField: [1, 2, 7, 8],                    // 2~3월, 8~9월
    harvestingSmartFarm: [4, 5, 6, 0, 1, 2],
    harvestingOpenField: [5, 6, 7, 11, 0],
    tasks: {
      planting: '육묘(파종~정식 8~9주), 지지대 설치, 온도 20~25°C 세팅',
      growing: '곁순 주 1회 제거, 화방당 착과수 조절, EC 2.0~2.5 관리',
      harvesting: '착색률 80% 이상 시 수확 — 서늘한 아침 시간 수확 권장'
    },
    growingPoints: [
      '온도: 주간 22~26°C · 야간 16~18°C — 35°C 이상 낙화 발생',
      '곁순 제거: 매주 1회 전 곁순 제거 — 노동력이 높으나 품질에 직결',
      '적과: 화방당 3~4과 착과 유도 (일반 토마토 기준)',
      '착과 촉진: 개화기 손 진동 수정 또는 진동기 사용',
      '석회 결핍(배꼽 썩음병): 칼슘 엽면 시비, 균일한 관수',
      'EC 2.0~2.5 유지: 착과 이후 증가 → 가용 당도 향상',
      '병해: 역병(저온다습), 잎곰팡이병(고온다습) — 환기 최우선',
      '노지 이중 비닐 활용: 3~4월 보온 터널로 조기 정식 가능',
    ],
    envGuide: {
      temp: '22~26°C (주간), 16~18°C (야간)',
      humidity: '60~70%',
      light: '풀광 (최소 8시간)',
      ec: '2.0~2.5 mS/cm',
      ph: '5.5~6.5',
      water: '건조-습윤 주기, 균일한 관수',
    }
  },
  {
    id: 'pepper',
    name: '파프리카',
    planting: [1, 2, 3],
    harvesting: [6, 7, 8, 9, 10],
    color: 'orange',
    emoji: '🫑',
    gradient: 'from-yellow-400 to-orange-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 9, 10, 11],
    plantingOpenField: [2, 3],
    harvestingSmartFarm: [5, 6, 7, 8, 9, 10, 11],
    harvestingOpenField: [7, 8, 9, 10],
    tasks: {
      planting: '육묘 9~10주, 2줄기 정지재배, 지지대 설치, 온도 22~28°C',
      growing: '2줄기 유인 관리, 착과수 조절, EC 2.0~2.5, 통풍 확보',
      harvesting: '완전 착색 후 수확 — 미숙 수확 금지, 성숙도별 단계 수확'
    },
    growingPoints: [
      '2줄기 정지: 1차 분지 이후 2줄기만 남기고 제거',
      '착과 조절: 4~5과 이상 착과 시 적과 — 과부하로 기형과 방지',
      '온도: 주간 22~28°C · 야간 18~20°C — 고온(35°C↑) 낙화 주의',
      '광량: 풀광 필수 — 흐린 날 보광 LED 추가',
      '탄저병 예방: 과실에 직접 물 닿지 않게, 환기 강화',
      '노지: 비가림 시설 필수 — 우기 탄저병 방제',
      '착색 관리: 빨간색 완전 착색까지 60~70일, 착색 불균일 시 온도 확인',
      'EC 과다 시 과실 소형화 — 착과 초기 2.0 → 착색기 2.5 단계 상승',
    ],
    envGuide: {
      temp: '22~28°C (주간), 18~20°C (야간)',
      humidity: '60~70%',
      light: '풀광 (최소 8~10시간)',
      ec: '2.0~2.5 mS/cm',
      ph: '5.5~6.5',
      water: '규칙적, 건조 없이 균일 관수',
    }
  },
  {
    id: 'cucumber',
    name: '오이',
    planting: [2, 3, 7, 8],
    harvesting: [5, 6, 7, 10, 11],
    color: 'teal',
    emoji: '🥒',
    gradient: 'from-teal-400 to-cyan-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 7, 8, 9, 10, 11],
    plantingOpenField: [3, 4, 7, 8],
    harvestingSmartFarm: [3, 4, 5, 6, 10, 11, 0, 1],
    harvestingOpenField: [6, 7, 8, 9, 10],
    tasks: {
      planting: '파종 후 25~30일 육묘, 유인줄·지지대 설치, 온도 22~28°C',
      growing: '주기적 유인 작업, 측지 정리, 노화 잎 제거, EC 1.8~2.2',
      harvesting: '개화 후 7~10일, 길이 20~25cm 시 수확 — 매일 점검 필요'
    },
    growingPoints: [
      '유인 관리: 매주 1~2회 끝손 연결 — 덩굴 꼬임 방지',
      '측지 정리: 하단 5~6절 이하 측지 제거, 상위 측지는 1~2잎 후 적심',
      '수확 빈도: 개화 후 7~10일 — 과비대 방지 위해 매일 수확 점검',
      '온도: 22~28°C 유지 — 저온(15°C 이하) 시 기형과 발생',
      '노화 잎 제거: 하위 노화 잎 주기적 제거 → 통풍·광 확보',
      'EC 1.8~2.2: 노지보다 낮게 유지 → 생육 빠르게 관리',
      '균핵병·흰가루병: 저온다습 환경 방지, 보온·환기 동시 관리',
      '노지 6~8월 고온기: 차광 30% 적용, 충분한 관수',
    ],
    envGuide: {
      temp: '22~28°C',
      humidity: '65~75%',
      light: '보광 포함 8~10시간',
      ec: '1.8~2.2 mS/cm',
      ph: '5.8~6.5',
      water: '과건조 금지, 균일 관수',
    }
  },
  {
    id: 'perilla',
    name: '깻잎',
    planting: [3, 4, 5],
    harvesting: [6, 7, 8, 9, 10],
    color: 'purple',
    emoji: '🍃',
    gradient: 'from-purple-400 to-indigo-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    plantingOpenField: [3, 4, 5],
    harvestingSmartFarm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    harvestingOpenField: [6, 7, 8, 9, 10],
    tasks: {
      planting: '씨앗 파종 또는 삽목, 온도 20~25°C, 보광 14~16시간 설정',
      growing: '적심으로 곁가지 유도, 꽃대 발견 즉시 제거, EC 1.5~2.0',
      harvesting: '2절씩 위에서 수확 — 포기 당 7~8절 이상 남기기'
    },
    growingPoints: [
      '일장 관리: 단일(12시간 이하) 시 꽃눈 형성 → 보광 14~16시간 유지',
      '꽃대 제거: 발견 즉시 제거 — 꽃이 피면 잎 품질 급격 저하',
      '적심: 3~4절 형성 시 끝눈 제거 → 수확 면적 확대',
      '온도: 20~30°C 생육 — 15°C 이하 생육 정지',
      '노지 여름(6~8월): 차광 30~50% + 충분한 관수',
      'EC 1.5~2.0: 잎 수확 주기(7~10일)에 맞춰 질소 보충',
      '병해: 점무늬병(고온다습), 노균병(저온다습) — 환경 관리',
      '수확 회전: 스마트팜 연간 10~12회 수확 가능',
    ],
    envGuide: {
      temp: '20~30°C',
      humidity: '60~75%',
      light: '보광 14~16시간/일',
      ec: '1.5~2.0 mS/cm',
      ph: '6.0~6.8',
      water: '충분한 수분, 과습 방지',
    }
  },
  {
    id: 'spinach',
    name: '시금치',
    planting: [2, 3, 9, 10],
    harvesting: [4, 5, 11, 0, 1],
    color: 'green',
    emoji: '🥬',
    gradient: 'from-green-500 to-emerald-600',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 4, 9, 10, 11],
    plantingOpenField: [2, 3, 9, 10],
    harvestingSmartFarm: [1, 2, 3, 4, 5, 10, 11, 0],
    harvestingOpenField: [4, 5, 11, 0, 1],
    tasks: {
      planting: '직파 또는 육묘 정식(25~30일), 간격 10~15cm, 온도 15~20°C',
      growing: 'EC 1.0~1.5, 야간 10°C 이상 유지, 추대 방지 위해 고온 차단',
      harvesting: '파종 후 30~45일, 잎 길이 15~20cm 도달 시 통째 수확'
    },
    growingPoints: [
      '온도: 15~20°C (최적) — 25°C 이상 추대 발생, 0°C 이상 내한성 강함',
      '단일 장일 반응: 장일(봄~여름)에 추대 — 단일 차광막으로 방지 가능',
      '직파 파종: 조생종 가능, 간격 10~15cm, 표면 가볍게 진압',
      'EC 낮게 유지(1.0~1.5): 고EC 시 잎이 두껍고 쓴맛 발생',
      '겨울철 터널 재배: 보온 비닐 터널로 최저 0°C 이상 유지',
      '노지 봄 조기 재배: 이중 비닐 + 보온재로 2월 파종 가능',
      '연작 장해: 3년 이상 연작 금지 — 시금치 위황병 발생',
      '수확: 아침 이슬 마른 후 수확 — 세척 후 냉장 보관',
    ],
    envGuide: {
      temp: '15~20°C',
      humidity: '60~70%',
      light: '단일 조건 유지 (12시간 이하)',
      ec: '1.0~1.5 mS/cm',
      ph: '6.0~7.0',
      water: '토양 건조 방지, 균일 관수',
    }
  },
  {
    id: 'kale',
    name: '케일',
    planting: [2, 3, 8, 9],
    harvesting: [4, 5, 6, 10, 11, 0],
    color: 'green',
    emoji: '🥦',
    gradient: 'from-emerald-500 to-green-600',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 7, 8, 9, 10, 11],
    plantingOpenField: [2, 3, 8, 9],
    harvestingSmartFarm: [2, 3, 4, 5, 9, 10, 11, 0, 1],
    harvestingOpenField: [4, 5, 6, 10, 11, 0],
    tasks: {
      planting: '파종 후 30~35일 육묘, 간격 40~50cm 정식, 온도 15~20°C',
      growing: '외엽 주기 제거, EC 1.5~2.0, 병해충(배추흰나비) 예방',
      harvesting: '외엽부터 수확 — 심지(속잎) 남기면 계속 생산 가능'
    },
    growingPoints: [
      '온도: 15~20°C (최적) — 서늘한 환경에서 향·영양소 증가',
      '서리 내성: 경미한 서리(−3°C)에서도 생존, 서리 후 단맛 증가',
      '외엽 수확: 아랫잎부터 수확 → 포기 지속 생산(8~12개월)',
      '노지 겨울 재배: 강한 내한성으로 비가림 하우스에서 월동 가능',
      '배추흰나비 방제: 방충망 설치 또는 BT제 살포',
      'EC 1.5~2.0: 과다 질소 시 잎이 연약해져 병해 취약',
      '수경재배: 깊은 수경베드(DFT·NFT) 적합 — 수확량 3배 이상',
      '스마트팜 연중 재배: 연 6~8회 수확 가능',
    ],
    envGuide: {
      temp: '15~20°C',
      humidity: '60~75%',
      light: '6~8시간 이상',
      ec: '1.5~2.0 mS/cm',
      ph: '6.0~7.0',
      water: '균일 관수, 과습 방지',
    }
  },
  {
    id: 'mint',
    name: '민트',
    planting: [3, 4, 5],
    harvesting: [6, 7, 8, 9],
    color: 'teal',
    emoji: '🌿',
    gradient: 'from-cyan-400 to-teal-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    plantingOpenField: [3, 4, 5],
    harvestingSmartFarm: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    harvestingOpenField: [6, 7, 8, 9],
    tasks: {
      planting: '삽목(5~10cm 줄기) 또는 포기나누기, 온도 18~24°C, 충분한 관수',
      growing: '적심으로 분지 촉진, 꽃대 발생 전 수확, 수분 충분히',
      harvesting: '꽃봉오리 형성 전 수확 — 향 성분 최고조, 이른 아침 수확 권장'
    },
    growingPoints: [
      '번식: 삽목 발근율 90% 이상 — 봄·가을 삽목 최적',
      '온도: 18~24°C 최적, −10°C에서도 뿌리 생존 (내한성 강함)',
      '적심: 5~6절 형성 시 끝눈 제거 → 풍성한 수형 만들기',
      '꽃대 제거: 꽃이 피면 잎의 에센셜 오일 함량 급감',
      '수분 요구량 높음: 건조 시 잎이 굳어지고 향 감소',
      '노지 여름: 반그늘(차광 30%) + 충분한 관수 → 품질 유지',
      '연작 시 노균병: 2~3년 주기로 포기나누기 및 갱신',
      '스마트팜: 연중 8~12회 수확 가능, 회전율 우수',
    ],
    envGuide: {
      temp: '18~24°C',
      humidity: '65~80%',
      light: '6시간 이상 (반음지 가능)',
      ec: '1.2~1.8 mS/cm',
      ph: '6.0~7.0',
      water: '충분한 수분 필수, 건조 금지',
    }
  },
  {
    id: 'cherry-tomato',
    name: '방울토마토',
    planting: [1, 2, 7, 8],
    harvesting: [5, 6, 7, 10, 11],
    color: 'red',
    emoji: '🍒',
    gradient: 'from-rose-400 to-red-500',
    image: '',
    plantingSmartFarm: [0, 1, 2, 7, 8, 9, 10, 11],
    plantingOpenField: [2, 3, 7, 8],
    harvestingSmartFarm: [4, 5, 6, 0, 1, 2],
    harvestingOpenField: [6, 7, 8, 10, 11],
    tasks: {
      planting: '육묘 8~9주, 지지대·유인줄 설치, 온도 20~25°C, 간격 50~60cm',
      growing: '곁순 주 1회 제거, 화방관리(송이당 8~10과), EC 2.5~3.0 유지',
      harvesting: '완전 착색 후 송이째 수확 — 선별 포장, 상온 유통'
    },
    growingPoints: [
      '토마토보다 당도·풍미 강조: EC 2.5~3.0 유지로 당도 향상',
      '화방 관리: 1화방 8~10과 유지 — 과비대 방지',
      '곁순 제거: 매주 전 곁순 제거 — 장기 수확 필수 관리',
      '온도: 주간 22~26°C · 야간 15~18°C',
      '칼슘 결핍(배꼽 썩음병): 엽면 칼슘 시비, 건조·과습 반복 방지',
      '잿빛곰팡이 예방: 밀식 금지, 하위 노화 잎 제거, 환기 강화',
      '노지: 비가림 재배 → 품질·병해 관리 용이',
      '출하: 8~9개 익은 송이 수확, 청과 혼입 주의',
    ],
    envGuide: {
      temp: '22~26°C (주간), 15~18°C (야간)',
      humidity: '60~70%',
      light: '풀광 (8시간 이상)',
      ec: '2.5~3.0 mS/cm',
      ph: '5.8~6.5',
      water: '균일 관수 — 건조-습윤 반복 배꼽 썩음 유발',
    }
  }
];

export function getCropById(id: string): CropData | undefined {
  return CROPS.find(c => c.id === id);
}

export const CROP_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  emerald: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-300', gradient: 'from-emerald-400 to-teal-500' },
  red:     { bg: 'bg-red-100',     text: 'text-red-700',     border: 'border-red-300',     gradient: 'from-red-400 to-pink-500' },
  green:   { bg: 'bg-green-100',   text: 'text-green-700',   border: 'border-green-300',   gradient: 'from-green-400 to-emerald-500' },
  lime:    { bg: 'bg-lime-100',    text: 'text-lime-700',    border: 'border-lime-300',    gradient: 'from-lime-400 to-green-500' },
  orange:  { bg: 'bg-orange-100',  text: 'text-orange-700',  border: 'border-orange-300',  gradient: 'from-orange-400 to-red-500' },
  teal:    { bg: 'bg-teal-100',    text: 'text-teal-700',    border: 'border-teal-300',    gradient: 'from-teal-400 to-cyan-500' },
  purple:  { bg: 'bg-purple-100',  text: 'text-purple-700',  border: 'border-purple-300',  gradient: 'from-purple-400 to-pink-500' },
  blue:    { bg: 'bg-blue-100',    text: 'text-blue-700',    border: 'border-blue-300',    gradient: 'from-blue-400 to-indigo-500' },
};

export const CROP_VISUAL: Record<string, { emoji: string; gradient: string }> = {
  wasabi:          { emoji: '🌿', gradient: 'from-emerald-400 to-teal-500' },
  strawberry:      { emoji: '🍓', gradient: 'from-red-400 to-pink-500' },
  basil:           { emoji: '🌱', gradient: 'from-green-400 to-emerald-500' },
  lettuce:         { emoji: '🥬', gradient: 'from-lime-400 to-green-500' },
  tomato:          { emoji: '🍅', gradient: 'from-orange-400 to-red-500' },
  pepper:          { emoji: '🫑', gradient: 'from-yellow-400 to-orange-500' },
  cucumber:        { emoji: '🥒', gradient: 'from-teal-400 to-cyan-500' },
  perilla:         { emoji: '🍃', gradient: 'from-purple-400 to-indigo-500' },
  spinach:         { emoji: '🥬', gradient: 'from-green-500 to-emerald-600' },
  kale:            { emoji: '🥦', gradient: 'from-emerald-500 to-green-600' },
  mint:            { emoji: '🌿', gradient: 'from-cyan-400 to-teal-500' },
  'cherry-tomato': { emoji: '🍒', gradient: 'from-rose-400 to-red-500' },
  radish:          { emoji: '🥕', gradient: 'from-purple-300 to-pink-400' },
  carrot:          { emoji: '🥕', gradient: 'from-orange-400 to-amber-500' },
  potato:          { emoji: '🥔', gradient: 'from-yellow-600 to-amber-700' },
  chard:           { emoji: '🌿', gradient: 'from-teal-400 to-cyan-500' },
};
