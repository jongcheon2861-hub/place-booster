module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  var auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'Authorization header required' });
  }

  try {
    var response = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: { 'Authorization': auth }
    });
    var data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
