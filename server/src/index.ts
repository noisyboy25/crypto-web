import crypto from 'crypto';
import express, { Request, Response } from 'express';
import morgan from 'morgan';
import Aes256 from '../../lib/aes256';
import { pipeline, Stream } from 'stream';
import compression from 'compression';
import fs from 'fs';
import busboy from 'busboy';
import path from 'path';

const PORT = process.env.PORT || 5000;

let secret = 'secret';

const TMP_DIR = process.env.TMP_DIR || '../tmp';
const TMP_PATH = path.join(__dirname, TMP_DIR);

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
app.use('/tmp', express.static(TMP_PATH));
app.use(compression());

const processFile = (
  req: Request,
  res: Response,
  mode: 'enc' | 'dec' = 'enc'
) => {
  const bb = busboy({
    headers: {
      'content-type': (req.headers['Content-Type'] ||
        req.headers['content-type']) as string,
    },
  });

  req.pipe(bb);

  let parsedKey: { key: string; iv: Buffer };

  let filename = '';

  bb.on('file', (name, file, info: any) => {
    console.log(info);

    if (name === 'keyFile') {
      streamToString(file).then((text) => {
        parsedKey = parseKey(text);
      });

      return;
    }

    const run = () => {
      if (!parsedKey) {
        setTimeout(() => run(), 500);
      } else {
        const aes256 = new Aes256(parsedKey.iv);

        if (!fs.existsSync(TMP_PATH)) fs.mkdirSync(TMP_PATH);
        filename = info.filename;
        let filePath = '';
        if (mode === 'enc') {
          filename = `${filename}.crb`;
          filePath = path.join(TMP_PATH, filename);
        } else if (mode === 'dec') {
          filename = filename.replace(/.crb$/, '');
          filePath = path.join(TMP_PATH, filename);
        }
        const writeable = fs.createWriteStream(filePath);

        pipeline(
          file,
          mode === 'enc'
            ? aes256.encrypt(parsedKey.key)
            : aes256.decrypt(parsedKey.key),
          writeable,
          (err) => {
            if (err) return console.log(err);
          }
        );
      }
    };
    run();
  });
  bb.on('close', () => {
    console.log(filename);
    res.status(200).json({ filename });
  });
};

app.get('/tmp/:filename', (req, res) => {
  const { filename } = req.params;

  if (!fs.existsSync(path.join(TMP_PATH, filename))) return res.sendStatus(404);

  res.sendFile(path.join(TMP_PATH, filename));
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

app.post('/api/enc', (req, res) => processFile(req, res, 'enc'));

app.post('/api/dec', (req, res) => processFile(req, res, 'dec'));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
