export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization 헤더가 필요합니다.' });
  }

  try {
    const profileRes = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { Authorization: authHeader }
    });
    const profileData = await profileRes.json();
    return res.status(200).json(profileData);
  } catch (err) {
    return res.status(500).json({ error: '프로필 조회 실패', detail: err.message });
  }
}
