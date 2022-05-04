import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

const UploadForm = () => {
  const [url, setUrl] = useState('');
  const fileName = useRef('');
  const link = useRef<HTMLAnchorElement>(null);

  const { register, handleSubmit } = useForm();

  const uploadFiles = async (data: any, mode: 'enc' | 'dec' = 'enc') => {
    const formData = new FormData();
    formData.append('file', data);

    const res = await fetch(`/api/${mode}`, {
      method: 'POST',
      body: formData,
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    setUrl(url);
    fileName.current = mode === 'enc' ? 'file.bin' : 'file.txt';
    link.current?.click();
    console.log(blob);
  };

  const onEncrypt = (data: any) => {
    uploadFiles(data.file[0], 'enc');
    console.log(data.file[0]);
  };

  const onDecrypt = (data: any) => {
    uploadFiles(data.file[0], 'dec');
    console.log(data.file[0]);
  };

  return (
    <form>
      <input type="file" {...register('file')} />
      <input type="submit" value="Encrypt" onClick={handleSubmit(onEncrypt)} />
      <input type="submit" value="Decrypt" onClick={handleSubmit(onDecrypt)} />
      <div>
        <a href={url} download={fileName.current} ref={link}>
          Download
        </a>
      </div>
    </form>
  );
};

export default UploadForm;
