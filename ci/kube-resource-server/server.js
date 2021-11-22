const fs = require('fs/promises');
const path = require('path');
const express = require('express');
const { generateFromSpec } = require('openapi-2-kong');
const yaml = require('js-yaml');

const resourceDirectory = path.join(__dirname, '..', 'kubernetes');

const app = express();

app.use(
  express.text({
    type: ['text/yaml', 'application/json'],
  })
);

app.post('/openapi-to-kong-converter', (req, res) => {
  const spec = yaml.load(req.body);
  const config = generateFromSpec(spec, 'kong-for-kubernetes');

  res.json(config.documents);
});

app.get('/resources', async (req, res) => {
  const canAccess = fs.access(resourceDirectory);
  if (!canAccess) {
    console.error(
      `The resource directory cannot be accessed: ${resourceDirectory}. Returning an empty array ([]).`
    );
    return res.json([]);
  }

  try {
    const files = await fs.readdir(resourceDirectory);
    const resources = await files.map(async (file) => {
      const f = await fs.readFile(path.join(resourceDirectory, file), 'utf8');
      const converted = yaml.load(f);
      return converted;
    });

    res.json(await Promise.all(resources));
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
