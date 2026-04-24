export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'query 파라미터가 필요합니다.' });
  }

  try {
    const searchRes = await fetch(
      `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5&sort=comment`,
      {
        headers: {
          'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
        }
      }
    );
    const searchData = await searchRes.json();
    return res.status(200).json(searchData);
  } catch (err) {
    return res.status(500).json({ error: '검색 실패', detail: err.message });
  }
}
