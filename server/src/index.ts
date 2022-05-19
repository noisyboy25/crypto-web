import crypto from 'crypto';
import express from 'express';
import morgan from 'morgan';
import Aes256 from '../../lib/aes256';
import { pipeline, Stream } from 'stream';
import compression from 'compression';
import fs from 'fs';
import busboy from 'busboy';

const PORT = process.env.PORT || 5000;

let secret = 'secret';

const TMP_DIR = process.env.TMP_DIR || '../tmp';

const streamToString = (stream: Stream) => {
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
};

const parseKey = (text: string) => {
  const parsed = JSON.parse(text);
  return { iv: Buffer.from(parsed.iv, 'base64'), key: parsed.key };
};

const app = express();

app.use(morgan('dev'));
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
  const bb = busboy({
    headers: {
      'content-type': (req.headers['Content-Type'] ||
        req.headers['content-type']) as string,
    },
  });

  req.pipe(bb);

  let parsedKey: { key: string; iv: Buffer };

  bb.on('file', (name, file, info: any) => {
    console.log(info);

    if (name === 'keyFile') {
      streamToString(file).then((text) => {
        parsedKey = parseKey(text);
      });

      return;
    }

    const encryptFile = () => {
      if (!parsedKey) {
        setTimeout(() => encryptFile(), 500);
      } else {
        const aes256 = new Aes256(parsedKey.iv);

        console.log(
          `attachment; filename=${encodeURIComponent(info.filename)}.crb`
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${encodeURIComponent(info.filename)}.crb`
        );

        if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
        const writeable = fs.createWriteStream(
          `${TMP_DIR}/${info.filename}.crb`
        );

        pipeline(
          file,
          aes256.encrypt(parsedKey.key),
          writeable,
          // res,
          (err) => {
            if (err) return console.log(err);
            res.sendStatus(200);
          }
        );
      }
    };
    encryptFile();
  });

  bb.on('finish', () => res.status(200));
});

app.post('/api/dec', (req, res) => {
  const bb = busboy({
    headers: {
      'content-type': (req.headers['Content-Type'] ||
        req.headers['content-type']) as string,
    },
  });

  req.pipe(bb);

  let parsedKey: { key: string; iv: Buffer };

  bb.on('file', (name, file, info: any) => {
    console.log(info);

    if (name === 'keyFile') {
      streamToString(file).then((text) => {
        parsedKey = parseKey(text);
      });

      return;
    }

    const decryptFile = () => {
      if (!parsedKey) {
        setTimeout(() => decryptFile(), 500);
      } else {
        const aes256 = new Aes256(parsedKey.iv);

        console.log(
          `attachment; filename=${encodeURIComponent(
            info.filename.replace(/.crb$/, '')
          )}`
        );
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=${encodeURIComponent(
            info.filename.replace(/.crb$/, '')
          )}`
        );

        if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR);
        const writeable = fs.createWriteStream(
          `${TMP_DIR}/${info.filename.replace(/.crb$/, '')}`
        );

        pipeline(
          file,
          aes256.decrypt(parsedKey.key),
          writeable,
          // res,
          (err) => {
            if (err) return console.log(err);
            res.sendStatus(200);
          }
        );
      }
    };
    decryptFile();
  });

  bb.on('finish', () => res.status(200));
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
