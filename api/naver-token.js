module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  var code = req.query.code;
  var stateParam = req.query.state || '';

  if (!code) {
    return res.status(400).json({ error: 'code required' });
  }

  var clientId = process.env.NAVER_CLIENT_ID;
  var clientSecret = process.env.NAVER_CLIENT_SECRET;
  var redirectUri = 'https://place.living1004.com/callback';

  var url = 'https://nid.naver.com/oauth2.0/token'
    + '?grant_type=authorization_code'
    + '&client_id=' + clientId
    + '&client_secret=' + clientSecret
    + '&code=' + encodeURIComponent(code)
    + '&state=' + encodeURIComponent(stateParam);

  try {
    var response = await fetch(url);
    var data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
