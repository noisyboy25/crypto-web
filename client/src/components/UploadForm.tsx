import {
  Button,
  ButtonGroup,
  Flex,
  FormControl,
  Input,
} from '@chakra-ui/react';
import {
  faCloudDownload,
  faFileArrowDown,
  faFileArrowUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

export const UploadForm = () => {
  const [fileUrl, setFileUrl] = useState('');
  const [keyFileUrl, setKeyFileUrl] = useState('');

  const fileName = useRef('');
  const keyFileName = useRef('');

  const fileLink = useRef<HTMLAnchorElement>(null);
  const keyFileLink = useRef<HTMLAnchorElement>(null);

  const { register, handleSubmit, reset } = useForm();

  const getKey = async () => {
    const res = await fetch('/api/key');

    if (!res.ok) return;

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    setKeyFileUrl(blobUrl);

    const disposition = res.headers.get('Content-Disposition');
    keyFileName.current = disposition?.split(';')[1].split('=')[1] || '';
  };
  useEffect(() => {
    if (keyFileUrl) keyFileLink.current!.click();
  }, [keyFileUrl]);

  const uploadFiles = async (data: any, mode: 'enc' | 'dec' = 'enc') => {
    const formData = new FormData();
    console.log(data);

    formData.append('file', data.file[0]);
    formData.append('keyFile', data.keyFile[0]);

    const res = await fetch(`/api/${mode}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) return;

    const blob = await res.blob();
    const blobUrl = `${URL.createObjectURL(blob)}`;
    const disposition = res.headers.get('Content-Disposition');
    fileName.current = decodeURIComponent(
      disposition?.split(';')[1].split('=')[1] || ''
    );

    console.log(fileName.current);

    setFileUrl(blobUrl);
    console.log(blob);
  };

  const downloadBlob = async () => {
    if (fileUrl) fileLink.current!.click();
  };

  useEffect(() => {
    if (fileUrl) fileLink.current!.click();
    reset({ file: null });
    console.log('reset');
  }, [fileUrl, reset]);

  const onEncrypt = (data: any) => {
    console.log(data);
    uploadFiles(data, 'enc');
  };

  const onDecrypt = (data: any) => {
    console.log(data);
    uploadFiles(data, 'dec');
  };

  return (
    <Flex flexDirection="column" gap={4}>
      <ButtonGroup>
        <Button
          onClick={getKey}
          leftIcon={<FontAwesomeIcon icon={faCloudDownload} />}
        >
          Generate key
        </Button>
      </ButtonGroup>
      <FormControl>
        <Input isRequired type="file" accept=".crk" {...register('keyFile')} />
      </FormControl>
      <FormControl>
        <Input isRequired type="file" {...register('file')} />
      </FormControl>
      <ButtonGroup isAttached colorScheme="blue">
        <Button
          onClick={handleSubmit(onEncrypt)}
          leftIcon={<FontAwesomeIcon icon={faFileArrowDown} />}
        >
          Encrypt
        </Button>
        <Button
          onClick={handleSubmit(onDecrypt)}
          leftIcon={<FontAwesomeIcon icon={faFileArrowUp} />}
        >
          Decrypt
        </Button>
      </ButtonGroup>
      <ButtonGroup>
        <Button
          overflow="hidden"
          justifyContent="flex-start"
          onClick={downloadBlob}
          isDisabled={!fileUrl}
          leftIcon={<FontAwesomeIcon icon={faCloudDownload} />}
        >
          Download {fileName.current}
        </Button>
      </ButtonGroup>
      <a
        href={keyFileUrl}
        style={{ display: 'none' }}
        download={keyFileName.current}
        ref={keyFileLink}
      >
        Download key
      </a>
      <a
        style={{ display: 'none' }}
        href={fileUrl}
        download={fileName.current}
        ref={fileLink}
      >
        Download
      </a>
    </Flex>
  );
};
