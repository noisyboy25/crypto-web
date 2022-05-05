import crypto from 'crypto';
import express from 'express';
import morgan from 'morgan';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { Readable } from 'stream';
import Sha256 from '../../lib/sha256';
import { pipeline } from 'stream';

const PORT = process.env.PORT || 5000;

let key = 'secret';
key = crypto.createHash('sha256').update(key).digest('base64').substring(0, 32);

const iv = crypto.randomBytes(16);

const sha256 = new Sha256(iv);

const app = express();

app.use(morgan('dev'));
app.use(fileUpload());

app.get('/test', (req, res) => {
  res.send('Hello World');
});

app.post('/api/enc', (req, res) => {
  if (req.files) {
    console.log(req.files.file);
    pipeline(
      Readable.from((req.files.file as UploadedFile).data),
      sha256.encrypt(key),
      res
    );
  }
});

app.post('/api/dec', (req, res) => {
  if (req.files) {
    console.log(req.files.file);
    pipeline(
      Readable.from((req.files.file as UploadedFile).data),
      sha256.decrypt(key),
      res
    );
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

// const encrypted = fs.createReadStream('plain.txt').pipe(encrypt);
// encrypted.pipe(fs.createWriteStream('encrypted.bin'));
// encrypted.pipe(decrypt).pipe(fs.createWriteStream('result.txt'));
