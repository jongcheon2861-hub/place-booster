const CryptoJS = require('crypto-js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { keyword } = req.query;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });

  const timestamp = Date.now() + '';
  const method = 'GET';
  const uri = '/keywordstool';
  const secretKey = process.env.NAVER_AD_SECRET;
  const accessKey = process.env.NAVER_AD_ACCESS;
  const customerId = process.env.NAVER_AD_CUSTOMER;

  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);
  hmac.update(timestamp + '.' + method + '.' + uri);
  const signature = hmac.finalize().toString(CryptoJS.enc.Base64);

  const url = 'https://api.naver.com/keywordstool?hintKeywords=' + encodeURIComponent(keyword) + '&showDetail=1';

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

    const classified = (data.keywordList || []).map(function(kw) {
      var total = (kw.monthlyPcQcCnt || 0) + (kw.monthlyMobileQcCnt || 0);
      var grade = '소형';
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
        grade: grade
      };
    });

    classified.sort(function(a, b) { return b.totalVolume - a.totalVolume; });

    res.status(200).json({ keywords: classified });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
