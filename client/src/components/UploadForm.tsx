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
import { useTranslation } from 'react-i18next';

export const UploadForm = () => {
  const [fileUrl, setFileUrl] = useState('');
  const [keyFileUrl, setKeyFileUrl] = useState('');
  const [loadingKey, setLoadingKey] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);

  const fileName = useRef('');
  const keyFileName = useRef('');

  const fileLink = useRef<HTMLAnchorElement>(null);
  const keyFileLink = useRef<HTMLAnchorElement>(null);

  const { register, handleSubmit, reset } = useForm();

  const { t } = useTranslation();

  const getKey = async () => {
    setLoadingKey(true);
    const res = await fetch('/api/key');
    setLoadingKey(false);

    if (!res.ok) return;

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const disposition = res.headers.get('Content-Disposition');
    const match = /filename=(.*)/.exec(disposition || '');
    if (!(match && match[1])) return;

    setKeyFileUrl(blobUrl);
    keyFileName.current = decodeURIComponent(match[1] || '');
  };
  useEffect(() => {
    if (keyFileUrl) keyFileLink.current!.click();
  }, [keyFileUrl]);

  const uploadFiles = async (data: any, mode: 'enc' | 'dec' = 'enc') => {
    const formData = new FormData();
    console.log(data);

    formData.append('file', data.file[0]);
    formData.append('keyFile', data.keyFile[0]);

    setLoadingFile(true);
    const res = await fetch(`/api/${mode}`, {
      method: 'POST',
      body: formData,
    });
    setLoadingFile(false);

    if (!res.ok) return;

    const blob = await res.blob();
    const blobUrl = `${URL.createObjectURL(blob)}`;
    const disposition = res.headers.get('Content-Disposition');
    const match = /filename=(.*)/.exec(disposition || '');
    if (!(match && match[1])) return;

    fileName.current = decodeURIComponent(match[1] || '');
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
          isLoading={loadingKey}
        >
          {t('Generate Key')}
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
          isLoading={loadingFile}
        >
          {t('Encrypt')}
        </Button>
        <Button
          onClick={handleSubmit(onDecrypt)}
          leftIcon={<FontAwesomeIcon icon={faFileArrowUp} />}
          isLoading={loadingFile}
        >
          {t('Decrypt')}
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
          {t('Download')} {fileName.current}
        </Button>
      </ButtonGroup>
      <a
        href={keyFileUrl}
        style={{ display: 'none' }}
        download={keyFileName.current}
        ref={keyFileLink}
      >
        {t('Download key file')}
      </a>
      <a
        style={{ display: 'none' }}
        href={fileUrl}
        download={fileName.current}
        ref={fileLink}
      >
        {t('Download file')}
      </a>
    </Flex>
  );
};
