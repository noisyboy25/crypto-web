import crypto from 'crypto';
import express from 'express';
import morgan from 'morgan';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { Readable } from 'stream';
import Aes256 from '../../lib/aes256';
import { pipeline } from 'stream';

const PORT = process.env.PORT || 5000;

let key = 'secret';
key = crypto.createHash('sha256').update(key).digest('base64').substring(0, 32);

const iv = Aes256.randIV();

const app = express();

app.use(morgan('dev'));
app.use(fileUpload());

app.get('/test', (req, res) => {
  res.send('Hello World');
});

app.get('/api/key', (req, res) => {
  res.json({ iv });
});

app.post('/api/enc', (req, res) => {
  if (req.files) {
    console.log(req.files.file);

    const sha256 = new Aes256(iv);

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

    const sha256 = new Aes256(iv);

    pipeline(
      Readable.from((req.files.file as UploadedFile).data),
      sha256.decrypt(key),
      res,
      (err) => {
        if (err) console.log(err);
      }
    );
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
