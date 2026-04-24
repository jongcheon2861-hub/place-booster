export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code, state } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'code와 state 파라미터가 필요합니다.' });
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.NAVER_CLIENT_ID,
      client_secret: process.env.NAVER_CLIENT_SECRET,
      code,
      state
    });

    const tokenRes = await fetch(`https://nid.naver.com/oauth2.0/token?${params}`);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(401).json({ error: tokenData.error, description: tokenData.error_description });
    }

    return res.status(200).json(tokenData);
  } catch (err) {
    return res.status(500).json({ error: '토큰 교환 실패', detail: err.message });
  }
}
