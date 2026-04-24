const CryptoJS = require('crypto-js');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });

  const timestamp = Date.now() + '';
  const method = 'GET';
  const uri = '/keywordstool';
  const secretKey = process.env.NAVER_AD_SECRET;
  const accessKey = process.env.NAVER_AD_ACCESS;
  const customerId = process.env.NAVER_AD_CUSTOMER;

  // HMAC-SHA256 서명 생성
  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  hmac.update(timestamp + '.' + method + '.' + uri);
  const signature = hmac.finalize().toString(CryptoJS.enc.Base64);

  const url = `https://api.naver.com/keywordstool?hintKeywords=${encodeURIComponent(keyword)}&showDetail=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Timestamp': timestamp,
        'X-API-KEY': accessKey,
        'X-Customer': customerId,
        'X-Signature': signature
      }
    });
    const data = await response.json();

    // 키워드 등급 자동 분류
    const classified = (data.keywordList || []).map(kw => {
      const total = (kw.monthlyPcQcCnt || 0) + (kw.monthlyMobileQcCnt || 0);
      let grade = '소형';
      if (total >= 5000) grade = '대형';
      else if (total >= 1000) grade = '중형';
      return {
        keyword: kw.relKeyword,
        monthlyPC: kw.monthlyPcQcCnt,
        monthlyMobile: kw.monthlyMobileQcCnt,
        totalVolume: total,
        avgClickPC: kw.monthlyAvePcClkCnt,
        avgClickMobile: kw.monthlyAveMobileClkCnt,
        competition: kw.compIdx,
        grade
      };
    });

    // 검색량 내림차순 정렬
    classified.sort((a, b) => b.totalVolume - a.totalVolume);

    res.status(200).json({ keywords: classified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
