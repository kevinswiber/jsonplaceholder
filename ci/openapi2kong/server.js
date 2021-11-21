const express = require('express');
const { generateFromSpec } = require('openapi-2-kong');
const yaml = require('js-yaml');

const app = express();

app.use(
  express.text({
    type: ['text/yaml', 'application/json'],
  })
);

app.post('/converter', (req, res) => {
  const spec = yaml.load(req.body);
  const config = generateFromSpec(spec, 'kong-for-kubernetes');

  res.json(config.documents);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
