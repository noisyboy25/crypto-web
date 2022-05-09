import crypto from 'crypto';
import express from 'express';
import morgan from 'morgan';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { Readable } from 'stream';
import Aes256 from '../../lib/aes256';
import { pipeline } from 'stream';
import compression from 'compression';

const PORT = process.env.PORT || 5000;

let secret = 'secret';

const parseKey = (text: string) => {
  const parsed = JSON.parse(text);
  return { iv: Buffer.from(parsed.iv, 'base64'), key: parsed.key };
};

const app = express();

app.use(morgan('dev'));
app.use(fileUpload());
app.use(compression());

app.get('/test', (req, res) => {
  res.send('Hello World');
});

app.get('/api/key', (req, res) => {
  const iv = Aes256.randIV();
  const key = crypto
    .createHash('sha256')
    .update(secret)
    .digest('base64')
    .substring(0, 32);

  res
    .setHeader('Content-Disposition', `attachment; filename=${Date.now()}.crk`)
    .send(JSON.stringify({ iv: iv.toString('base64'), key }));
});

app.post('/api/enc', (req, res) => {
  if (req.files) {
    console.log(req.files);

    if (!(req.files.keyFile && req.files.file)) return res.sendStatus(400);
    const file = <UploadedFile>req.files.file;
    const keyFile = <UploadedFile>req.files.keyFile;

    const { iv, key } = parseKey(keyFile.data.toString());

    console.log({ iv, key });

    const sha256 = new Aes256(iv);

    console.log(`attachment; filename=${encodeURIComponent(file.name)}.crb`);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(file.name)}.crb`
    );

    pipeline(
      Readable.from((req.files.file as UploadedFile).data),
      sha256.encrypt(key),
      res,
      (err) => {
        if (err) console.log(err);
      }
    );
  }
});

app.post('/api/dec', (req, res) => {
  if (req.files) {
    console.log(req.files.file);

    if (!(req.files.keyFile && req.files.file)) return res.sendStatus(400);

    const file = <UploadedFile>req.files.file;
    const keyFile = <UploadedFile>req.files.keyFile;

    const { iv, key } = parseKey(keyFile.data.toString());

    const sha256 = new Aes256(iv);

    console.log(`attachment; filename=${file.name}.crb`);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(
        file.name.replace(/.crb$/, '')
      )}`
    );

    pipeline(Readable.from(file.data), sha256.decrypt(key), res, (err) => {
      if (err) console.log(err);
    });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
