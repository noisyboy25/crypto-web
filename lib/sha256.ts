import crypto, { BinaryLike, CipherKey } from 'crypto';

export default class Sha256 {
  algorithm: string;
  iv: BinaryLike;

  constructor(iv: BinaryLike, algorithm: string = 'aes-256-ctr') {
    this.algorithm = algorithm;
    this.iv = iv;
  }

  encrypt = (key: CipherKey) =>
    crypto.createCipheriv(this.algorithm, key, this.iv);

  decrypt = (key: CipherKey) =>
    crypto.createDecipheriv(this.algorithm, key, this.iv);
}
