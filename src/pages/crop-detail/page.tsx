import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import { useScrollY } from '@/hooks/useScrollY';
import { CROP_VISUAL } from '@/data/crops';

export default function CropDetail() {
  const [searchParams] = useSearchParams();
  const cropId = searchParams.get('id') || 'wasabi';
  const scrollY = useScrollY();
  const [activeTab, setActiveTab] = useState('overview');

  const cropData: Record<string, any> = {
    wasabi: {
      name: '고추냉이 (와사비)',
      scientificName: 'Wasabia japonica',
      category: 'herb',
      image: '',
      overview: {
        description: '고추냉이는 일본 요리의 필수 향신료로, 국내에서도 고급 식자재로 인정을 받고 있습니다. 서늘하고 습한 환경을 좋아하며, 재배하기 매우 어려워 수익률이 우수한 작물 입니다.',
        origin: '한국 국산',
        cultivationDifficulty: '높음',
        profitability: '매우 높음',
        marketDemand: '높음'
      },
      seedling: {
        price: '2,000-3,000원/주',
        supplier: '전문 종묘장, 농업기술센터',
        plantingDensity: '3,000-5,000주/500㎡',
        bestSeason: '봄(3-4월), 가을(9-10월)',
        description: '건강한 종묘 선택이 중요하며, 뿌리가 튼튼하고 잎이 싱싱한 것을 선택해야 합니다.'
      },
      cultivation: {
        period: '18-24개월',
        stages: [
          { stage: '정식기', duration: '0-2개월', description: '종묘 정식 후 활착 기간' },
          { stage: '생육초기', duration: '2-6개월', description: '뿌리 발달 및 잎 성장' },
          { stage: '생육중기', duration: '6-12개월', description: '근경 비대 시작' },
          { stage: '생육후기', duration: '12-18개월', description: '근경 본격 비대' },
          { stage: '수확기', duration: '18-24개월', description: '상품성 있는 크기 도달' }
        ],
        environment: {
          temperature: '15-18°C (최적 생육 온도)',
          humidity: '70-80% (높은 습도 필수)',
          light: '50-60% 차광 (직사광선 피함)',
          water: '깨끗한 유수 또는 정기적 관수',
          soil: 'pH 6.0-6.5, 배수 양호한 사질양토'
        },
        keyPoints: [
          '온도 관리가 가장 중요 (20°C 이상 시 생육 불량)',
          '높은 습도 유지 필수 (건조 시 품질 저하)',
          '깨끗한 물 공급 (오염된 물 사용 금지)',
          '차광 시설 필수 (직사광선 노출 시 잎 손상)',
          '병해충 예방 관리 (무름병, 진딧물 주의)'
        ]
      },
      harvest: {
        period: '18-24개월 후',
        yield: '250-400g/주',
        quality: [
          { grade: '특', size: '100g 이상', price: '150,000-200,000원/kg' },
          { grade: '상', size: '70-100g', price: '100,000-150,000원/kg' },
          { grade: '중', size: '50-70g', price: '70,000-100,000원/kg' },
          { grade: '하', size: '50g 미만', price: '40,000-70,000원/kg' }
        ],
        method: '뿌리를 조심스럽게 캐내어 잎을 제거하고 세척',
        storage: '냉장 보관 (2-5°C), 습도 유지'
      },
      sales: {
        channels: [
          {
            name: '작목반 공동 판매',
            price: '80,000-120,000원/kg',
            pros: '안정적 판로, 대량 판매 가능',
            cons: '중간 마진 발생, 가격 협상력 낮음',
            description: '지역 작목반을 통한 공동 선별 및 판매. 가장 안정적인 판매 방법입니다.'
          },
          {
            name: '직거래 (음식점)',
            price: '100,000-150,000원/kg',
            pros: '높은 수익, 직접 가격 결정',
            cons: '판로 개척 필요, 소량 거래',
            description: '일식당, 고급 레스토랑 등에 직접 납품. 품질 관리가 중요합니다.'
          },
          {
            name: '온라인 판매',
            price: '120,000-180,000원/kg',
            pros: '최고 수익, 브랜드 구축 가능',
            cons: '마케팅 필요, 배송 관리',
            description: '스마트스토어, 쿠팡 등 온라인 플랫폼 활용. 소비자 직거래로 최고 수익 가능.'
          },
          {
            name: '가공품 제조',
            price: '가공품 가격 별도',
            pros: '부가가치 창출, 저장성 향상',
            cons: '가공 시설 필요, 인증 필요',
            description: '와사비 페이스트, 분말 등으로 가공하여 판매. 장기 보관 가능.'
          }
        ],
        marketInfo: {
          mainBuyers: '일식당, 고급 레스토랑, 식자재 유통업체',
          peakSeason: '연중 (특히 여름철 수요 증가)',
          competition: '국내 재배 농가 적어 경쟁 낮음',
          import: '일본산 수입품과 경쟁 (국산 선호도 높음)'
        }
      },
      economics: {
        investment: {
          facility: '20,000,000-30,000,000원 (500㎡ 기준)',
          seedling: '6,000,000-15,000,000원 (3,000-5,000주)',
          equipment: '3,000,000-5,000,000원',
          total: '29,000,000-50,000,000원'
        },
        annualCost: {
          electricity: '1,800,000원',
          labor: '36,000,000원',
          nutrient: '2,400,000원',
          maintenance: '2,000,000원',
          tax: '1,800,000원',
          total: '44,000,000원'
        },
        revenue: {
          yield: '900-1,500kg (3,000주 기준)',
          price: '100,000원/kg (평균)',
          total: '90,000,000-150,000,000원'
        },
        profit: {
          firstYear: '-44,000,000원 (투자 회수 기간)',
          secondYear: '46,000,000-106,000,000원',
          roi: '100-200% (2년차 기준)'
        }
      },
      tips: [
        '초기 투자 비용이 크므로 정부 지원 사업 활용 권장',
        '재배 기술 습득을 위한 교육 프로그램 참여 필수',
        '판로 확보 후 재배 시작 권장 (계약 재배)',
        '소규모로 시작하여 경험 축적 후 확대',
        '작목반 가입으로 기술 교류 및 판로 확보',
        '품질 관리가 수익성에 직결되므로 세심한 관리 필요'
      ],
      risks: [
        '재배 난이도가 높아 초보자에게 어려움',
        '온도 관리 실패 시 전량 손실 가능',
        '병해 발생 시 빠른 확산으로 피해 큼',
        '수확까지 2년 소요로 자금 회전 느림',
        '시장 가격 변동 위험'
      ]
    },
    basil: {
      name: '바질',
      scientificName: 'Ocimum basilicum',
      category: 'herb',
      image: '',
      overview: {
        description: '바질은 이탈리아 요리의 필수 허브로, 국내에서도 수요가 꾸준히 증가하고 있습니다. 재배가 비교적 쉽고 회전율이 빨라 초보자도 도전하기 좋은 작물입니다.',
        origin: '한국 국산',
        cultivationDifficulty: '낮음',
        profitability: '높음',
        marketDemand: '높음'
      },
      seedling: {
        price: '500-1,000원/주',
        supplier: '종묘장, 온라인 쇼핑몰, 농협',
        plantingDensity: '5,000-8,000주/500㎡',
        bestSeason: '봄(3-5월), 여름(6-8월)',
        description: '건강한 묘목을 선택하고, 뿌리가 잘 발달된 것을 선택합니다.'
      },
      cultivation: {
        period: '2-3개월',
        stages: [
          { stage: '정식기', duration: '0-1주', description: '묘목 정식 및 활착' },
          { stage: '생육초기', duration: '1-3주', description: '잎 성장 시작' },
          { stage: '생육중기', duration: '3-6주', description: '본격적인 잎 성장' },
          { stage: '수확기', duration: '6주 이후', description: '지속적 수확 가능' }
        ],
        environment: {
          temperature: '20-25°C (최적 생육 온도)',
          humidity: '60-70% (적정 습도)',
          light: '충분한 일조량 필요 (하루 6-8시간)',
          water: '토양이 마르지 않도록 정기적 관수',
          soil: 'pH 6.0-7.0, 배수 양호한 토양'
        },
        keyPoints: [
          '충분한 일조량 확보가 중요',
          '과습 방지 (뿌리 썩음 주의)',
          '정기적인 순지르기로 측지 발달 유도',
          '꽃대 제거로 잎 생산 지속',
          '진딧물, 응애 등 해충 관리'
        ]
      },
      harvest: {
        period: '정식 후 6-8주',
        yield: '150-200g/주 (연간)',
        quality: [
          { grade: '특', size: '잎 크기 5cm 이상', price: '15,000-20,000원/kg' },
          { grade: '상', size: '잎 크기 3-5cm', price: '10,000-15,000원/kg' },
          { grade: '중', size: '잎 크기 2-3cm', price: '7,000-10,000원/kg' }
        ],
        method: '아침 일찍 수확, 줄기 상단부 잎 채취',
        storage: '냉장 보관 (5-10°C), 습도 유지'
      },
      sales: {
        channels: [
          {
            name: '대형마트 납품',
            price: '8,000-12,000원/kg',
            pros: '안정적 판로, 대량 판매',
            cons: '낮은 가격, 품질 기준 엄격',
            description: '대형마트 신선식품 코너에 정기 납품. 안정적이지만 가격이 낮습니다.'
          },
          {
            name: '레스토랑 직거래',
            price: '12,000-18,000원/kg',
            pros: '높은 수익, 신선도 유지',
            cons: '판로 개척 필요',
            description: '이탈리안 레스토랑, 카페 등에 직접 납품. 신선도가 중요합니다.'
          },
          {
            name: '온라인 판매',
            price: '15,000-25,000원/kg',
            pros: '최고 수익, 소비자 직거래',
            cons: '배송 관리, 마케팅 필요',
            description: '신선한 허브를 소비자에게 직접 판매. 포장과 배송이 중요합니다.'
          },
          {
            name: '로컬푸드 직매장',
            price: '10,000-15,000원/kg',
            pros: '지역 판로, 신선도 유지',
            cons: '판매량 제한',
            description: '지역 로컬푸드 매장을 통한 판매. 신선도가 장점입니다.'
          }
        ],
        marketInfo: {
          mainBuyers: '카페, 음료 전문점, 대형마트, 개인 소비자',
          peakSeason: '여름철 (6-8월)',
          competition: '재배 농가 증가 추세',
          import: '수입산과 경쟁 (신선도 차별화)'
        }
      },
      economics: {
        investment: {
          facility: '10,000,000-15,000,000원 (500㎡ 기준)',
          seedling: '2,500,000-8,000,000원 (5,000-8,000주)',
          equipment: '2,000,000-3,000,000원',
          total: '14,500,000-26,000,000원'
        },
        annualCost: {
          electricity: '1,200,000원',
          labor: '24,000,000원',
          nutrient: '1,800,000원',
          maintenance: '1,500,000원',
          tax: '1,200,000원',
          total: '29,700,000원'
        },
        revenue: {
          yield: '900-1,200kg (6,000주 기준, 연 8회 수확)',
          price: '10,000원/kg (평균)',
          total: '9,000,000-12,000,000원 (연간)'
        },
        profit: {
          firstYear: '-20,700,000원 (투자 회수 기간)',
          secondYear: '-17,700,000~-17,700,000원',
          roi: '회전율 높아 2-3년차 수익 개선'
        }
      },
      tips: [
        '회전율이 빠르므로 연중 재배 가능',
        '다양한 품종 재배로 차별화 (스위트바질, 레몬바질 등)',
        '판로 확보 후 재배 규모 확대',
        '신선도 유지가 가격 경쟁력의 핵심',
        '가공품 개발로 부가가치 창출 (바질 페스토 등)',
        '소규모 시작으로 경험 축적'
      ],
      risks: [
        '여름철 고온 다습 시 병해 발생',
        '겨울철 난방비 증가',
        '시장 가격 변동성',
        '신선도 유지 어려움',
        '경쟁 농가 증가'
      ]
    },
    mint: {
      name: '민트',
      scientificName: 'Mentha',
      category: 'herb',
      image: '',
      overview: {
        description: '민트는 청량감 있는 향으로 음료, 디저트, 요리에 널리 사용되는 허브입니다. 생명력이 강하고 재배가 쉬워 초보자에게 적합하며, 다양한 용도로 활용 가능합니다.',
        origin: '한국 국산',
        cultivationDifficulty: '매우 낮음',
        profitability: '중간',
        marketDemand: '중간'
      },
      seedling: {
        price: '300-800원/주',
        supplier: '종묘장, 온라인, 농협',
        plantingDensity: '6,000-10,000주/500㎡',
        bestSeason: '봄(3-5월), 가을(9-10월)',
        description: '생명력이 강해 삽목으로도 쉽게 번식 가능합니다.'
      },
      cultivation: {
        period: '2-3개월',
        stages: [
          { stage: '정식기', duration: '0-1주', description: '묘목 정식 및 활착' },
          { stage: '생육초기', duration: '1-3주', description: '뿌리 발달 및 잎 성장' },
          { stage: '생육중기', duration: '3-6주', description: '왕성한 생장' },
          { stage: '수확기', duration: '6주 이후', description: '지속적 수확' }
        ],
        environment: {
          temperature: '15-25°C (최적 생육 온도)',
          humidity: '60-70% (적정 습도)',
          light: '반그늘~양지 (하루 4-6시간)',
          water: '충분한 수분 공급 (과습 주의)',
          soil: 'pH 6.0-7.5, 배수 양호한 토양'
        },
        keyPoints: [
          '생명력이 강해 관리가 쉬움',
          '과도한 번식 방지 관리 필요',
          '정기적인 수확으로 생육 촉진',
          '통풍 관리로 병해 예방',
          '겨울철 보온 관리'
        ]
      },
      harvest: {
        period: '정식 후 6-8주',
        yield: '180-250g/주 (연간)',
        quality: [
          { grade: '특', size: '잎 크기 4cm 이상', price: '12,000-18,000원/kg' },
          { grade: '상', size: '잎 크기 2-4cm', price: '8,000-12,000원/kg' },
          { grade: '중', size: '잎 크기 2cm 미만', price: '5,000-8,000원/kg' }
        ],
        method: '아침 일찍 수확, 줄기째 채취',
        storage: '냉장 보관 (5-10°C), 물에 담가 보관'
      },
      sales: {
        channels: [
          {
            name: '음료 전문점',
            price: '10,000-15,000원/kg',
            pros: '안정적 수요, 정기 납품',
            cons: '품질 기준 엄격',
            description: '카페, 주스바 등에 신선한 민트 납품. 모히토, 민트티 등에 사용됩니다.'
          },
          {
            name: '대형마트',
            price: '7,000-10,000원/kg',
            pros: '대량 판매 가능',
            cons: '낮은 가격',
            description: '대형마트 신선식품 코너 납품. 안정적이지만 가격이 낮습니다.'
          },
          {
            name: '온라인 판매',
            price: '12,000-20,000원/kg',
            pros: '높은 수익, 직거래',
            cons: '배송 관리 필요',
            description: '신선한 허브를 소비자에게 직접 판매. 포장이 중요합니다.'
          },
          {
            name: '가공품 제조',
            price: '가공품 가격 별도',
            pros: '부가가치 창출',
            cons: '가공 시설 필요',
            description: '민트 오일, 건조 민트 등으로 가공. 저장성이 향상됩니다.'
          }
        ],
        marketInfo: {
          mainBuyers: '카페, 음료 전문점, 대형마트, 개인 소비자',
          peakSeason: '여름철 (6-8월)',
          competition: '재배 농가 많음',
          import: '수입산과 경쟁 (신선도 차별화)'
        }
      },
      economics: {
        investment: {
          facility: '8,000,000-12,000,000원 (500㎡ 기준)',
          seedling: '1,800,000-8,000,000원 (6,000-10,000주)',
          equipment: '1,500,000-2,500,000원',
          total: '11,300,000-22,500,000원'
        },
        annualCost: {
          electricity: '1,000,000원',
          labor: '20,000,000원',
          nutrient: '1,500,000원',
          maintenance: '1,200,000원',
          tax: '1,000,000원',
          total: '24,700,000원'
        },
        revenue: {
          yield: '1,200-1,800kg (8,000주 기준, 연 8회 수확)',
          price: '9,000원/kg (평균)',
          total: '10,800,000-16,200,000원'
        },
        profit: {
          firstYear: '-13,900,000원 (투자 회수 기간)',
          secondYear: '-13,900,000~-8,500,000원',
          roi: '3년차부터 수익 개선'
        }
      },
      tips: [
        '생명력이 강해 초보자에게 적합',
        '다양한 품종 재배 (페퍼민트, 스피아민트 등)',
        '가공품 개발로 수익성 향상',
        '음료 전문점과 계약 재배 권장',
        '겨울철 보온 관리로 연중 생산',
        '삽목으로 종묘비 절감 가능'
      ],
      risks: [
        '과도한 번식으로 관리 어려움',
        '시장 가격 변동성',
        '여름철 병해 발생 가능',
        '경쟁 농가 많음',
        '신선도 유지 어려움'
      ]
    },
    perilla: {
      name: '깻잎',
      scientificName: 'Perilla frutescens var. japonica',
      category: 'herb',
      image: '',
      overview: {
        description: '깻잎은 한국인이 가장 사랑하는 쌈 채소로, 국내 수요가 매우 높습니다. 재배가 비교적 쉽고 수익성이 안정적이며, 연중 재배가 가능한 작물입니다.',
        origin: '한국 국산',
        cultivationDifficulty: '낮음',
        profitability: '높음',
        marketDemand: '매우 높음'
      },
      seedling: {
        price: '400-800원/주',
        supplier: '종묘장, 농협, 온라인',
        plantingDensity: '5,000-7,000주/500㎡',
        bestSeason: '봄(3-5월), 가을(9-10월)',
        description: '건강한 묘목을 선택하고, 병해충이 없는 것을 선택합니다.'
      },
      cultivation: {
        period: '2-3개월',
        stages: [
          { stage: '정식기', duration: '0-1주', description: '묘목 정식 및 활착' },
          { stage: '생육초기', duration: '1-3주', description: '잎 성장 시작' },
          { stage: '생육중기', duration: '3-6주', description: '본격적인 잎 생산' },
          { stage: '수확기', duration: '6주 이후', description: '지속적 수확' }
        ],
        environment: {
          temperature: '20-28°C (최적 생육 온도)',
          humidity: '60-70% (적정 습도)',
          light: '충분한 일조량 (하루 6-8시간)',
          water: '토양이 마르지 않도록 관수',
          soil: 'pH 6.0-7.0, 배수 양호한 토양'
        },
        keyPoints: [
          '충분한 일조량 확보',
          '정기적인 순지르기로 측지 발달',
          '꽃대 제거로 잎 생산 지속',
          '진딧물, 응애 등 해충 관리',
          '적정 온도 유지 (고온 주의)'
        ]
      },
      harvest: {
        period: '정식 후 6-8주',
        yield: '200-300g/주 (연간)',
        quality: [
          { grade: '특', size: '잎 크기 10cm 이상', price: '12,000-18,000원/kg' },
          { grade: '상', size: '잎 크기 7-10cm', price: '8,000-12,000원/kg' },
          { grade: '중', size: '잎 크기 5-7cm', price: '5,000-8,000원/kg' }
        ],
        method: '아침 일찍 수확, 아래 잎부터 채취',
        storage: '냉장 보관 (5-10°C), 습도 유지'
      },
      sales: {
        channels: [
          {
            name: '농수산물 도매시장',
            price: '6,000-10,000원/kg',
            pros: '대량 판매, 안정적 판로',
            cons: '낮은 가격, 가격 변동',
            description: '도매시장을 통한 대량 판매. 가장 일반적인 판매 방법입니다.'
          },
          {
            name: '대형마트 직거래',
            price: '8,000-12,000원/kg',
            pros: '안정적 수요, 정기 납품',
            cons: '품질 기준 엄격',
            description: '대형마트에 직접 납품. 품질 관리가 중요합니다.'
          },
          {
            name: '로컬푸드 직매장',
            price: '10,000-15,000원/kg',
            pros: '높은 가격, 신선도 유지',
            cons: '판매량 제한',
            description: '지역 로컬푸드 매장 판매. 신선도가 장점입니다.'
          },
          {
            name: '온라인 판매',
            price: '12,000-20,000원/kg',
            pros: '최고 수익, 직거래',
            cons: '배송 관리, 마케팅',
            description: '신선한 깻잎을 소비자에게 직접 판매. 포장이 중요합니다.'
          }
        ],
        marketInfo: {
          mainBuyers: '도매시장, 대형마트, 음식점, 개인 소비자',
          peakSeason: '연중 (특히 여름철)',
          competition: '재배 농가 많음',
          import: '수입산 거의 없음 (국산 선호)'
        }
      },
      economics: {
        investment: {
          facility: '10,000,000-15,000,000원 (500㎡ 기준)',
          seedling: '2,000,000-5,600,000원 (5,000-7,000주)',
          equipment: '2,000,000-3,000,000원',
          total: '14,000,000-23,600,000원'
        },
        annualCost: {
          electricity: '1,200,000원',
          labor: '24,000,000원',
          nutrient: '1,800,000원',
          maintenance: '1,500,000원',
          tax: '1,200,000원',
          total: '29,700,000원'
        },
        revenue: {
          yield: '1,200-1,800kg (6,000주 기준, 연 10회 수확)',
          price: '8,000원/kg (평균)',
          total: '9,600,000-16,200,000원'
        },
        profit: {
          firstYear: '-20,100,000원 (투자 회수 기간)',
          secondYear: '-20,100,000~-15,300,000원',
          roi: '3년차부터 수익 개선'
        }
      },
      tips: [
        '국내 수요가 높아 판로 확보 용이',
        '연중 재배로 안정적 수익',
        '품질 관리로 가격 경쟁력 확보',
        '계약 재배로 안정적 판로 확보',
        '적정 온도 유지로 품질 향상',
        '정기적인 수확으로 생산량 증대'
      ],
      risks: [
        '여름철 고온 시 품질 저하',
        '병해충 발생 (진딧물, 응애)',
        '시장 가격 변동성',
        '경쟁 농가 많음',
        '겨울철 난방비 증가'
      ]
    },
    strawberry: {
      name: '딸기',
      scientificName: 'Fragaria × ananassa',
      category: 'fruit',
      image: '',
      overview: {
        description: '딸기는 국내에서 가장 인기 있는 과일 중 하나로, 높은 수익성과 안정적인 수요를 자랑합니다. 재배 기술이 발달하여 연중 생산이 가능하며, 고품질 딸기는 높은 가격을 받을 수 있습니다.',
        origin: '한국 국산',
        cultivationDifficulty: '중간',
        profitability: '매우 높음',
        marketDemand: '매우 높음'
      },
      seedling: {
        price: '800-1,500원/주',
        supplier: '전문 종묘장, 농업기술센터',
        plantingDensity: '8,000-12,000주/500㎡',
        bestSeason: '가을(9-10월)',
        description: '우량 묘를 선택하고, 병해충이 없는 건강한 묘를 선택합니다.'
      },
      cultivation: {
        period: '6-8개월',
        stages: [
          { stage: '정식기', duration: '9-10월', description: '묘목 정식 및 활착' },
          { stage: '화아분화기', duration: '10-11월', description: '꽃눈 형성' },
          { stage: '개화기', duration: '12-1월', description: '꽃 피기 시작' },
          { stage: '착과기', duration: '1-2월', description: '열매 맺기' },
          { stage: '수확기', duration: '2-5월', description: '본격 수확' }
        ],
        environment: {
          temperature: '낮 20-25°C, 밤 8-12°C',
          humidity: '60-70% (적정 습도)',
          light: '충분한 일조량 필요',
          water: 'EC 0.6-0.8 mS/cm',
          soil: 'pH 5.5-6.5, 배수 양호한 토양'
        },
        keyPoints: [
          '온도 관리가 매우 중요 (특히 야간 온도)',
          '화아분화기 저온 처리 필수',
          '수분 관리 철저 (과습 주의)',
          '병해충 예방 관리 (잿빛곰팡이병, 응애)',
          '적정 양액 농도 유지'
        ]
      },
      harvest: {
        period: '정식 후 4-6개월',
        yield: '1,500-2,500g/주',
        quality: [
          { grade: '특', size: '30g 이상', price: '20,000-30,000원/kg' },
          { grade: '상', size: '20-30g', price: '15,000-20,000원/kg' },
          { grade: '중', size: '15-20g', price: '10,000-15,000원/kg' },
          { grade: '하', size: '15g 미만', price: '5,000-10,000원/kg' }
        ],
        method: '아침 일찍 수확, 꼭지와 함께 채취',
        storage: '냉장 보관 (0-5°C), 습도 90%'
      },
      sales: {
        channels: [
          {
            name: '농수산물 도매시장',
            price: '12,000-18,000원/kg',
            pros: '대량 판매, 안정적 판로',
            cons: '낮은 가격, 가격 변동',
            description: '도매시장을 통한 대량 판매. 가장 일반적인 방법입니다.'
          },
          {
            name: '대형마트 직거래',
            price: '15,000-25,000원/kg',
            pros: '높은 가격, 안정적 수요',
            cons: '품질 기준 엄격, 포장 필요',
            description: '대형마트에 직접 납품. 품질과 포장이 중요합니다.'
          },
          {
            name: '온라인 판매',
            price: '20,000-35,000원/kg',
            pros: '최고 수익, 브랜드 구축',
            cons: '배송 관리, 마케팅 필요',
            description: '프리미엄 딸기를 소비자에게 직접 판매. 포장과 배송이 핵심입니다.'
          },
          {
            name: '체험농장',
            price: '25,000-40,000원/kg',
            pros: '최고 수익, 부가 수익',
            cons: '시설 투자, 인력 필요',
            description: '딸기 따기 체험으로 높은 수익. 관광 농업과 결합 가능합니다.'
          }
        ],
        marketInfo: {
          mainBuyers: '도매시장, 대형마트, 백화점, 개인 소비자',
          peakSeason: '겨울~봄 (12-5월)',
          competition: '재배 농가 많음',
          import: '수입산 거의 없음 (국산 선호)'
        }
      },
      economics: {
        investment: {
          facility: '30,000,000-50,000,000원 (500㎡ 기준)',
          seedling: '6,400,000-18,000,000원 (8,000-12,000주)',
          equipment: '5,000,000-8,000,000원',
          total: '41,400,000-76,000,000원'
        },
        annualCost: {
          electricity: '3,000,000원',
          labor: '36,000,000원',
          nutrient: '3,000,000원',
          maintenance: '2,500,000원',
          tax: '2,000,000원',
          total: '46,500,000원'
        },
        revenue: {
          yield: '15,000-25,000kg (10,000주 기준)',
          price: '15,000원/kg (평균)',
          total: '225,000,000-375,000,000원'
        },
        profit: {
          firstYear: '178,500,000-328,500,000원',
          secondYear: '178,500,000-328,500,000원',
          roi: '200-400% (매우 높음)'
        }
      },
      tips: [
        '품종 선택이 수익성에 큰 영향',
        '온도 관리 철저로 품질 향상',
        '프리미엄 시장 공략으로 고수익',
        '체험농장 운영으로 부가 수익',
        '온라인 판매로 브랜드 구축',
        '계약 재배로 안정적 판로 확보'
      ],
      risks: [
        '초기 투자 비용이 큼',
        '병해충 관리 실패 시 큰 손실',
        '겨울철 난방비 부담',
        '시장 가격 변동성',
        '기술 습득 필요'
      ]
    }
  };

  const crop = cropData[cropId];

  if (!crop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-gray-400 mb-4"></i>
          <p className="text-lg font-bold text-gray-700">작물 정보를 찾을 수 없습니다</p>
          <Link to="/profit-analysis" className="mt-4 inline-block text-emerald-600 font-bold">
                돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 pb-20 overflow-hidden">
      {/* Floating Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-20 right-10 w-64 h-64 bg-emerald-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        ></div>
        <div 
          className="absolute bottom-40 left-10 w-80 h-80 bg-teal-300/30 rounded-full blur-3xl"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        ></div>
      </div>

      <PageHeader title="작물 상세 정보" backTo="/profit-analysis" />

      {/* Hero Image */}
      <section className="px-4 pt-6 pb-6 relative z-10">
        <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className={`relative h-56 bg-gradient-to-br ${CROP_VISUAL[cropId]?.gradient ?? 'from-emerald-400 to-teal-500'} flex items-center justify-center`}>
            <span className="text-[7rem] opacity-25 select-none">{CROP_VISUAL[cropId]?.emoji ?? '🌱'}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h2 className="text-2xl font-black text-white mb-1 drop-shadow-lg">{crop.name}</h2>
              <p className="text-sm text-white/90 font-medium italic">{crop.scientificName}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="px-4 pb-6 relative z-10">
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
              <i className="ri-time-line text-lg text-white"></i>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">재배기간</p>
            <p className="text-sm font-black text-gray-900">18-24개월</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg">
              <i className="ri-plant-line text-lg text-white"></i>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">수확량</p>
            <p className="text-sm font-black text-gray-900">300g/주</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
              <i className="ri-money-dollar-circle-line text-lg text-white"></i>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">판매가</p>
            <p className="text-sm font-black text-gray-900">10만원/kg</p>
          </div>
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 text-center shadow-lg border border-gray-100 transform hover:scale-105 transition-all duration-300">
            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
              <i className="ri-line-chart-line text-lg text-white"></i>
            </div>
            <p className="text-xs text-gray-500 font-medium mb-1">수익성</p>
            <p className="text-sm font-black text-gray-900">매우높음</p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="px-4 pb-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-gray-100">
          <div className="grid grid-cols-5 gap-2">
            {[
              { id: 'overview', icon: 'ri-information-line', label: '개요' },
              { id: 'seedling', icon: 'ri-seedling-line', label: '종묘' },
              { id: 'cultivation', icon: 'ri-plant-line', label: '재배' },
              { id: 'sales', icon: 'ri-store-line', label: '판매' },
              { id: 'economics', icon: 'ri-calculator-line', label: '수익' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 rounded-xl font-bold text-xs transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <i className={`${tab.icon} text-base block mb-1`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="relative z-10">
        {/* Overview */}
        {activeTab === 'overview' && (
          <section className="px-4 pb-6 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                  <i className="ri-information-line text-xl text-white"></i>
                </div>
                <h3 className="text-lg font-black text-gray-900">{crop.name} 개요</h3>
              </div>

              <div className="space-y-5">
                <div>
                  <h4 className="text-sm font-black text-gray-900 mb-3">작물 설명</h4>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                    {crop.overview.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
                    <p className="text-xs text-gray-500 font-medium mb-2">원산지</p>
                    <p className="text-sm font-black text-gray-900">{crop.overview.origin}</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-4 border border-orange-100">
                    <p className="text-xs text-gray-500 font-medium mb-2">재배 난이도</p>
                    <p className="text-sm font-black text-gray-900">{crop.overview.cultivationDifficulty}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                    <p className="text-xs text-gray-500 font-medium mb-2">수익성</p>
                    <p className="text-sm font-black text-gray-900">{crop.overview.profitability}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
                    <p className="text-xs text-gray-500 font-medium mb-2">시장 수요</p>
                    <p className="text-sm font-black text-gray-900">{crop.overview.marketDemand}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Seedling */}
        {activeTab === 'seedling' && (
          <section className="px-4 pb-6 animate-fadeIn">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
                  <i className="ri-seedling-line text-xl text-white"></i>
                </div>
                <h3 className="text-lg font-black text-gray-900">종묘 정보</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                        <i className="ri-price-tag-3-line text-lg text-white"></i>
                      </div>
                      <p className="text-sm font-bold text-gray-700">종묘 가격</p>
                    </div>
                    <p className="text-xl font-black text-emerald-600">{crop.seedling.price}</p>
                  </div>
                  <p className="text-xs text-gray-600 font-medium">{crop.seedling.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg">
                        <i className="ri-store-line text-lg text-white"></i>
                      </div>
                      <p className="text-sm font-bold text-gray-700">구입처</p>
                    </div>
                    <p className="text-sm font-black text-gray-900">{crop.seedling.supplier}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                        <i className="ri-grid-line text-lg text-white"></i>
                      </div>
                      <p className="text-sm font-bold text-gray-700">정식 밀도</p>
                    </div>
                    <p className="text-sm font-black text-gray-900">{crop.seedling.plantingDensity}</p>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
                        <i className="ri-calendar-line text-lg text-white"></i>
                      </div>
                      <p className="text-sm font-bold text-gray-700">정식 시기</p>
                    </div>
                    <p className="text-sm font-black text-gray-900">{crop.seedling.bestSeason}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Cultivation */}
        {activeTab === 'cultivation' && (
          <section className="px-4 pb-6 animate-fadeIn">
            <div className="space-y-4">
              {/* Growth Stages */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
                    <i className="ri-plant-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">생육 단계</h3>
                </div>

                <div className="space-y-3">
                  {crop.cultivation.stages.map((stage: any, index: number) => (
                    <div key={index} className="relative pl-8">
                      <div className="absolute left-0 top-0 w-6 h-6 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-full shadow-lg text-white text-xs font-black">
                        {index + 1}
                      </div>
                      {index < crop.cultivation.stages.length - 1 && (
                        <div className="absolute left-3 top-6 bottom-0 w-0.5 bg-gradient-to-b from-purple-300 to-pink-300"></div>
                      )}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-black text-gray-900">{stage.stage}</p>
                          <span className="text-xs font-bold text-purple-600 bg-white px-3 py-1 rounded-full shadow-sm">
                            {stage.duration}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 font-medium">{stage.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl">
                    <i className="ri-settings-3-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">재배 환경</h3>
                </div>

                <div className="space-y-3">
                  {Object.entries(crop.cultivation.environment).map(([key, value]: [string, any], index: number) => {
                    const icons: Record<string, string> = {
                      temperature: 'ri-temp-hot-line',
                      humidity: 'ri-drop-line',
                      light: 'ri-sun-line',
                      water: 'ri-water-flash-line',
                      soil: 'ri-plant-line'
                    };
                    const colors = ['from-red-400 to-orange-500', 'from-blue-400 to-cyan-500', 'from-yellow-400 to-orange-500', 'from-cyan-400 to-blue-500', 'from-green-400 to-emerald-500'];
                    
                    return (
                      <div key={key} className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl hover:shadow-lg transition-all duration-300">
                        <div className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${colors[index % colors.length]} rounded-xl shadow-lg flex-shrink-0`}>
                          <i className={`${icons[key]} text-lg text-white`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-bold mb-1 capitalize">{key === 'temperature' ? '온도' : key === 'humidity' ? '습도' : key === 'light' ? '광량' : key === 'water' ? '관수' : '토양'}</p>
                          <p className="text-sm text-gray-900 font-medium">{value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Points */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-xl">
                    <i className="ri-lightbulb-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">재배 핵심 포인트</h3>
                </div>

                <div className="space-y-3">
                  {crop.cultivation.keyPoints.map((point: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100">
                      <div className="w-6 h-6 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-lg flex-shrink-0">
                        <i className="ri-checkbox-circle-line text-white text-sm"></i>
                      </div>
                      <p className="text-sm text-gray-700 flex-1 font-medium">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sales */}
        {activeTab === 'sales' && (
          <section className="px-4 pb-6 animate-fadeIn">
            <div className="space-y-4">
              {/* Sales Channels */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
                    <i className="ri-store-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">판매 채널</h3>
                </div>

                <div className="space-y-4">
                  {crop.sales.channels.map((channel: any, index: number) => (
                    <div key={index} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-5 border-2 border-gray-200 hover:border-emerald-300 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="text-base font-black text-gray-900 mb-1">{channel.name}</h4>
                          <p className="text-lg font-black text-emerald-600">{channel.price}</p>
                        </div>
                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl shadow-lg">
                          <i className="ri-money-dollar-circle-line text-xl text-white"></i>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-3 font-medium leading-relaxed">{channel.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                          <p className="text-xs text-green-600 font-bold mb-1 flex items-center gap-1">
                            <i className="ri-checkbox-circle-line"></i>
                            장점
                          </p>
                          <p className="text-xs text-gray-700 font-medium">{channel.pros}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                          <p className="text-xs text-red-600 font-bold mb-1 flex items-center gap-1">
                            <i className="ri-close-circle-line"></i>
                            단점
                          </p>
                          <p className="text-xs text-gray-700 font-medium">{channel.cons}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Harvest & Quality */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl">
                    <i className="ri-price-tag-3-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">등급별 가격</h3>
                </div>

                <div className="space-y-3">
                  {crop.harvest.quality.map((quality: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg">
                          <span className="text-sm font-black text-white">{quality.grade}</span>
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900">{quality.size}</p>
                          <p className="text-xs text-gray-500 font-medium">크기 기준</p>
                        </div>
                      </div>
                      <p className="text-base font-black text-purple-600">{quality.price}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market Info */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                    <i className="ri-line-chart-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">시장 정보</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl shadow-lg flex-shrink-0">
                      <i className="ri-user-line text-lg text-white"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-bold mb-1">주요 구매자</p>
                      <p className="text-sm text-gray-900 font-medium">{crop.sales.marketInfo.mainBuyers}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg flex-shrink-0">
                      <i className="ri-calendar-line text-lg text-white"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-bold mb-1">성수기</p>
                      <p className="text-sm text-gray-900 font-medium">{crop.sales.marketInfo.peakSeason}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl shadow-lg flex-shrink-0">
                      <i className="ri-trophy-line text-lg text-white"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-bold mb-1">경쟁 상황</p>
                      <p className="text-sm text-gray-900 font-medium">{crop.sales.marketInfo.competition}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl shadow-lg flex-shrink-0">
                      <i className="ri-global-line text-lg text-white"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-bold mb-1">수입 경쟁</p>
                      <p className="text-sm text-gray-900 font-medium">{crop.sales.marketInfo.import}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Economics */}
        {activeTab === 'economics' && (
          <section className="px-4 pb-6 animate-fadeIn">
            <div className="space-y-4">
              {/* Investment */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-xl">
                    <i className="ri-wallet-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">초기 투자 비용</h3>
                </div>

                <div className="space-y-3">
                  {Object.entries(crop.economics.investment).map(([key, value]: [string, any], index: number) => {
                    if (key === 'total') {
                      return (
                        <div key={key} className="flex items-center justify-between p-5 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl border-2 border-red-300 mt-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-red-500 to-orange-700 rounded-xl shadow-xl">
                              <i className="ri-calculator-line text-xl text-white"></i>
                            </div>
                            <span className="text-sm font-black text-gray-800">총 투자액</span>
                          </div>
                          <span className="text-xl font-black text-red-600">{value}</span>
                        </div>
                      );
                    }
                    
                    const labels: Record<string, string> = {
                      facility: '시설비',
                      seedling: '종묘비',
                      equipment: '장비비'
                    };
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <span className="text-sm font-bold text-gray-700">{labels[key]}</span>
                        <span className="text-sm font-black text-gray-900">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Annual Cost */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl shadow-xl">
                    <i className="ri-file-list-3-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">연간 운영 비용</h3>
                </div>

                <div className="space-y-3">
                  {Object.entries(crop.economics.annualCost).map(([key, value]: [string, any], index: number) => {
                    if (key === 'total') {
                      return (
                        <div key={key} className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl border-2 border-orange-300 mt-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-700 rounded-xl shadow-xl">
                              <i className="ri-calculator-line text-xl text-white"></i>
                            </div>
                            <span className="text-sm font-black text-gray-800">총 운영비</span>
                          </div>
                          <span className="text-xl font-black text-orange-600">{value}</span>
                        </div>
                      );
                    }
                    
                    const labels: Record<string, string> = {
                      electricity: '전기료',
                      labor: '인건비',
                      nutrient: '양액비',
                      maintenance: '유지보수비',
                      tax: '제세공과금'
                    };
                    
                    return (
                      <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <span className="text-sm font-bold text-gray-700">{labels[key]}</span>
                        <span className="text-sm font-black text-gray-900">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-xl">
                    <i className="ri-money-dollar-circle-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">예상 매출</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <span className="text-sm font-bold text-gray-700">연간 생산량</span>
                    <span className="text-sm font-black text-gray-900">{crop.economics.revenue.yield}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <span className="text-sm font-bold text-gray-700">평균 판매가</span>
                    <span className="text-sm font-black text-gray-900">{crop.economics.revenue.price}</span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border-2 border-green-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-700 rounded-xl shadow-xl">
                        <i className="ri-cash-line text-xl text-white"></i>
                      </div>
                      <span className="text-sm font-black text-gray-800">총 매출</span>
                    </div>
                    <span className="text-xl font-black text-green-600">{crop.economics.revenue.total}</span>
                  </div>
                </div>
              </div>

              {/* Profit */}
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl">
                    <i className="ri-line-chart-line text-xl text-white"></i>
                  </div>
                  <h3 className="text-lg font-black text-gray-900">예상 수익</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-200">
                    <span className="text-sm font-bold text-gray-700">1년차 (투자 회수)</span>
                    <span className="text-sm font-black text-red-600">{crop.economics.profit.firstYear}</span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border-2 border-blue-300">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 rounded-xl shadow-xl">
                        <i className="ri-trophy-line text-xl text-white"></i>
                      </div>
                      <span className="text-sm font-black text-gray-800">2년차 순수익</span>
                    </div>
                    <span className="text-xl font-black text-blue-600">{crop.economics.profit.secondYear}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <span className="text-sm font-bold text-gray-700">투자 수익률 (ROI)</span>
                    <span className="text-base font-black text-purple-600">{crop.economics.profit.roi}</span>
                  </div>
                </div>
              </div>

              {/* Tips & Risks */}
              <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-6 border-2 border-yellow-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl shadow-lg">
                    <i className="ri-lightbulb-line text-lg text-white"></i>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">재배 팁</h4>
                </div>
                <div className="space-y-2">
                  {crop.tips.map((tip: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-line text-yellow-600 text-sm mt-0.5 flex-shrink-0"></i>
                      <p className="text-xs text-gray-700 font-medium">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border-2 border-red-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-red-400 to-orange-500 rounded-xl shadow-lg">
                    <i className="ri-error-warning-line text-lg text-white"></i>
                  </div>
                  <h4 className="text-sm font-black text-gray-900">주의사항</h4>
                </div>
                <div className="space-y-2">
                  {crop.risks.map((risk: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <i className="ri-alert-line text-red-600 text-sm mt-0.5 flex-shrink-0"></i>
                      <p className="text-xs text-gray-700 font-medium">{risk}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
