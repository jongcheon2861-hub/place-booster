module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://place.living1004.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  var keyword = req.query.keyword;
  if (!keyword) return res.status(400).json({ error: 'keyword required' });

  function getToday() {
    return new Date().toISOString().slice(0, 10);
  }
  function getDateMonthsAgo(months) {
    var d = new Date();
    d.setMonth(d.getMonth() - months);
    return d.toISOString().slice(0, 10);
  }

  var body = {
    startDate: getDateMonthsAgo(12),
    endDate: getToday(),
    timeUnit: 'month',
    keywordGroups: [{ groupName: keyword, keywords: [keyword] }]
  };

  try {
    var response = await fetch('https://openapi.naver.com/v1/datalab/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET
      },
      body: JSON.stringify(body)
    });
    var data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
