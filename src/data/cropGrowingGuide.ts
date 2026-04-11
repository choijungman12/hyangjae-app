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
