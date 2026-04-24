module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  var body = req.body || {};
  var industry = body.industry;
  var region = body.region;
  var placeName = body.placeName;
  var speciality = body.speciality || '';
  var topKeywords = body.topKeywords || [];

  if (!industry || !region || !placeName) {
    return res.status(400).json({ error: 'industry, region, placeName 필수' });
  }

  var TEMPLATES = {
    restaurant: {
      name: '음식점',
      intro: [
        region + ' 맛집을 찾고 계신가요? ' + placeName + '은(는) ' + (speciality || '정성 가득한 요리') + '로 유명한 ' + region + ' 대표 맛집입니다.',
        region + '에서 특별한 한 끼를 원하신다면 ' + placeName + '을(를) 추천드립니다. ' + (speciality || '신선한 재료와 정통 레시피') + '로 준비합니다.',
        placeName + ' — ' + region + '에서 사랑받는 맛집. ' + (speciality || '매일 새벽 공수하는 신선한 재료') + '와 정성으로 손님을 맞이합니다.'
      ],
      descSections: [
        { title: '대표 메뉴', hint: '시그니처 메뉴명과 가격, 특징을 2~3개 작성하세요.' },
        { title: '매장 분위기', hint: '인테리어, 좌석 수, 단체석/룸 유무를 작성하세요.' },
        { title: '오시는 길', hint: '지하철역 출구 번호, 도보 소요시간, 주차 가능 여부를 작성하세요.' },
        { title: '영업 안내', hint: '영업시간, 브레이크타임, 라스트오더, 휴무일을 작성하세요.' }
      ],
      keywordTips: [
        '소개글 첫 문장에 "지역+업종" 키워드를 넣으세요.',
        '메뉴 설명에 대표 키워드를 자연스럽게 1회 삽입하세요.',
        '"오시는 길"에 지역 키워드를 한 번 더 반복하세요.',
        '계절 메뉴가 있다면 시즌 키워드를 활용하세요.'
      ]
    },
    cafe: {
      name: '카페',
      intro: [
        region + ' 카페를 찾으신다면 ' + placeName + '! ' + (speciality || '직접 로스팅한 스페셜티 원두') + '와 아늑한 공간이 기다립니다.',
        placeName + '은(는) ' + region + '에서 ' + (speciality || '감성 인테리어와 수제 디저트') + '로 사랑받는 카페입니다.',
        '커피 한 잔의 여유, ' + region + ' ' + placeName + '. ' + (speciality || '시그니처 라떼와 수제 케이크') + '를 즐겨보세요.'
      ],
      descSections: [
        { title: '시그니처 메뉴', hint: '대표 음료와 디저트 3~5개를 작성하세요.' },
        { title: '공간 소개', hint: '좌석 수, 콘센트 여부, 단체석, 테라스 등을 작성하세요.' },
        { title: '오시는 길', hint: '가까운 역과 정류장, 주차 안내를 작성하세요.' },
        { title: '영업 안내', hint: '영업시간, 휴무일을 작성하세요.' }
      ],
      keywordTips: [
        '"지역+카페" 키워드를 소개글 첫 줄에 배치하세요.',
        '디저트, 브런치 등 세부 키워드를 메뉴 설명에 넣으세요.',
        '"감성카페", "작업하기 좋은 카페" 등 분위기 키워드를 활용하세요.',
        '포토존이 있으면 "사진 맛집", "인스타 카페" 키워드를 고려하세요.'
      ]
    },
    beauty: {
      name: '미용실/뷰티',
      intro: [
        region + ' 미용실 ' + placeName + '입니다. ' + (speciality || '헤어 컬러와 커트 전문') + '으로 고객 맞춤 스타일을 제안합니다.',
        placeName + ' — ' + region + '에서 ' + (speciality || '트렌디한 헤어 디자인') + '을 만나보세요.',
        region + ' 헤어숍 ' + placeName + '. ' + (speciality || '손상 최소화 시술과 프리미엄 제품') + '으로 건강한 아름다움을 완성합니다.'
      ],
      descSections: [
        { title: '전문 시술', hint: '커트, 염색, 펌, 클리닉 등 주력 시술을 작성하세요.' },
        { title: '디자이너 소개', hint: '경력, 수상 이력, 전문 분야를 작성하세요.' },
        { title: '오시는 길', hint: '역과 정류장, 주차 안내를 작성하세요.' },
        { title: '예약 안내', hint: '예약 방법, 영업시간, 휴무일을 작성하세요.' }
      ],
      keywordTips: [
        '"지역+미용실" 또는 "지역+헤어숍"을 첫 문장에 넣으세요.',
        '시술명(발레아쥬, 볼륨매직 등)을 구체적으로 키워드화하세요.',
        '"남자 미용실", "여성 전문" 등 타깃 키워드를 활용하세요.',
        '시즌별(졸업식 헤어, 여름 단발 등) 키워드를 반영하세요.'
      ]
    },
    hospital: {
      name: '병원/의원',
      intro: [
        region + ' ' + (speciality || '정형외과') + ' ' + placeName + '입니다. 정확한 진단과 맞춤 치료로 건강을 지켜드립니다.',
        placeName + ' — ' + region + '에서 ' + (speciality || '비수술 치료와 체계적 재활') + '을 전문으로 하는 의원입니다.',
        region + ' ' + (speciality || '전문의 진료') + '를 찾으신다면 ' + placeName + '.'
      ],
      descSections: [
        { title: '진료 과목', hint: '전문 진료 분야와 대표 치료법을 작성하세요.' },
        { title: '의료진 소개', hint: '대표원장 약력, 전문의 자격, 학회 활동을 작성하세요.' },
        { title: '오시는 길', hint: '역과 정류장, 주차 안내를 작성하세요.' },
        { title: '진료 안내', hint: '진료시간, 점심시간, 토요일 진료 여부를 작성하세요.' }
      ],
      keywordTips: [
        '"지역+진료과목" 키워드를 첫 문장에 배치하세요.',
        '구체적 치료명(도수치료, 체외충격파 등)을 키워드로 활용하세요.',
        '"야간진료", "주말진료" 등 편의 키워드를 넣으세요.',
        '비급여 시술명이 있다면 별도 키워드로 활용하세요.'
      ]
    },
    fitness: {
      name: '피트니스/헬스',
      intro: [
        region + ' 헬스장 ' + placeName + '! ' + (speciality || 'PT 전문 트레이너와 최신 장비') + '로 건강한 변화를 시작하세요.',
        placeName + '은(는) ' + region + '에서 ' + (speciality || '1:1 맞춤 퍼스널 트레이닝') + '을 제공하는 피트니스입니다.',
        region + ' PT ' + placeName + '. ' + (speciality || '체계적인 프로그램과 쾌적한 시설') + '이 준비되어 있습니다.'
      ],
      descSections: [
        { title: '프로그램', hint: 'PT, GX, 요가, 필라테스 등 프로그램을 작성하세요.' },
        { title: '시설 안내', hint: '면적, 장비 종류, 샤워실, 라커 등을 작성하세요.' },
        { title: '오시는 길', hint: '역과 정류장, 주차 안내를 작성하세요.' },
        { title: '이용 안내', hint: '운영시간, 회원권 종류, 체험 안내를 작성하세요.' }
      ],
      keywordTips: [
        '"지역+헬스장" 또는 "지역+PT"를 첫 문장에 넣으세요.',
        '"다이어트"보다 "지역+피트니스"가 플레이스 노출에 유리합니다.',
        '"여성전용", "24시" 등 차별화 키워드를 활용하세요.',
        '트레이너 자격증을 키워드로 활용하면 신뢰도가 올라갑니다.'
      ]
    },
    education: {
      name: '학원/교육',
      intro: [
        region + ' ' + (speciality || '영어/수학 전문') + ' 학원 ' + placeName + '입니다.',
        placeName + ' — ' + region + '에서 ' + (speciality || '소수 정예 수업') + '으로 차별화된 교육을 제공합니다.',
        region + ' 학원 ' + placeName + '. ' + (speciality || '입시와 내신 전문 강사진') + '이 함께합니다.'
      ],
      descSections: [
        { title: '교육 과정', hint: '과목, 대상, 반 구성을 작성하세요.' },
        { title: '강사진', hint: '대표 강사 약력, 합격 실적을 작성하세요.' },
        { title: '오시는 길', hint: '역과 정류장, 주차/셔틀 안내를 작성하세요.' },
        { title: '수업 안내', hint: '수업 시간, 상담 방법, 체험 수업 안내를 작성하세요.' }
      ],
      keywordTips: [
        '"지역+학원" 또는 "지역+과목+학원"을 첫 문장에 넣으세요.',
        '"겨울방학 특강", "여름 캠프" 등 시즌 키워드를 활용하세요.',
        '"소수정예", "1:1 과외" 등 수업 형태 키워드를 넣으세요.',
        '학년별 키워드가 검색량이 더 높을 수 있습니다.'
      ]
    },
    pet: {
      name: '반려동물',
      intro: [
        region + ' ' + (speciality || '애견미용과 호텔') + ' ' + placeName + '입니다.',
        placeName + ' — ' + region + '에서 ' + (speciality || '소형견과 대형견 전문 케어') + '를 제공합니다.',
        region + ' 펫 전문 ' + placeName + '. ' + (speciality || '스트레스 프리 미용과 안전한 돌봄') + '을 약속합니다.'
      ],
      descSections: [
        { title: '서비스', hint: '미용, 호텔, 유치원, 산책 대행 등을 작성하세요.' },
        { title: '시설 안내', hint: '개별 케이지, CCTV, 놀이 공간 등을 작성하세요.' },
        { title: '오시는 길', hint: '역과 정류장, 주차 안내를 작성하세요.' },
        { title: '이용 안내', hint: '영업시간, 예약 방법, 필요 서류를 작성하세요.' }
      ],
      keywordTips: [
        '"지역+애견미용" 또는 "지역+펫호텔"을 첫 문장에 넣으세요.',
        '견종별 키워드(푸들 미용, 말티즈 전문 등)가 효과적입니다.',
        '"강아지 유치원", "고양이 호텔" 등 세분화된 키워드를 활용하세요.',
        '"CCTV 실시간", "픽업 가능" 등 신뢰/편의 키워드를 넣으세요.'
      ]
    },
    service: {
      name: '서비스/기타',
      intro: [
        region + ' ' + (speciality || '전문 서비스') + ' ' + placeName + '입니다.',
        placeName + ' — ' + region + '에서 ' + (speciality || '믿을 수 있는 전문 서비스') + '를 제공합니다.',
        region + ' ' + placeName + '. ' + (speciality || '합리적인 가격과 전문성') + '으로 찾아뵙겠습니다.'
      ],
      descSections: [
        { title: '서비스 소개', hint: '주요 서비스와 차별점을 작성하세요.' },
        { title: '전문가 소개', hint: '경력, 자격증, 포트폴리오를 작성하세요.' },
        { title: '오시는 길', hint: '역과 정류장, 주차 안내를 작성하세요.' },
        { title: '이용 안내', hint: '영업시간, 상담/예약 방법을 작성하세요.' }
      ],
      keywordTips: [
        '"지역+서비스명"을 첫 문장에 넣으세요.',
        '구체적 서비스명을 키워드로 분리하세요.',
        '"무료 상담", "출장 가능" 등 편의 키워드를 활용하세요.',
        '후기/실적 관련 표현을 자연스럽게 삽입하세요.'
      ]
    }
  };

  var template = TEMPLATES[industry] || TEMPLATES['service'];

  var introOptions = template.intro.map(function(text, i) {
    return { version: i + 1, text: text };
  });

  var keywordCheck = topKeywords.map(function(kw) {
    var allTexts = template.intro.join(' ');
    var found = allTexts.indexOf(kw) !== -1;
    return {
      keyword: kw,
      includedInIntro: found,
      suggestion: found
        ? '소개글에 포함됨'
        : '소개글에 "' + kw + '" 미포함 → 오시는 길 또는 메뉴 설명에 자연스럽게 삽입하세요'
    };
  });

  var descriptionGuide = template.descSections.map(function(section) {
    var suggestedKw = topKeywords.length > 0
      ? topKeywords[Math.floor(Math.random() * topKeywords.length)]
      : '(키워드 분석 후 자동 제안)';
    return {
      sectionTitle: section.title,
      writingHint: section.hint,
      keywordToInsert: suggestedKw,
      example: '"' + section.title + '" 섹션에 "' + suggestedKw + '" 키워드를 자연스럽게 1회 포함하세요.'
    };
  });

  var keywordPlacementMap = {
    '대표 키워드 5개': '키워드 분석 탭에서 추천된 5개를 그대로 입력',
    '소개글 첫 문장': region + ' ' + template.name + ' 형태로 시작',
    '소개글 본문': '나머지 대표 키워드를 각 1회씩 자연 삽입',
    '메뉴/서비스 설명': '대표 키워드 중 서비스 관련 키워드 1~2회 반복',
    '오시는 길': region + ' 지역 키워드 1회 반복',
    '사진 설명': '사진 업로드 시 파일명에 키워드 포함 권장'
  };

  var warnings = [
    '대표 키워드 1칸에 키워드 1개만 입력하세요 (과도한 삽입 시 거절 가능).',
    '키워드 중복을 피하세요 — 같은 단어를 여러 칸에 넣으면 비효율적입니다.',
    '2~3개월마다 대표 키워드를 트렌드에 맞춰 변경하세요.',
    '대형 키워드는 초반에 피하고 소형에서 중형 그리고 대형 순서로 공략하세요.'
  ];

  res.status(200).json({
    industry: template.name,
    region: region,
    placeName: placeName,
    introOptions: introOptions,
    keywordCheck: keywordCheck,
    descriptionGuide: descriptionGuide,
    optimizationTips: template.keywordTips,
    keywordPlacementMap: keywordPlacementMap,
    warnings: warnings
  });
};
