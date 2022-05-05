import {
  faCloudDownload,
  faCloudDownloadAlt,
  faFileArrowDown,
  faFileArrowUp,
  faFileDownload,
  faFileExport,
  faFileImport,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
    const blobUrl = URL.createObjectURL(blob);
    setUrl(blobUrl);
    fileName.current = mode === 'enc' ? 'file.bin' : 'file.txt';
    console.log(blob);
  };

  useEffect(() => {
    if (url) link.current?.click();
  }, [url]);

  const onEncrypt = (data: any) => {
    uploadFiles(data.file[0], 'enc');
    console.log(data.file[0]);
  };

  const onDecrypt = (data: any) => {
    uploadFiles(data.file[0], 'dec');
    console.log(data.file[0]);
  };

  return (
    <form className="max-w-xs px-8 pt-6 pb-8">
      <input className="mb-4" type="file" {...register('file')} />
      <div className="flex justify-between mb-6">
        <button
          className="bg-blue-500 rounded text-white py-2 px-4 font-bold"
          value="Encrypt"
          onClick={handleSubmit(onEncrypt)}
        >
          <FontAwesomeIcon icon={faFileArrowDown} /> Encrypt
        </button>
        <button
          className="bg-blue-500 rounded text-white py-2 px-4 font-bold"
          value="Decrypt"
          onClick={handleSubmit(onDecrypt)}
        >
          <FontAwesomeIcon icon={faFileArrowUp} /> Decrypt
        </button>
      </div>
      <a
        className={`block rounded border-2 p-2 ${
          !url && 'bg-gray-200 text-gray-400'
        }`}
        href={url}
        download={fileName.current}
        ref={link}
      >
        <FontAwesomeIcon icon={faCloudDownload} /> Download {fileName.current}
      </a>
    </form>
  );
};

export default UploadForm;
