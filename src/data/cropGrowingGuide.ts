/**
 * 작물별 재배 가이드 (초보자 친화)
 *
 * 📚 데이터 출처:
 *   - 농촌진흥청 (RDA) 국립원예특작과학원 표준 재배 매뉴얼
 *   - 농사로 (nongsaro.go.kr) 작물별 표준영농교본
 *   - 경기도농업기술원 스마트팜 재배 매뉴얼
 *   - 제주농업기술원 월동작물 재배 매뉴얼
 *   - 2025~2026년 개정판 기준
 *
 * 각 작물마다 스마트팜(시설재배)과 노지재배를 나누어
 * 초보자도 따라할 수 있는 단계별 가이드로 구성했습니다.
 */

export type Difficulty = '초급' | '중급' | '고급';

export interface NutrientRequirement {
  name: string;        // 영양소명
  symbol: string;      // 화학 기호
  role: string;        // 역할
  deficiency: string;  // 결핍 증상
  rangePpm?: string;   // 권장 ppm 범위 (수경재배 기준)
}

export interface EnvCondition {
  temperature: { day: string; night: string };
  humidity: string;
  light: string;
  ph: string;
  ec: string;           // 수경재배 EC
  watering: string;
}

export interface CultivationStep {
  title: string;
  days: string;         // 예: '정식 후 0~7일'
  description: string;
  tasks: string[];
  warning?: string;
}

export interface PestDisease {
  name: string;
  type: '병해' | '충해';
  symptoms: string;
  prevention: string;
  treatment: string;
}

export interface CropGrowingGuide {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  category: '엽채류' | '과채류' | '근채류' | '허브류';
  difficulty: Difficulty;
  totalDays: string;           // 정식부터 수확까지
  beginnerScore: number;       // 1~5, 초보자 추천도
  description: string;         // 한 줄 요약

  nutrients: NutrientRequirement[];

  smartFarm: {
    env: EnvCondition;
    steps: CultivationStep[];
    advantages: string[];
    equipment: string[];        // 필요 장비
    notes: string[];
  };

  openField: {
    env: EnvCondition;
    steps: CultivationStep[];
    plantingMonths: string;     // 예: '3월 중순 ~ 4월 초'
    advantages: string[];
    notes: string[];
  };

  beginnerTips: string[];        // 초보자 팁 (공통)
  pestsDiseases: PestDisease[];
  companionPlants?: string[];    // 공생 식물
  references: { label: string; url: string }[];
}

/* ═══════════════════════════════════════════════════════
 *   14종 작물 재배 가이드
 * ═══════════════════════════════════════════════════════ */

export const GROWING_GUIDES: Record<string, CropGrowingGuide> = {

  /* ═══════ 고추냉이 (향재원 주력) ═══════ */
  wasabi: {
    id: 'wasabi',
    name: '고추냉이 (와사비)',
    scientificName: 'Eutrema japonicum',
    family: '십자화과',
    category: '허브류',
    difficulty: '고급',
    totalDays: '정식 후 18~24개월',
    beginnerScore: 2,
    description: '저온·차광·청정수가 필수인 고부가가치 작물. 2년 이상 인내가 필요합니다.',

    nutrients: [
      { name: '질소',    symbol: 'N',  role: '잎 생장', deficiency: '잎 황화·생육 저하', rangePpm: '120~150' },
      { name: '인산',    symbol: 'P',  role: '뿌리 발달', deficiency: '뿌리 빈약·착근 불량', rangePpm: '30~50' },
      { name: '칼륨',    symbol: 'K',  role: '근경 비대', deficiency: '근경 발달 불량·매운맛 저하', rangePpm: '180~220' },
      { name: '칼슘',    symbol: 'Ca', role: '세포벽 강화', deficiency: '잎끝 갈변·무름병', rangePpm: '150~200' },
      { name: '마그네슘', symbol: 'Mg', role: '광합성', deficiency: '잎맥 사이 황화', rangePpm: '40~60' },
      { name: '황',      symbol: 'S',  role: '매운맛 성분(시니그린) 생성', deficiency: '향·매운맛 저하', rangePpm: '60~80' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '15~18°C', night: '10~13°C' },
        humidity: '70~80%',
        light: '50~60% 차광 (10,000~15,000 lux)',
        ph: '6.0~6.5',
        ec: '1.0~1.5 mS/cm',
        watering: '담액식 또는 박막식 순환수경',
      },
      steps: [
        {
          title: '1단계 — 육묘 및 정식 준비',
          days: '정식 -30 ~ 0일',
          description: '조직배양 묘 또는 포트 묘를 구입하여 정식 준비. 근경 썩음병을 막으려면 건강한 묘가 최우선.',
          tasks: [
            '경기도농업기술원·강원도농업기술원 지정 조직배양묘 구입',
            '정식판·베드 1% 차아염소산나트륨으로 살균',
            '차광막 50~60% 설치 확인',
            'EC 1.0 mS/cm 배양액 미리 준비',
          ],
          warning: '농장 바이러스·균 오염이 가장 큰 실패 원인 — 장갑·장화 소독 필수',
        },
        {
          title: '2단계 — 정식 및 초기 활착 (0~30일)',
          days: '정식 후 0~30일',
          description: '주간 15°C 유지가 관건. 활착 실패 시 전체 폐기 위험.',
          tasks: [
            '정식 간격 15cm × 15cm 유지',
            '온도 주간 15°C / 야간 12°C 고정',
            '습도 75% 유지 (포그 분무 활용)',
            '관수 시 뿌리가 마르지 않도록 항상 촉촉',
            '약한 조명(5,000 lux) 으로 적응',
          ],
        },
        {
          title: '3단계 — 본 생육기 (30일~12개월)',
          days: '정식 후 1~12개월',
          description: '잎 수확 및 근경 비대 준비. EC를 서서히 올립니다.',
          tasks: [
            'EC 1.2~1.5 mS/cm 로 상승',
            '월 1회 오래된 잎 제거 (통풍 개선)',
            '온도 15~18°C 엄수 — 20°C 초과 시 냉각',
            '잎 수확 시작 (월 1회, 전체의 30% 이내)',
          ],
          warning: '20°C 넘으면 생육 정지 → 냉방기 필수',
        },
        {
          title: '4단계 — 근경 비대기 (12~18개월)',
          days: '정식 후 12~18개월',
          description: '근경 무게 80~120g 도달까지 관리.',
          tasks: [
            '오래된 잎 대부분 제거 (근경 비대 촉진)',
            '칼륨 비중 높인 배양액으로 전환',
            '월 2회 시료주 채취하여 크기 측정',
            '차광 60% 유지',
          ],
        },
        {
          title: '5단계 — 수확 및 저장',
          days: '정식 후 18~24개월',
          description: '근경 직경 3~4cm, 무게 80~120g 도달 시 수확.',
          tasks: [
            '이른 아침 수확 (5~8시)',
            '잎과 가는 뿌리 제거, 물로 세척',
            '저온(5°C) 저장 — 2주 이내 유통',
            '상처 없는 것만 상품화',
          ],
        },
      ],
      advantages: [
        '연중 수확 가능 (계획 생산)',
        '해충·병해 발생 50% 이상 감소',
        '수입산 대비 3배 이상 프리미엄가',
        '노지 대비 품질 균일',
      ],
      equipment: [
        '냉각기 (주간 15°C 유지)',
        '차광막 50~60%',
        '담액식 NFT 수경 시스템',
        '배양액 자동 공급 장치',
        'EC·pH 측정기',
        'LED 보광 (겨울철)',
      ],
      notes: [
        '초기 투자비 평당 100~150만원 수준',
        '조직배양묘 1주당 2,500~3,500원',
        '숙련까지 최소 2년 (한 사이클 경험)',
      ],
    },

    openField: {
      env: {
        temperature: { day: '15~18°C', night: '8~13°C' },
        humidity: '자연',
        light: '자연 차광 (계곡·활엽수림 아래)',
        ph: '6.0~6.5',
        ec: '-',
        watering: '계곡 청정수 지속 흐름',
      },
      steps: [
        {
          title: '1단계 — 부지 선정 및 준비',
          days: '정식 -60 ~ 0일',
          description: '국내에서 노지 고추냉이 재배 가능한 곳은 강원·경남 일부 계곡.',
          tasks: [
            '연중 수온 10~14°C 유지되는 계곡 찾기',
            '활엽수림 50~70% 차광 확인',
            '배수 양호·모래질 토양 선호',
            '부지 pH 6.0~6.5 확인',
          ],
          warning: '전국 대부분 지역에서 노지재배 불가 — 기후·수질 적합지 확인 필수',
        },
        {
          title: '2단계 — 정식 (3~4월 또는 9~10월)',
          days: '정식 0일',
          description: '봄 또는 가을에 정식. 여름 정식은 실패율 높음.',
          tasks: [
            '포트 묘를 20cm × 20cm 간격 정식',
            '뿌리 절단 없이 조심스럽게 이식',
            '정식 직후 충분히 관수',
            '첫 1주일 신문지로 가림막',
          ],
        },
        {
          title: '3단계 — 생육 관리',
          days: '정식 후 1개월 ~ 18개월',
          description: '계곡수가 항상 흐르는지 확인. 여름 고온기 20°C 초과 시 생육 정지.',
          tasks: [
            '주 1회 잡초 제거',
            '여름철 수온 모니터링',
            '유기질 비료(발효퇴비) 월 1회 소량',
            '월 1회 병충해 순회 점검',
          ],
          warning: '여름 20°C 초과 시 근경 썩음 발생 — 그늘막 추가 설치',
        },
        {
          title: '4단계 — 수확 (18~24개월)',
          days: '정식 후 18~24개월',
          description: '근경 80g 이상 도달 시 수확.',
          tasks: [
            '호미로 조심스럽게 뿌리 굴취',
            '잎과 가는 뿌리 정리',
            '수확 후 즉시 유통',
          ],
        },
      ],
      plantingMonths: '3월 중순~4월 / 9월 중순~10월 (연 2회 기회)',
      advantages: [
        '초기 투자비 낮음',
        '자연 재배로 프리미엄 브랜드화 가능',
        '전통 재배법 계승 가치',
      ],
      notes: [
        '적지 확보가 가장 큰 난관',
        '수확 성공률 50% 이하 (자연 변수)',
        '연간 수확량은 스마트팜 대비 1/5 수준',
      ],
    },

    beginnerTips: [
      '처음이면 반드시 조직배양묘로 시작 (종자 재배는 고급자도 어려움)',
      '20°C 넘으면 모든 것이 실패 — 온도 관리가 90%',
      '1년 차는 학습, 2년 차부터 실질 수익 기대',
      '배양액 EC/pH 는 매일 체크',
      '1% 차아염소산나트륨으로 베드·도구 주 1회 소독',
      '소량(10평)부터 시작하여 기술 습득',
    ],

    pestsDiseases: [
      {
        name: '근경 무름병',
        type: '병해',
        symptoms: '근경이 물렁해지고 악취 발생, 최악의 경우 전멸',
        prevention: '통풍 개선, 습도 80% 초과 방지, 뿌리 주변 수분 과다 주의',
        treatment: '이병주 즉시 제거·폐기, 주변 토양 소독',
      },
      {
        name: '진딧물',
        type: '충해',
        symptoms: '잎 뒷면에 모여 즙 흡수, 바이러스 매개',
        prevention: '황색 끈끈이 트랩 설치, 통풍 관리',
        treatment: '물세척·무당벌레 천적 활용·친환경 약제',
      },
      {
        name: '잿빛곰팡이병',
        type: '병해',
        symptoms: '잎·줄기에 회색 곰팡이 발생',
        prevention: '과습 방지, 환기 철저',
        treatment: '이병 조직 제거 후 살균제 살포',
      },
    ],

    references: [
      { label: '농사로 - 고추냉이 표준영농교본', url: 'https://www.nongsaro.go.kr' },
      { label: '경기도농업기술원 - 고추냉이 재배 매뉴얼', url: 'https://nongup.gg.go.kr' },
      { label: '강원도농업기술원 - 수경 고추냉이', url: 'https://www.ares.gangwon.kr' },
    ],
  },

  /* ═══════ 딸기 ═══════ */
  strawberry: {
    id: 'strawberry',
    name: '딸기',
    scientificName: 'Fragaria × ananassa',
    family: '장미과',
    category: '과채류',
    difficulty: '중급',
    totalDays: '정식 후 120~180일',
    beginnerScore: 3,
    description: '국내 스마트팜 대표 작물. 수분 관리와 꿀벌 수정이 핵심입니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '생육·잎', deficiency: '잎 황화·생육 저하', rangePpm: '100~150' },
      { name: '인산', symbol: 'P', role: '꽃눈 분화', deficiency: '화아분화 불량', rangePpm: '40~60' },
      { name: '칼륨', symbol: 'K', role: '과실 당도·크기', deficiency: '과실 작고 연함', rangePpm: '180~250' },
      { name: '칼슘', symbol: 'Ca', role: '과실 경도', deficiency: '팁번(잎끝 갈변)·과실 연화', rangePpm: '150~200' },
      { name: '붕소', symbol: 'B', role: '꽃가루 활성', deficiency: '기형과 발생', rangePpm: '0.3~0.5' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '20~25°C', night: '10~15°C' },
        humidity: '60~70%',
        light: '10,000~12,000 lux · 8~12시간',
        ph: '5.5~6.5',
        ec: '1.2~1.5 mS/cm',
        watering: '고설재배(배지경) 드립 관수',
      },
      steps: [
        {
          title: '1단계 — 묘 구입 및 화아분화 처리',
          days: '정식 -30 ~ 0일',
          description: '8월 중순부터 저온 처리로 꽃눈 만들기.',
          tasks: [
            '설향·매향·금실 품종 중 선택',
            '야간 13°C 이하 2주간 저온 처리',
            '배지(코코피트+펄라이트) 준비',
            '정식판 소독',
          ],
        },
        {
          title: '2단계 — 정식 (9월 초~중순)',
          days: '정식 0일',
          description: '정식 시기가 수확량을 좌우합니다.',
          tasks: [
            '포기 간격 20~25cm 유지',
            '왕관(크라운) 부분이 배지 위로 노출되게 식재',
            '정식 후 관수 충분히',
            '초기 EC 1.0 mS/cm 유지',
          ],
          warning: '왕관이 묻히면 썩음 발생',
        },
        {
          title: '3단계 — 개화 및 수정',
          days: '정식 후 45~60일',
          description: '꿀벌 투입이 필수입니다.',
          tasks: [
            '첫 화방 확인 후 꿀벌통 투입',
            '낮 온도 22~25°C 유지 (꿀벌 활동)',
            '기형화 조기 제거',
            '잎/꽃 비율 관리',
          ],
        },
        {
          title: '4단계 — 과실 비대·수확 (12~5월)',
          days: '정식 후 90~180일',
          description: '수확은 이른 아침에.',
          tasks: [
            'EC 1.4~1.5 로 상향 조정',
            '80~90% 착색 시 수확',
            '주 2~3회 수확',
            '런너(자식 줄기) 즉시 제거',
          ],
        },
      ],
      advantages: [
        '연 12~5월 장기 수확',
        '고설재배로 허리 편함',
        '병해충 발생 감소',
        '수확량 30~50% 증가',
      ],
      equipment: [
        '고설 배지경 시스템',
        '드립 관수 + 양액기',
        '꿀벌통 (2~3주 교체)',
        '탄산가스 공급기 (선택)',
        '보온 커튼',
      ],
      notes: [
        '초기 투자비 평당 70~100만원',
        '묘 가격 주당 1,200~1,800원',
        '연 1회 수확 사이클',
      ],
    },

    openField: {
      env: {
        temperature: { day: '20~25°C', night: '5~15°C' },
        humidity: '자연',
        light: '자연',
        ph: '5.5~6.5',
        ec: '-',
        watering: '점적관수 (월 2~3회)',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '정식 -30 ~ 0일',
          description: '물 빠짐 좋은 사질양토 선호.',
          tasks: [
            '완숙퇴비 10톤/10a 시비',
            '고랑 폭 60cm, 이랑 높이 20cm 로 준비',
            '검은 멀칭 비닐 피복',
            'pH 5.5~6.5 조정',
          ],
        },
        {
          title: '2단계 — 정식 (9월 하순~10월 초)',
          days: '정식 0일',
          description: '기온 하강기 정식.',
          tasks: [
            '포기 간격 25cm 유지',
            '왕관 노출 식재',
            '정식 후 충분한 관수',
          ],
        },
        {
          title: '3단계 — 월동 및 보온',
          days: '정식 후 60~150일',
          description: '12월~2월 보온 매우 중요.',
          tasks: [
            '12월 부직포 이중 덮기',
            '3월 보온 해제',
            '잡초 제거',
          ],
        },
        {
          title: '4단계 — 수확 (5~6월)',
          days: '정식 후 200~240일',
          description: '이른 아침 수확 권장.',
          tasks: [
            '꼭지 포함 수확',
            '온도 낮은 시간대 선택',
            '수확 직후 냉장',
          ],
        },
      ],
      plantingMonths: '9월 하순 ~ 10월 초',
      advantages: [
        '초기 투자 적음 (평당 20만원 이하)',
        '자연 재배로 당도 높음',
        '6월 한정 프리미엄 판매',
      ],
      notes: [
        '한 번만 수확 (5~6월)',
        '월동 실패 위험',
        '병해충 관리 난이도 높음',
      ],
    },

    beginnerTips: [
      '첫 시도는 소량(5평)으로 시작',
      '화아분화 처리 실패 시 꽃이 안 핌 — 저온 처리 꼭 확인',
      '꿀벌 없으면 붓으로 수정 가능',
      '잿빛곰팡이병 예방이 70% — 습도 관리',
      '과실 수확은 꼭지 포함하여 따기',
      '런너는 무조건 제거',
    ],

    pestsDiseases: [
      {
        name: '잿빛곰팡이병',
        type: '병해',
        symptoms: '과실·꽃에 회색 곰팡이',
        prevention: '습도 60~70% 유지, 통풍, 밀식 방지',
        treatment: '이병과 즉시 제거, 살균제 주기 살포',
      },
      {
        name: '진딧물',
        type: '충해',
        symptoms: '신초·잎 뒷면에 군집',
        prevention: '황색 트랩, 천적(무당벌레)',
        treatment: '물세척, 친환경 살충제',
      },
      {
        name: '흰가루병',
        type: '병해',
        symptoms: '잎에 흰 가루',
        prevention: '통풍, 일조 확보',
        treatment: '살균제 살포, 이병엽 제거',
      },
    ],

    references: [
      { label: '농사로 - 딸기 표준영농교본', url: 'https://www.nongsaro.go.kr' },
      { label: '논산딸기시험장', url: 'https://nsstation.nonsan.go.kr' },
    ],
  },

  /* ═══════ 상추 (초보자 추천) ═══════ */
  lettuce: {
    id: 'lettuce',
    name: '상추',
    scientificName: 'Lactuca sativa',
    family: '국화과',
    category: '엽채류',
    difficulty: '초급',
    totalDays: '정식 후 25~35일',
    beginnerScore: 5,
    description: '초보자가 가장 성공하기 쉬운 작물. 짧은 재배 기간과 연중 재배가 가능합니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '잎 성장', deficiency: '잎 황화·성장 저하', rangePpm: '150~200' },
      { name: '인산', symbol: 'P', role: '뿌리', deficiency: '뿌리 발달 불량', rangePpm: '30~50' },
      { name: '칼륨', symbol: 'K', role: '잎 경도', deficiency: '잎 연약·쉽게 시듦', rangePpm: '180~220' },
      { name: '칼슘', symbol: 'Ca', role: '팁번 방지', deficiency: '팁번(잎끝 갈변)', rangePpm: '100~150' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '18~22°C', night: '12~15°C' },
        humidity: '60~70%',
        light: '12,000~15,000 lux',
        ph: '5.8~6.5',
        ec: '1.2~1.8 mS/cm',
        watering: 'DFT/NFT 순환식 수경',
      },
      steps: [
        {
          title: '1단계 — 파종 및 육묘',
          days: '파종 후 0~15일',
          description: '스펀지 배지에 직파.',
          tasks: [
            '스펀지 배지에 종자 1~2립 파종',
            '25°C 암조건에서 발아',
            '발아 후 LED 14시간 조명',
            'EC 0.8 mS/cm 약한 배양액',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '파종 후 15~18일',
          description: '4~5엽기 정식.',
          tasks: [
            '정식판 20cm × 20cm 간격',
            'EC 1.2 로 상승',
            '온도 20°C 유지',
          ],
        },
        {
          title: '3단계 — 본 생육 및 수확',
          days: '정식 후 10~25일',
          description: '정식 후 25일이면 수확 가능.',
          tasks: [
            'EC 1.5~1.8 상향',
            '하부 잎 1~2장 주간 수확 가능',
            '전체 수확은 25~30일 후',
          ],
        },
      ],
      advantages: [
        '연 8~10회 회전',
        '실패율 매우 낮음',
        '판매 즉시 가능',
        '초보자 학습용 최적',
      ],
      equipment: [
        '수경 베드',
        'LED 식물등',
        '양액 순환 펌프',
        'EC/pH 측정기',
      ],
      notes: [
        '초기 투자 적음 (평당 30~50만원)',
        '가장 쉬운 작물',
      ],
    },

    openField: {
      env: {
        temperature: { day: '18~22°C', night: '10~15°C' },
        humidity: '자연',
        light: '자연',
        ph: '5.8~6.5',
        ec: '-',
        watering: '주 2~3회 저녁',
      },
      steps: [
        {
          title: '1단계 — 밭 만들기',
          days: '파종 -14 ~ 0일',
          description: '사질양토가 적합.',
          tasks: [
            '완숙퇴비 2~3톤/10a',
            '이랑 폭 1m, 고랑 30cm',
            '석회 시비로 pH 조정',
          ],
        },
        {
          title: '2단계 — 파종 또는 정식',
          days: '0일',
          description: '직파 또는 모종 정식.',
          tasks: [
            '직파: 20cm 간격 3~5립',
            '모종: 15~20cm 간격',
            '파종 후 얕게 복토',
          ],
        },
        {
          title: '3단계 — 관리 및 수확',
          days: '10~35일',
          description: '쉽고 빠른 수확.',
          tasks: [
            '주 2~3회 관수',
            '잡초 제거',
            '하부 잎부터 순차 수확',
          ],
        },
      ],
      plantingMonths: '3~5월 / 9~10월 (연 2회)',
      advantages: [
        '투자비 거의 없음',
        '초보자 추천 1순위',
        '실패해도 타격 적음',
      ],
      notes: [
        '여름 고온기 생육 불량',
        '장마철 잿빛곰팡이 주의',
      ],
    },

    beginnerTips: [
      '첫 작물로 상추 강력 추천',
      '여름(7~8월) 피하고 봄·가을에 시작',
      '수확은 바깥쪽 큰 잎부터 하나씩',
      '과습 주의 (뿌리 썩음)',
      '화분에서도 가능 — 텃밭 연습용',
    ],

    pestsDiseases: [
      {
        name: '진딧물',
        type: '충해',
        symptoms: '잎 뒷면·신초에 군집',
        prevention: '황색 트랩',
        treatment: '물세척·천적',
      },
      {
        name: '잿빛곰팡이병',
        type: '병해',
        symptoms: '잎에 수침상 반점',
        prevention: '통풍·밀식 방지',
        treatment: '이병엽 제거·살균제',
      },
    ],

    references: [
      { label: '농사로 - 상추 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 토마토 ═══════ */
  tomato: {
    id: 'tomato',
    name: '토마토',
    scientificName: 'Solanum lycopersicum',
    family: '가지과',
    category: '과채류',
    difficulty: '중급',
    totalDays: '정식 후 90~120일',
    beginnerScore: 4,
    description: '가장 대중적인 과채류. 지주와 적심이 핵심 기술입니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '생육', deficiency: '생장 저하', rangePpm: '150~200' },
      { name: '인산', symbol: 'P', role: '개화', deficiency: '화방 부실', rangePpm: '50~80' },
      { name: '칼륨', symbol: 'K', role: '과실 당도', deficiency: '과실 연함·당도 저하', rangePpm: '200~300' },
      { name: '칼슘', symbol: 'Ca', role: '과실', deficiency: '배꼽썩음병', rangePpm: '150~200' },
      { name: '마그네슘', symbol: 'Mg', role: '광합성', deficiency: '잎맥간 황화', rangePpm: '40~60' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '22~28°C', night: '15~18°C' },
        humidity: '60~75%',
        light: '20,000~30,000 lux',
        ph: '5.8~6.5',
        ec: '2.0~3.0 mS/cm',
        watering: '배지경 드립 관수',
      },
      steps: [
        {
          title: '1단계 — 육묘',
          days: '파종 후 0~45일',
          description: '파종 후 45일 정식.',
          tasks: [
            '트레이 파종 (2립/공)',
            '25°C 발아 5~7일',
            '본엽 5~6매 시 정식',
          ],
        },
        {
          title: '2단계 — 정식 및 유인',
          days: '정식 0일',
          description: '지주 세우기 필수.',
          tasks: [
            '포기 간격 50~60cm',
            '끈 유인 준비',
            'EC 2.0 시작',
          ],
        },
        {
          title: '3단계 — 개화·적심',
          days: '정식 후 30~90일',
          description: '곁순 제거 + 꽃 수분.',
          tasks: [
            '곁순 주 2회 제거',
            '바람·진동기로 수분 촉진',
            'EC 2.5~3.0 상승',
            '배꼽썩음병 방지 칼슘 엽면시비',
          ],
        },
        {
          title: '4단계 — 수확',
          days: '정식 후 60~120일',
          description: '전체 붉은색 80% 이상 시 수확.',
          tasks: [
            '아침 수확',
            '꼭지 포함',
            '상온 후숙',
          ],
        },
      ],
      advantages: [
        '연중 재배 가능',
        '단일 품종 대량 생산',
        '수확량 30~50% 증가',
      ],
      equipment: [
        '배지경 시스템',
        '지주·유인끈',
        '환경 제어기',
        'CO2 공급기 (선택)',
      ],
      notes: [
        '평당 80~120만원 투자',
        '난방비 비중 큼',
      ],
    },

    openField: {
      env: {
        temperature: { day: '20~28°C', night: '15~18°C' },
        humidity: '자연',
        light: '자연',
        ph: '6.0~6.5',
        ec: '-',
        watering: '주 2~3회',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '정식 -20 ~ 0일',
          description: '배수 양호한 사양토.',
          tasks: [
            '완숙퇴비 3~5톤/10a',
            '석회로 pH 6.0~6.5 조정',
            '검은 비닐 멀칭',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '5월 초 (서리 지난 후)',
          description: '서리 완전히 지난 후 정식.',
          tasks: [
            '50cm 간격',
            '지주 동시 설치',
            '정식 후 충분한 관수',
          ],
        },
        {
          title: '3단계 — 유인 및 관리',
          days: '정식 후 15~90일',
          description: '곁순 제거가 생명.',
          tasks: [
            '주 1~2회 곁순 제거',
            '지주 유인',
            '장마 전 배수로 정비',
          ],
        },
        {
          title: '4단계 — 수확',
          days: '정식 후 60~100일',
          description: '7~8월 집중 수확.',
          tasks: [
            '익은 것부터 주 2~3회 수확',
          ],
        },
      ],
      plantingMonths: '4월 말 ~ 5월 초 (서리 이후)',
      advantages: [
        '투자비 적음',
        '여름 한정 프리미엄',
        '텃밭에서도 가능',
      ],
      notes: [
        '장마·태풍 피해 우려',
        '역병 주의',
      ],
    },

    beginnerTips: [
      '곁순 제거는 생명 — 주 1~2회 필수',
      '물을 너무 자주 주면 과실이 갈라짐',
      '칼슘 부족하면 배꼽썩음병',
      '지주 안 세우면 쓰러짐',
      '첫 꽃은 작아도 수확 가능',
    ],

    pestsDiseases: [
      {
        name: '역병',
        type: '병해',
        symptoms: '잎·줄기·과실에 수침상 반점',
        prevention: '배수·통풍',
        treatment: '이병 부위 제거·살균제',
      },
      {
        name: '배꼽썩음병',
        type: '병해',
        symptoms: '과실 배꼽 부분 갈변',
        prevention: '칼슘 공급·수분 균일',
        treatment: '이병과 제거',
      },
      {
        name: '온실가루이',
        type: '충해',
        symptoms: '잎 뒷면 백색 성충',
        prevention: '황색 트랩',
        treatment: '친환경 약제',
      },
    ],

    references: [
      { label: '농사로 - 토마토 표준영농교본', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 바질 ═══════ */
  basil: {
    id: 'basil',
    name: '바질',
    scientificName: 'Ocimum basilicum',
    family: '꿀풀과',
    category: '허브류',
    difficulty: '초급',
    totalDays: '파종 후 50~70일',
    beginnerScore: 5,
    description: '초보자 쉬운 허브 대표 주자. 햇빛과 따뜻함을 좋아합니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '잎 향기 성분', deficiency: '잎 황화', rangePpm: '120~180' },
      { name: '인산', symbol: 'P', role: '뿌리', deficiency: '뿌리 부실', rangePpm: '40~60' },
      { name: '칼륨', symbol: 'K', role: '향 성분', deficiency: '향 저하', rangePpm: '180~220' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '22~28°C', night: '18~22°C' },
        humidity: '50~70%',
        light: '15,000~20,000 lux',
        ph: '5.8~6.5',
        ec: '1.2~1.8 mS/cm',
        watering: 'NFT 수경',
      },
      steps: [
        {
          title: '1단계 — 파종',
          days: '0~10일',
          description: '발아 쉬움.',
          tasks: [
            '스펀지 배지에 2~3립',
            '25°C 유지',
            '5일 이내 발아',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '10~15일',
          description: '본엽 2~3매 정식.',
          tasks: [
            '15cm × 15cm 간격',
            'EC 1.2',
          ],
        },
        {
          title: '3단계 — 수확',
          days: '35~50일',
          description: '순차 수확 가능.',
          tasks: [
            '잎 또는 윗 순 수확',
            '꽃 피면 향 저하 → 꽃대 제거',
          ],
        },
      ],
      advantages: [
        '연중 재배',
        '수확 여러 번',
        '실패율 낮음',
      ],
      equipment: [
        '수경 시스템',
        'LED 식물등',
      ],
      notes: [
        '카페·레스토랑 납품 유리',
      ],
    },

    openField: {
      env: {
        temperature: { day: '22~28°C', night: '15~22°C' },
        humidity: '자연',
        light: '햇빛 충분',
        ph: '6.0~7.0',
        ec: '-',
        watering: '주 2~3회',
      },
      steps: [
        {
          title: '1단계 — 파종',
          days: '5~6월',
          description: '서리 지난 후.',
          tasks: [
            '양지바른 곳',
            '완숙퇴비 시비',
            '파종 또는 모종 정식',
          ],
        },
        {
          title: '2단계 — 관리',
          days: '정식 후 20~50일',
          description: '꽃대 제거 필수.',
          tasks: [
            '꽃대 발견 즉시 제거',
            '주 1회 잡초 제거',
          ],
        },
        {
          title: '3단계 — 수확',
          days: '정식 후 50~70일',
          description: '잎을 순차 수확.',
          tasks: [
            '큰 잎부터 수확',
            '10~15cm 남기고 절단',
          ],
        },
      ],
      plantingMonths: '5월 ~ 6월',
      advantages: [
        '텃밭 가능',
        '투자비 거의 없음',
        '여름 한 철 프리미엄',
      ],
      notes: [
        '서리에 약함',
        '겨울 재배 불가',
      ],
    },

    beginnerTips: [
      '햇빛 최소 6시간 이상 필요',
      '꽃대 제거하면 잎이 계속 나옴',
      '물 너무 많으면 향 저하',
      '화분에서도 잘 자람',
      '수확은 가위로 부드럽게',
    ],

    pestsDiseases: [
      {
        name: '응애',
        type: '충해',
        symptoms: '잎에 작은 반점·황화',
        prevention: '습도 유지',
        treatment: '물분무·천적',
      },
      {
        name: '흰가루병',
        type: '병해',
        symptoms: '잎에 흰 가루',
        prevention: '통풍',
        treatment: '이병엽 제거',
      },
    ],

    references: [
      { label: '농사로 - 허브 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 케일 ═══════ */
  kale: {
    id: 'kale',
    name: '케일',
    scientificName: 'Brassica oleracea var. acephala',
    family: '십자화과',
    category: '엽채류',
    difficulty: '초급',
    totalDays: '정식 후 45~70일',
    beginnerScore: 5,
    description: '서늘한 기후를 좋아하는 대표 슈퍼푸드. 초보자도 쉽게 키울 수 있습니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '잎 생장', deficiency: '잎 황화·생육 저하', rangePpm: '150~200' },
      { name: '인산', symbol: 'P', role: '뿌리 발달', deficiency: '생육 지연', rangePpm: '40~60' },
      { name: '칼륨', symbol: 'K', role: '잎 경도·맛', deficiency: '잎 연약', rangePpm: '180~240' },
      { name: '칼슘', symbol: 'Ca', role: '잎 조직', deficiency: '팁번·잎끝 갈변', rangePpm: '120~180' },
      { name: '마그네슘', symbol: 'Mg', role: '엽록소', deficiency: '잎맥 사이 황화', rangePpm: '40~60' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '18~22°C', night: '10~15°C' },
        humidity: '60~70%',
        light: '12,000~18,000 lux · 12~14시간',
        ph: '6.0~6.8',
        ec: '1.5~2.0 mS/cm',
        watering: 'DFT/NFT 순환 수경',
      },
      steps: [
        {
          title: '1단계 — 파종 및 육묘',
          days: '파종 후 0~20일',
          description: '발아가 빠르고 균일합니다.',
          tasks: [
            '스펀지 배지에 1~2립 파종',
            '20~22°C 발아 유지 (3~5일)',
            'LED 14시간 조명',
            'EC 0.8~1.0 약한 배양액',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '파종 후 20~25일',
          description: '본엽 4~5매에서 정식합니다.',
          tasks: [
            '25cm × 25cm 간격',
            'EC 1.5 로 상향',
            '온도 20°C 유지',
          ],
        },
        {
          title: '3단계 — 본 생육 및 수확',
          days: '정식 후 25~50일',
          description: '바깥 잎부터 순차 수확 가능합니다.',
          tasks: [
            'EC 1.8~2.0 유지',
            '외엽부터 주 2~3매 수확',
            '중심부 생장점 보호',
          ],
          warning: '25°C 초과 시 쓴맛 증가',
        },
      ],
      advantages: [
        '연 6~8회 회전 가능',
        '연중 수확 (온도 유지 시)',
        '실패율 낮음',
      ],
      equipment: [
        '수경 베드',
        'LED 식물등',
        '양액 순환 펌프',
        'EC/pH 측정기',
      ],
      notes: [
        '평당 40~60만원 투자',
        '서늘한 기후 유지가 관건',
      ],
    },

    openField: {
      env: {
        temperature: { day: '15~22°C', night: '8~15°C' },
        humidity: '자연',
        light: '자연',
        ph: '6.0~6.8',
        ec: '-',
        watering: '주 2~3회',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '정식 -14 ~ 0일',
          description: '배수 좋은 양토.',
          tasks: [
            '완숙퇴비 3톤/10a',
            '석회로 pH 6.0~6.8 조정',
            '이랑 폭 80cm',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '3~4월 또는 8~9월',
          description: '서늘한 시기 정식.',
          tasks: [
            '30cm × 40cm 간격',
            '정식 후 충분한 관수',
            '방충망 설치 권장',
          ],
        },
        {
          title: '3단계 — 관리·수확',
          days: '정식 후 30~70일',
          description: '외엽부터 순차 수확.',
          tasks: [
            '주 1회 잡초 제거',
            '외엽부터 수확',
            '배추흰나비 알·애벌레 조기 제거',
          ],
        },
      ],
      plantingMonths: '3~4월 / 8~9월 (연 2회)',
      advantages: [
        '투자비 거의 없음',
        '텃밭 적합',
        '내한성 강함 (가을 재배 가능)',
      ],
      notes: [
        '여름 고온기 품질 저하',
        '배추흰나비 애벌레 주의',
      ],
    },

    beginnerTips: [
      '외엽부터 한 장씩 수확하면 6개월 이상 지속',
      '여름철 25°C 넘으면 쓴맛 증가',
      '배추흰나비 애벌레 매일 확인',
      '화분·베란다에서도 가능',
      '서리 맞으면 오히려 단맛 증가',
    ],

    pestsDiseases: [
      {
        name: '배추흰나비 애벌레',
        type: '충해',
        symptoms: '잎이 구멍 뚫리고 갉아먹힘',
        prevention: '방충망 설치, 알 조기 제거',
        treatment: '수작업 제거, 친환경 BT제',
      },
      {
        name: '진딧물',
        type: '충해',
        symptoms: '신엽·잎 뒷면 군집',
        prevention: '황색 트랩·천적',
        treatment: '물세척·친환경 살충제',
      },
      {
        name: '무사마귀병',
        type: '병해',
        symptoms: '뿌리가 혹처럼 부풀어 시듦',
        prevention: '연작 회피, 석회 시비',
        treatment: '이병주 폐기·토양 소독',
      },
    ],

    references: [
      { label: '농사로 - 케일 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 시금치 ═══════ */
  spinach: {
    id: 'spinach',
    name: '시금치',
    scientificName: 'Spinacia oleracea',
    family: '명아주과',
    category: '엽채류',
    difficulty: '초급',
    totalDays: '파종 후 30~50일',
    beginnerScore: 5,
    description: '서늘한 기후의 대표 엽채류. 파종 후 한 달이면 수확 가능합니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '잎 생장', deficiency: '잎 황화', rangePpm: '150~200' },
      { name: '인산', symbol: 'P', role: '뿌리', deficiency: '뿌리 부실', rangePpm: '40~60' },
      { name: '칼륨', symbol: 'K', role: '잎 품질', deficiency: '잎 연약', rangePpm: '180~220' },
      { name: '칼슘', symbol: 'Ca', role: '잎 조직', deficiency: '팁번', rangePpm: '120~180' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '15~20°C', night: '8~12°C' },
        humidity: '60~70%',
        light: '12,000~15,000 lux',
        ph: '6.0~7.0',
        ec: '1.4~2.0 mS/cm',
        watering: 'DFT 순환 수경',
      },
      steps: [
        {
          title: '1단계 — 파종',
          days: '0~7일',
          description: '저온 발아를 선호합니다.',
          tasks: [
            '스펀지 배지에 2~3립 파종',
            '15~18°C 발아 (5~7일)',
            '발아 후 LED 12시간',
          ],
          warning: '25°C 넘으면 발아율 급감',
        },
        {
          title: '2단계 — 정식 및 본 생육',
          days: '파종 후 10~30일',
          description: '본엽 2~3매에 정식.',
          tasks: [
            '15cm × 15cm 간격',
            'EC 1.6~2.0',
            '온도 18°C 유지',
          ],
        },
        {
          title: '3단계 — 수확',
          days: '파종 후 30~45일',
          description: '초장 20~25cm 시 수확.',
          tasks: [
            '뿌리째 뽑거나 외엽부터 수확',
            '아침 수확 권장',
          ],
        },
      ],
      advantages: [
        '연 8~10회 회전',
        '단기 작물로 수익 회전 빠름',
        '실패율 매우 낮음',
      ],
      equipment: [
        '수경 베드',
        'LED 식물등',
        '냉방기 (여름용)',
      ],
      notes: [
        '평당 30~50만원 투자',
        '여름 재배 난이도 높음',
      ],
    },

    openField: {
      env: {
        temperature: { day: '15~20°C', night: '5~12°C' },
        humidity: '자연',
        light: '자연',
        ph: '6.5~7.0',
        ec: '-',
        watering: '주 2회',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '파종 -14 ~ 0일',
          description: '석회가 필수입니다.',
          tasks: [
            '완숙퇴비 2톤/10a',
            '석회 100kg/10a (pH 6.5~7.0)',
            '이랑 폭 90cm',
          ],
          warning: '산성 토양에서는 거의 자라지 못함',
        },
        {
          title: '2단계 — 파종',
          days: '3~4월 또는 9~10월',
          description: '직파가 일반적입니다.',
          tasks: [
            '조간 20cm, 주간 5cm',
            '파종 깊이 1~2cm',
            '파종 후 충분한 관수',
          ],
        },
        {
          title: '3단계 — 관리 및 수확',
          days: '파종 후 30~50일',
          description: '솎아주기가 품질을 좌우.',
          tasks: [
            '1차 솎음 (본엽 2~3매)',
            '2차 솎음 (본엽 5~6매)',
            '초장 20cm 시 수확',
          ],
        },
      ],
      plantingMonths: '3~4월 / 9~10월',
      advantages: [
        '투자비 거의 없음',
        '월동 재배 가능 (남부)',
        '텃밭 적합',
      ],
      notes: [
        '산성토 기피 — 석회 필수',
        '여름 고온기 재배 불가',
      ],
    },

    beginnerTips: [
      '봄·가을 재배가 안전 (여름 금지)',
      '석회 시비는 필수',
      '솎음채소도 먹을 수 있음',
      '추위에 강하여 월동 가능',
      '뿌리째 뽑으면 편리',
    ],

    pestsDiseases: [
      {
        name: '노균병',
        type: '병해',
        symptoms: '잎에 황백색 반점, 잎 뒷면 곰팡이',
        prevention: '과습 방지, 통풍',
        treatment: '이병엽 제거·살균제',
      },
      {
        name: '잎응애',
        type: '충해',
        symptoms: '잎에 흰 점, 잎 뒷면 응애',
        prevention: '습도 유지',
        treatment: '물분무·친환경 약제',
      },
      {
        name: '입고병',
        type: '병해',
        symptoms: '어린 묘가 갑자기 쓰러짐',
        prevention: '배수·파종 소독',
        treatment: '이병주 제거·토양 소독',
      },
    ],

    references: [
      { label: '농사로 - 시금치 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 깻잎 ═══════ */
  perilla: {
    id: 'perilla',
    name: '깻잎',
    scientificName: 'Perilla frutescens var. japonica',
    family: '꿀풀과',
    category: '엽채류',
    difficulty: '초급',
    totalDays: '정식 후 30~40일부터 수확',
    beginnerScore: 4,
    description: '한국인이 사랑하는 향채. 한번 자리 잡으면 수 개월간 수확 가능합니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '잎 향·생장', deficiency: '잎 황화·향 저하', rangePpm: '150~200' },
      { name: '인산', symbol: 'P', role: '뿌리', deficiency: '뿌리 부실', rangePpm: '40~60' },
      { name: '칼륨', symbol: 'K', role: '잎 품질', deficiency: '잎 연약', rangePpm: '180~220' },
      { name: '마그네슘', symbol: 'Mg', role: '엽록소', deficiency: '잎맥 사이 황화', rangePpm: '40~60' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '22~28°C', night: '16~20°C' },
        humidity: '60~75%',
        light: '15,000~20,000 lux · 야간 전조로 단일성 억제',
        ph: '6.0~6.8',
        ec: '1.5~2.0 mS/cm',
        watering: 'DFT 수경',
      },
      steps: [
        {
          title: '1단계 — 육묘',
          days: '파종 후 0~25일',
          description: '발아는 빠르나 초기 생장은 느립니다.',
          tasks: [
            '트레이 파종 25°C 발아',
            '본엽 4~5매까지 육묘',
            '약한 EC 1.0',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '파종 후 25~30일',
          description: '정식 직후부터 전조등 준수.',
          tasks: [
            '30cm × 30cm 간격',
            '야간 전조등 5시간 (꽃 억제)',
            'EC 1.5 유지',
          ],
          warning: '전조 안 하면 꽃 피고 잎 품질 급락',
        },
        {
          title: '3단계 — 수확',
          days: '정식 후 30일~',
          description: '연중 순차 수확.',
          tasks: [
            '하부 큰 잎부터 주 2~3회 수확',
            '생장점은 보호',
            '꽃대 발견 즉시 제거',
          ],
        },
      ],
      advantages: [
        '한 번 정식으로 6~8개월 수확',
        '연중 재배',
        '국내 수요 매우 높음',
      ],
      equipment: [
        '수경 베드',
        'LED + 전조등 (단일성 차단)',
        '양액기',
      ],
      notes: [
        '전조 관리가 핵심 (깻잎은 단일성 작물)',
        '평당 50~70만원 투자',
      ],
    },

    openField: {
      env: {
        temperature: { day: '22~28°C', night: '15~22°C' },
        humidity: '자연',
        light: '햇빛 충분',
        ph: '6.0~6.8',
        ec: '-',
        watering: '주 2~3회',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '정식 -14 ~ 0일',
          description: '배수 양호 사양토 선호.',
          tasks: [
            '완숙퇴비 3톤/10a',
            '이랑 폭 90cm',
            '멀칭 비닐 설치',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '5월 초~6월 초',
          description: '서리 지난 후 정식.',
          tasks: [
            '30cm × 40cm 간격',
            '정식 후 충분한 관수',
          ],
        },
        {
          title: '3단계 — 관리 및 수확',
          days: '정식 후 30~150일',
          description: '가을까지 순차 수확.',
          tasks: [
            '주 1회 잡초 제거',
            '하부 잎부터 수확',
            '가을 꽃대 나오면 수확 종료',
          ],
        },
      ],
      plantingMonths: '5월 초 ~ 6월 초',
      advantages: [
        '텃밭 인기 작물',
        '한 그루로 한 가정 충당',
        '다년간 씨앗 자가 채종 가능',
      ],
      notes: [
        '가을 꽃대 출현으로 수확 종료',
        '장마철 잎 곰팡이 주의',
      ],
    },

    beginnerTips: [
      '시설재배에서는 야간 전조등 필수',
      '텃밭에서는 봄 정식 후 가을까지 연속 수확',
      '큰 잎부터 따먹기 (생장점 보호)',
      '향이 강해 해충이 적은 편',
      '자가 채종으로 이듬해 종자 확보',
    ],

    pestsDiseases: [
      {
        name: '녹병',
        type: '병해',
        symptoms: '잎 뒷면 오렌지색 돌기',
        prevention: '통풍·밀식 방지',
        treatment: '이병엽 제거·살균제',
      },
      {
        name: '진딧물',
        type: '충해',
        symptoms: '신엽 군집',
        prevention: '황색 트랩',
        treatment: '물세척·친환경 살충제',
      },
      {
        name: '점박이응애',
        type: '충해',
        symptoms: '잎에 흰 반점·황화',
        prevention: '습도 유지',
        treatment: '물분무·천적',
      },
    ],

    references: [
      { label: '농사로 - 들깨(깻잎) 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 고추 ═══════ */
  pepper: {
    id: 'pepper',
    name: '고추',
    scientificName: 'Capsicum annuum',
    family: '가지과',
    category: '과채류',
    difficulty: '중급',
    totalDays: '정식 후 70~150일',
    beginnerScore: 3,
    description: '한국 밥상의 필수 작물. 정식 시기와 탄저병 관리가 관건입니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '생육', deficiency: '잎 황화·생육 저하', rangePpm: '150~200' },
      { name: '인산', symbol: 'P', role: '개화', deficiency: '화방 부실', rangePpm: '50~80' },
      { name: '칼륨', symbol: 'K', role: '과실 품질', deficiency: '과실 연함', rangePpm: '200~280' },
      { name: '칼슘', symbol: 'Ca', role: '과실', deficiency: '석과·끝썩음', rangePpm: '150~200' },
      { name: '마그네슘', symbol: 'Mg', role: '광합성', deficiency: '잎맥간 황화', rangePpm: '40~60' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '25~28°C', night: '18~22°C' },
        humidity: '60~70%',
        light: '20,000~25,000 lux',
        ph: '6.0~6.8',
        ec: '2.0~2.8 mS/cm',
        watering: '배지경 드립 관수',
      },
      steps: [
        {
          title: '1단계 — 육묘',
          days: '파종 후 0~60일',
          description: '장기 육묘가 필요합니다.',
          tasks: [
            '트레이 파종 25~28°C',
            '본엽 8~10매까지 육묘',
            '접목 활용 가능 (역병 저항성)',
          ],
        },
        {
          title: '2단계 — 정식 및 유인',
          days: '정식 0일',
          description: '지주 설치 필수.',
          tasks: [
            '50~60cm 간격',
            'EC 2.0 부터 시작',
            '지주·유인끈 설치',
          ],
        },
        {
          title: '3단계 — 개화·착과',
          days: '정식 후 30~60일',
          description: '첫 꽃 위치가 품질을 결정.',
          tasks: [
            '방아다리(첫 분지) 아래 곁순 제거',
            'EC 2.5 상향',
            '칼슘 엽면시비',
          ],
        },
        {
          title: '4단계 — 수확',
          days: '정식 후 60~150일',
          description: '풋고추·홍고추 구분 수확.',
          tasks: [
            '주 2~3회 수확',
            '과실 상처 주의',
          ],
        },
      ],
      advantages: [
        '장기 수확 (5~6개월)',
        '탄저병 발생 감소',
        '안정 생산',
      ],
      equipment: [
        '배지경 시스템',
        '지주·유인끈',
        '환경 제어기',
      ],
      notes: [
        '평당 70~100만원 투자',
        '탄저병 방제가 관건',
      ],
    },

    openField: {
      env: {
        temperature: { day: '22~28°C', night: '15~20°C' },
        humidity: '자연',
        light: '자연',
        ph: '6.0~6.8',
        ec: '-',
        watering: '주 2~3회',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '정식 -20 ~ 0일',
          description: '배수 양호 사양토.',
          tasks: [
            '완숙퇴비 3~5톤/10a',
            '석회로 pH 조정',
            '검은 멀칭 비닐',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '5월 초 (서리 지난 후)',
          description: '서리 위험 완전 제거 후.',
          tasks: [
            '50cm × 50cm 간격',
            '지주 동시 설치',
            '정식 후 충분한 관수',
          ],
          warning: '서리 1회면 전멸',
        },
        {
          title: '3단계 — 관리',
          days: '정식 후 30~120일',
          description: '탄저병 예방이 핵심.',
          tasks: [
            '방아다리 아래 곁순 제거',
            '장마 전 배수로 정비',
            '탄저병 예방 살균제 주기 살포',
          ],
          warning: '장마철 탄저병 폭발',
        },
        {
          title: '4단계 — 수확',
          days: '정식 후 60~150일',
          description: '풋·홍고추 구분.',
          tasks: [
            '주 2~3회 순차 수확',
            '홍고추는 햇볕 건조',
          ],
        },
      ],
      plantingMonths: '5월 초 ~ 5월 중순',
      advantages: [
        '한국 재래작물',
        '텃밭 인기',
        '자가 소비 가능',
      ],
      notes: [
        '장마철 탄저병 주의',
        '진딧물 바이러스 매개',
      ],
    },

    beginnerTips: [
      '서리 완전히 지난 5월 초에 정식',
      '지주 없으면 쓰러져 모두 실패',
      '방아다리 아래 곁순은 모두 제거',
      '장마 전 탄저병 예방 살포 필수',
      '칼슘 부족하면 끝이 썩음',
    ],

    pestsDiseases: [
      {
        name: '탄저병',
        type: '병해',
        symptoms: '과실에 검은 원형 병반',
        prevention: '배수·통풍, 예방 살포',
        treatment: '이병과 즉시 제거·살균제',
      },
      {
        name: '역병',
        type: '병해',
        symptoms: '줄기·뿌리 갈변, 시듦',
        prevention: '배수·접목묘 사용',
        treatment: '이병주 제거·토양 소독',
      },
      {
        name: '진딧물',
        type: '충해',
        symptoms: '신엽 군집, 바이러스 매개',
        prevention: '황색 트랩·천적',
        treatment: '물세척·친환경 살충제',
      },
    ],

    references: [
      { label: '농사로 - 고추 표준영농교본', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 오이 ═══════ */
  cucumber: {
    id: 'cucumber',
    name: '오이',
    scientificName: 'Cucumis sativus',
    family: '박과',
    category: '과채류',
    difficulty: '중급',
    totalDays: '정식 후 40~100일',
    beginnerScore: 3,
    description: '빠른 생장과 많은 수확량이 매력. 유인과 곁순 관리가 핵심입니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '생육', deficiency: '잎 황화', rangePpm: '150~220' },
      { name: '인산', symbol: 'P', role: '뿌리·개화', deficiency: '착과 부실', rangePpm: '50~70' },
      { name: '칼륨', symbol: 'K', role: '과실 품질', deficiency: '과실 기형', rangePpm: '200~280' },
      { name: '칼슘', symbol: 'Ca', role: '과실 조직', deficiency: '잎끝 갈변', rangePpm: '150~200' },
      { name: '마그네슘', symbol: 'Mg', role: '광합성', deficiency: '잎맥간 황화', rangePpm: '40~60' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '25~28°C', night: '16~20°C' },
        humidity: '70~80%',
        light: '15,000~25,000 lux',
        ph: '5.8~6.5',
        ec: '1.8~2.5 mS/cm',
        watering: '배지경 드립 관수',
      },
      steps: [
        {
          title: '1단계 — 육묘',
          days: '파종 후 0~30일',
          description: '빠른 육묘가 가능합니다.',
          tasks: [
            '트레이 파종 25°C',
            '본엽 4~5매까지 육묘',
            '접목묘 권장 (역병 저항성)',
          ],
        },
        {
          title: '2단계 — 정식 및 유인',
          days: '정식 0일',
          description: '끈 유인이 생명.',
          tasks: [
            '40~50cm 간격',
            '유인끈 설치',
            'EC 1.8 시작',
          ],
        },
        {
          title: '3단계 — 착과·수확',
          days: '정식 후 30~90일',
          description: '주 3~4회 수확.',
          tasks: [
            '곁순·덩굴손 제거',
            'EC 2.2~2.5 상향',
            '과실 20cm 시 수확',
            '과번무 방지 잎 정리',
          ],
          warning: '수확 늦으면 과실 곡과·품질 저하',
        },
      ],
      advantages: [
        '연 3~4회 작기 가능',
        '빠른 수익 회전',
        '수확량 많음',
      ],
      equipment: [
        '배지경 시스템',
        '유인끈·클립',
        '환경 제어기',
      ],
      notes: [
        '평당 70~100만원 투자',
        '흰가루병 방제 주의',
      ],
    },

    openField: {
      env: {
        temperature: { day: '22~28°C', night: '15~20°C' },
        humidity: '자연',
        light: '자연',
        ph: '6.0~6.5',
        ec: '-',
        watering: '주 3~4회',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '정식 -14 ~ 0일',
          description: '퇴비를 충분히.',
          tasks: [
            '완숙퇴비 5톤/10a',
            '이랑 폭 120cm',
            '검은 멀칭 비닐',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '4월 말 ~ 5월 초',
          description: '서리 지난 후.',
          tasks: [
            '50cm × 50cm 간격',
            '지주·유인망 설치',
          ],
        },
        {
          title: '3단계 — 관리·수확',
          days: '정식 후 30~80일',
          description: '주 3회 이상 수확.',
          tasks: [
            '덩굴 유인',
            '곁순 정리',
            '과실 20~25cm 시 수확',
          ],
        },
      ],
      plantingMonths: '4월 말 ~ 6월',
      advantages: [
        '수확량 풍부',
        '텃밭에서 인기',
        '단기 재배 가능',
      ],
      notes: [
        '수분 부족하면 쓴맛',
        '흰가루병 주의',
      ],
    },

    beginnerTips: [
      '유인망 없으면 과실이 비뚤어짐',
      '수확은 매일 확인 (하루 이틀만 늦어도 과숙)',
      '물 부족하면 쓴맛이 남',
      '곁순 제거로 영양 집중',
      '아침 저녁 수확이 품질 좋음',
    ],

    pestsDiseases: [
      {
        name: '흰가루병',
        type: '병해',
        symptoms: '잎에 흰 가루',
        prevention: '통풍·일조',
        treatment: '살균제·이병엽 제거',
      },
      {
        name: '노균병',
        type: '병해',
        symptoms: '잎에 다각형 황갈색 병반',
        prevention: '과습 방지',
        treatment: '이병엽 제거·살균제',
      },
      {
        name: '점박이응애',
        type: '충해',
        symptoms: '잎 뒷면 응애, 흰 반점',
        prevention: '습도 유지',
        treatment: '물분무·천적',
      },
    ],

    references: [
      { label: '농사로 - 오이 표준영농교본', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 방울토마토 ═══════ */
  'cherry-tomato': {
    id: 'cherry-tomato',
    name: '방울토마토',
    scientificName: 'Solanum lycopersicum var. cerasiforme',
    family: '가지과',
    category: '과채류',
    difficulty: '중급',
    totalDays: '정식 후 80~120일',
    beginnerScore: 4,
    description: '당도 높고 수확량 많은 인기 작물. 일반 토마토보다 관리 쉽습니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '생육', deficiency: '생장 저하', rangePpm: '150~200' },
      { name: '인산', symbol: 'P', role: '개화', deficiency: '화방 부실', rangePpm: '50~80' },
      { name: '칼륨', symbol: 'K', role: '당도', deficiency: '당도 저하', rangePpm: '220~320' },
      { name: '칼슘', symbol: 'Ca', role: '과실', deficiency: '배꼽썩음병', rangePpm: '150~200' },
      { name: '마그네슘', symbol: 'Mg', role: '광합성', deficiency: '잎맥간 황화', rangePpm: '40~60' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '22~28°C', night: '15~18°C' },
        humidity: '60~75%',
        light: '20,000~30,000 lux',
        ph: '5.8~6.5',
        ec: '2.5~3.5 mS/cm',
        watering: '배지경 드립 관수 (당도 조절)',
      },
      steps: [
        {
          title: '1단계 — 육묘',
          days: '파종 후 0~45일',
          description: '일반 토마토와 유사.',
          tasks: [
            '트레이 파종 25°C',
            '본엽 5~6매까지 육묘',
            '접목묘 권장',
          ],
        },
        {
          title: '2단계 — 정식 및 유인',
          days: '정식 0일',
          description: '끈 유인 필수.',
          tasks: [
            '40~50cm 간격',
            '유인끈 설치',
            'EC 2.5 시작',
          ],
        },
        {
          title: '3단계 — 개화·적심·수확',
          days: '정식 후 30~120일',
          description: '당도 올리려면 수분 조절.',
          tasks: [
            '곁순 주 2회 제거',
            'EC 3.0~3.5 로 상향 (당도 향상)',
            '화방당 10~15과 착과',
            '과실 80% 착색 시 수확',
          ],
          warning: 'EC 너무 높으면 과실 열과',
        },
      ],
      advantages: [
        '당도 10 브릭스 이상 가능',
        '수확량 많음',
        '장기 수확 (4~5개월)',
        '시장성 우수',
      ],
      equipment: [
        '배지경 시스템',
        '유인끈·클립',
        'EC/pH 정밀 제어',
      ],
      notes: [
        '평당 80~120만원 투자',
        '당도 관리가 매출 결정',
      ],
    },

    openField: {
      env: {
        temperature: { day: '22~28°C', night: '15~20°C' },
        humidity: '자연',
        light: '자연',
        ph: '6.0~6.5',
        ec: '-',
        watering: '주 2~3회',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '정식 -20 ~ 0일',
          description: '배수 양호 사양토.',
          tasks: [
            '완숙퇴비 4톤/10a',
            '검은 멀칭 비닐',
            '이랑 폭 100cm',
          ],
        },
        {
          title: '2단계 — 정식',
          days: '5월 초',
          description: '서리 지난 후.',
          tasks: [
            '50cm 간격',
            '지주 설치',
          ],
        },
        {
          title: '3단계 — 관리·수확',
          days: '정식 후 30~120일',
          description: '곁순 제거가 관건.',
          tasks: [
            '주 1~2회 곁순 제거',
            '익은 것부터 주 2~3회 수확',
            '장마 전 배수로 정비',
          ],
        },
      ],
      plantingMonths: '4월 말 ~ 5월 초',
      advantages: [
        '텃밭 인기 1순위',
        '한 그루로 수 백개 수확',
        '관리 단순',
      ],
      notes: [
        '장마철 열과 주의',
        '역병 주의',
      ],
    },

    beginnerTips: [
      '일반 토마토보다 초보자 친화적',
      '곁순 제거 주 1회는 필수',
      '수확 늦으면 떨어져 낭비',
      '화분에서도 재배 가능',
      '수분 과다하면 당도 떨어짐',
    ],

    pestsDiseases: [
      {
        name: '배꼽썩음병',
        type: '병해',
        symptoms: '과실 끝이 갈변·함몰',
        prevention: '칼슘 공급·수분 균일',
        treatment: '이병과 제거·칼슘 엽면시비',
      },
      {
        name: '잎곰팡이병',
        type: '병해',
        symptoms: '잎 뒷면 갈색 곰팡이',
        prevention: '습도 관리',
        treatment: '이병엽 제거·살균제',
      },
      {
        name: '온실가루이',
        type: '충해',
        symptoms: '잎 뒷면 백색 성충',
        prevention: '황색 트랩',
        treatment: '친환경 약제·천적',
      },
    ],

    references: [
      { label: '농사로 - 방울토마토 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 무 ═══════ */
  radish: {
    id: 'radish',
    name: '무',
    scientificName: 'Raphanus sativus',
    family: '십자화과',
    category: '근채류',
    difficulty: '초급',
    totalDays: '파종 후 50~90일',
    beginnerScore: 4,
    description: '김장철 필수 작물. 서늘한 기후와 깊은 토심을 좋아합니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '잎 생장', deficiency: '잎 황화', rangePpm: '120~180' },
      { name: '인산', symbol: 'P', role: '뿌리 비대', deficiency: '뿌리 부실', rangePpm: '50~80' },
      { name: '칼륨', symbol: 'K', role: '뿌리 품질', deficiency: '뿌리 연약·바람들이', rangePpm: '200~260' },
      { name: '칼슘', symbol: 'Ca', role: '조직', deficiency: '뿌리 갈라짐', rangePpm: '150~200' },
      { name: '붕소', symbol: 'B', role: '뿌리 조직', deficiency: '뿌리 흑심', rangePpm: '0.3~0.5' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '18~22°C', night: '10~15°C' },
        humidity: '60~70%',
        light: '12,000~18,000 lux',
        ph: '5.8~6.8',
        ec: '1.5~2.0 mS/cm',
        watering: '배지경 또는 심수 수경',
      },
      steps: [
        {
          title: '1단계 — 파종',
          days: '0~7일',
          description: '이식 불가 — 직파 전용.',
          tasks: [
            '심토 30cm 이상 확보된 베드',
            '파종 깊이 1~2cm',
            '20°C 발아',
          ],
          warning: '뿌리가 곧은 작물이라 이식 금지',
        },
        {
          title: '2단계 — 솎음',
          days: '파종 후 10~20일',
          description: '솎음이 품질을 결정.',
          tasks: [
            '본엽 2매 시 1차 솎음',
            '본엽 5~6매 시 최종 20cm 간격',
            'EC 1.5 유지',
          ],
        },
        {
          title: '3단계 — 비대 및 수확',
          days: '파종 후 40~70일',
          description: '뿌리 비대기 수분 균일.',
          tasks: [
            'EC 1.8~2.0',
            '수분 균일 공급 (갈라짐 방지)',
            '뿌리 지름 7cm 이상 시 수확',
          ],
        },
      ],
      advantages: [
        '심토 확보 시 연중 재배',
        '품질 균일',
      ],
      equipment: [
        '심토 30cm 이상 베드',
        '환경 제어기',
      ],
      notes: [
        '일반적으로 시설재배 효율 낮음',
        '주로 노지 재배 권장',
      ],
    },

    openField: {
      env: {
        temperature: { day: '17~22°C', night: '8~15°C' },
        humidity: '자연',
        light: '자연',
        ph: '5.8~6.8',
        ec: '-',
        watering: '주 2~3회',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '파종 -21 ~ 0일',
          description: '깊이 갈이가 핵심.',
          tasks: [
            '심경 30cm 이상',
            '완숙퇴비 3톤/10a',
            '돌·자갈 제거 (뿌리 갈라짐 방지)',
            '이랑 폭 90cm',
          ],
          warning: '미숙퇴비 금지 — 뿌리 기형 유발',
        },
        {
          title: '2단계 — 파종',
          days: '8월 하순 ~ 9월 초 (가을)',
          description: '가을 재배가 일반적.',
          tasks: [
            '조간 40cm, 주간 25cm',
            '점파 3~5립',
            '파종 후 충분한 관수',
          ],
        },
        {
          title: '3단계 — 솎음·관리',
          days: '파종 후 10~40일',
          description: '솎음과 북주기.',
          tasks: [
            '1차·2차 솎음 (최종 1본)',
            '북주기로 어깨 녹화 방지',
            '배추흰나비 방제',
          ],
        },
        {
          title: '4단계 — 수확',
          days: '파종 후 60~90일',
          description: '서리 전 수확.',
          tasks: [
            '뿌리 지름 7~8cm 수확',
            '잎 짧게 절단 후 저장',
          ],
        },
      ],
      plantingMonths: '3~4월 (봄무) / 8월 하순~9월 초 (김장무)',
      advantages: [
        '김장철 수요 안정',
        '저장성 우수',
        '텃밭 적합',
      ],
      notes: [
        '토심 얕으면 기형',
        '고온기 재배 불리',
      ],
    },

    beginnerTips: [
      '이식 불가 — 반드시 직파',
      '돌 많은 땅은 뿌리가 갈라짐',
      '솎음은 단호하게 (한 곳에 한 개)',
      '가을 재배가 실패 적음',
      '수분 균일해야 갈라지지 않음',
    ],

    pestsDiseases: [
      {
        name: '무사마귀병',
        type: '병해',
        symptoms: '뿌리 혹 발생·시듦',
        prevention: '연작 회피·석회 시비',
        treatment: '이병주 폐기·토양 소독',
      },
      {
        name: '배추흰나비 애벌레',
        type: '충해',
        symptoms: '잎 갉아먹힘',
        prevention: '방충망·알 제거',
        treatment: '수작업 제거·BT제',
      },
      {
        name: '뿌리파리',
        type: '충해',
        symptoms: '뿌리에 작은 구멍',
        prevention: '토양 건조 관리',
        treatment: '친환경 토양 약제',
      },
    ],

    references: [
      { label: '농사로 - 무 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 당근 ═══════ */
  carrot: {
    id: 'carrot',
    name: '당근',
    scientificName: 'Daucus carota subsp. sativus',
    family: '미나리과',
    category: '근채류',
    difficulty: '중급',
    totalDays: '파종 후 90~120일',
    beginnerScore: 3,
    description: '발아와 솎음이 관건. 토심이 깊고 부드러운 토양이 필수입니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '잎 생장', deficiency: '잎 황화', rangePpm: '100~150' },
      { name: '인산', symbol: 'P', role: '뿌리 발달', deficiency: '뿌리 부실', rangePpm: '50~80' },
      { name: '칼륨', symbol: 'K', role: '뿌리 품질·당도', deficiency: '뿌리 연약', rangePpm: '200~260' },
      { name: '칼슘', symbol: 'Ca', role: '조직', deficiency: '뿌리 갈라짐', rangePpm: '150~200' },
      { name: '붕소', symbol: 'B', role: '뿌리 조직', deficiency: '뿌리 흑심', rangePpm: '0.3~0.5' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '18~22°C', night: '10~15°C' },
        humidity: '60~70%',
        light: '12,000~18,000 lux',
        ph: '6.0~6.8',
        ec: '1.2~1.8 mS/cm',
        watering: '심토 베드 관수',
      },
      steps: [
        {
          title: '1단계 — 파종',
          days: '0~15일',
          description: '발아에 시간 걸림.',
          tasks: [
            '심토 40cm 이상 베드',
            '파종 깊이 1cm',
            '발아까지 표면 촉촉 유지',
            '발아 10~14일',
          ],
          warning: '표면 마르면 발아율 급감',
        },
        {
          title: '2단계 — 솎음',
          days: '파종 후 20~40일',
          description: '최종 간격 10cm.',
          tasks: [
            '본엽 2매 1차 솎음',
            '본엽 5매 최종 10cm',
            'EC 1.5 유지',
          ],
        },
        {
          title: '3단계 — 비대 및 수확',
          days: '파종 후 60~110일',
          description: '수분 균일이 핵심.',
          tasks: [
            '수분 균일 관리',
            '뿌리 지름 3cm 이상 수확',
          ],
        },
      ],
      advantages: [
        '연중 재배 가능',
        '품질 균일',
      ],
      equipment: [
        '심토 40cm 이상 베드',
        '환경 제어기',
      ],
      notes: [
        '시설재배 효율 낮음 — 대부분 노지',
      ],
    },

    openField: {
      env: {
        temperature: { day: '18~22°C', night: '10~15°C' },
        humidity: '자연',
        light: '자연',
        ph: '6.0~6.8',
        ec: '-',
        watering: '주 2~3회, 발아기 매일',
      },
      steps: [
        {
          title: '1단계 — 밭 준비',
          days: '파종 -30 ~ 0일',
          description: '깊이 갈이·돌 제거.',
          tasks: [
            '심경 30~40cm',
            '완숙퇴비 2톤/10a (미숙퇴비 금지)',
            '돌·자갈 철저히 제거',
            '이랑 폭 90cm',
          ],
          warning: '미숙퇴비는 뿌리 기형의 최대 원인',
        },
        {
          title: '2단계 — 파종',
          days: '3~4월 (봄) / 7~8월 (가을)',
          description: '발아까지 관수 필수.',
          tasks: [
            '조간 20cm 점파',
            '파종 후 짚 덮기',
            '발아까지 매일 관수',
          ],
        },
        {
          title: '3단계 — 솎음·관리',
          days: '파종 후 20~60일',
          description: '2~3회 솎음.',
          tasks: [
            '최종 10cm 간격',
            '잡초 제거 (초기 필수)',
            '어깨 녹화 방지 북주기',
          ],
        },
        {
          title: '4단계 — 수확',
          days: '파종 후 90~120일',
          description: '지상부 잎 아래 뿌리 확인.',
          tasks: [
            '뿌리 지름 3~4cm 시 수확',
            '잎 짧게 자르고 저장',
          ],
        },
      ],
      plantingMonths: '3~4월 / 7~8월',
      advantages: [
        '저장성 우수',
        '시장 수요 안정',
      ],
      notes: [
        '발아 실패율 높음',
        '토양 준비에 따라 품질 좌우',
      ],
    },

    beginnerTips: [
      '발아까지 10~14일 — 인내가 필요',
      '돌 많은 땅은 포기 (뿌리 갈라짐)',
      '솎음은 과감하게 — 붙어있으면 모두 부실',
      '미숙퇴비 절대 금지',
      '잡초에 약해 초기 관리 중요',
    ],

    pestsDiseases: [
      {
        name: '검은잎마름병',
        type: '병해',
        symptoms: '잎 가장자리 갈변',
        prevention: '통풍·건조 관리',
        treatment: '이병엽 제거·살균제',
      },
      {
        name: '당근뿌리혹선충',
        type: '충해',
        symptoms: '뿌리에 혹·기형',
        prevention: '연작 회피·토양 소독',
        treatment: '이병주 폐기',
      },
      {
        name: '진딧물',
        type: '충해',
        symptoms: '잎 군집',
        prevention: '황색 트랩',
        treatment: '물세척·친환경 약제',
      },
    ],

    references: [
      { label: '농사로 - 당근 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },

  /* ═══════ 민트 ═══════ */
  mint: {
    id: 'mint',
    name: '민트',
    scientificName: 'Mentha spp.',
    family: '꿀풀과',
    category: '허브류',
    difficulty: '초급',
    totalDays: '정식 후 40~60일부터 수확',
    beginnerScore: 5,
    description: '한 번 심으면 끝없이 자라는 강인한 허브. 번식력이 매우 강합니다.',

    nutrients: [
      { name: '질소', symbol: 'N', role: '잎 향기', deficiency: '잎 황화·향 저하', rangePpm: '120~180' },
      { name: '인산', symbol: 'P', role: '뿌리', deficiency: '뿌리 부실', rangePpm: '30~50' },
      { name: '칼륨', symbol: 'K', role: '향 성분', deficiency: '향 저하', rangePpm: '180~220' },
      { name: '마그네슘', symbol: 'Mg', role: '엽록소', deficiency: '잎맥간 황화', rangePpm: '40~60' },
    ],

    smartFarm: {
      env: {
        temperature: { day: '20~25°C', night: '15~18°C' },
        humidity: '60~75%',
        light: '12,000~18,000 lux',
        ph: '6.0~7.0',
        ec: '1.2~1.8 mS/cm',
        watering: 'NFT/DFT 수경',
      },
      steps: [
        {
          title: '1단계 — 삽목 또는 정식',
          days: '0~15일',
          description: '종자보다 삽목·포기나누기가 안전.',
          tasks: [
            '10cm 줄기 삽목',
            '물꽂이 뿌리 발생 후 정식',
            '또는 포기나누기 묘 정식',
            'EC 1.0',
          ],
        },
        {
          title: '2단계 — 본 생육',
          days: '15~40일',
          description: '빠른 생장.',
          tasks: [
            '25cm × 25cm 간격',
            'EC 1.5 유지',
            '주 1회 생장점 적심 (분지 유도)',
          ],
        },
        {
          title: '3단계 — 수확',
          days: '40일~',
          description: '연중 수확 가능.',
          tasks: [
            '윗 순 10cm 절단 수확',
            '꽃대 발견 즉시 제거',
            '월 2~3회 수확',
          ],
        },
      ],
      advantages: [
        '한 번 정식으로 수년간 수확',
        '실패율 거의 없음',
        '카페·음료 납품 수요',
      ],
      equipment: [
        '수경 베드',
        'LED 식물등',
      ],
      notes: [
        '번식력 강함 — 구획 관리 필요',
        '평당 30~50만원',
      ],
    },

    openField: {
      env: {
        temperature: { day: '18~25°C', night: '12~18°C' },
        humidity: '자연',
        light: '반그늘 가능',
        ph: '6.0~7.0',
        ec: '-',
        watering: '주 2회',
      },
      steps: [
        {
          title: '1단계 — 심기',
          days: '4~6월',
          description: '포기나누기 또는 삽목 묘.',
          tasks: [
            '완숙퇴비 2톤/10a',
            '30cm 간격',
            '반그늘·배수 양호한 곳',
          ],
          warning: '뿌리가 사방으로 뻗어 밭 전체 점령',
        },
        {
          title: '2단계 — 관리',
          days: '정식 후 20~150일',
          description: '잡초처럼 강건.',
          tasks: [
            '주 1회 잡초 제거',
            '꽃대 제거 (향 유지)',
            '포기 확장 방지를 위해 화분 매립 권장',
          ],
        },
        {
          title: '3단계 — 수확',
          days: '정식 후 40일~',
          description: '수시로 수확.',
          tasks: [
            '윗 순 10cm 절단',
            '수확할수록 무성해짐',
          ],
        },
      ],
      plantingMonths: '4월 ~ 6월',
      advantages: [
        '화분·텃밭 모두 가능',
        '겨울철 지상부 고사 후 봄에 재생',
        '관리가 거의 불필요',
      ],
      notes: [
        '뿌리가 너무 퍼짐 — 격리 심기 권장',
        '여름 고온기 향 저하',
      ],
    },

    beginnerTips: [
      '포기나누기나 삽목이 가장 쉬움 (종자 비추천)',
      '화분 매립으로 번식 통제',
      '꽃 피면 잎이 뻣뻣해짐 — 꽃대 제거',
      '수확할수록 풍성해지니 자주 잘라내기',
      '겨울에 지상부 말라도 뿌리는 살아있음',
    ],

    pestsDiseases: [
      {
        name: '녹병',
        type: '병해',
        symptoms: '잎 뒷면 오렌지색 돌기',
        prevention: '통풍·배수',
        treatment: '이병엽 제거·살균제',
      },
      {
        name: '응애',
        type: '충해',
        symptoms: '잎에 흰 반점',
        prevention: '습도 유지',
        treatment: '물분무·천적',
      },
    ],

    references: [
      { label: '농사로 - 허브 재배법', url: 'https://www.nongsaro.go.kr' },
    ],
  },
};

/* 인덱스·헬퍼 */
export function getGrowingGuide(cropId: string): CropGrowingGuide | undefined {
  return GROWING_GUIDES[cropId];
}

export function getAvailableGuideIds(): string[] {
  return Object.keys(GROWING_GUIDES);
}

export const DIFFICULTY_META: Record<Difficulty, { color: string; bg: string; icon: string }> = {
  '초급': { color: 'text-emerald-700', bg: 'bg-emerald-100 border-emerald-200', icon: 'ri-seedling-line' },
  '중급': { color: 'text-amber-700',   bg: 'bg-amber-100 border-amber-200',     icon: 'ri-plant-line' },
  '고급': { color: 'text-red-700',     bg: 'bg-red-100 border-red-200',         icon: 'ri-medal-line' },
};
