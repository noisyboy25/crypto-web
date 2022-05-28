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
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const UploadForm = () => {
  const [loadingKey, setLoadingKey] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [fileUrl, setFileUrl] = useState('');
  const [keyFileUrl, setKeyFileUrl] = useState('');

  const fileName = useRef('');
  const keyFileName = useRef('');

  const fileDownloadLink = useRef<HTMLAnchorElement>(null);
  const keyDownloadLink = useRef<HTMLAnchorElement>(null);

  const { register, handleSubmit } = useForm();

  const { t } = useTranslation();

  const getKey = async () => {
    setLoadingKey(true);
    const res = await fetch('/api/key');
    setLoadingKey(false);

    if (!res.ok) return;

    const disposition = res.headers.get('Content-Disposition');
    const match = /filename=(.*)/.exec(disposition || '');
    if (!(match && match[1])) return;

    keyFileName.current = decodeURIComponent(match[1] || '');
    const url = URL.createObjectURL(await res.blob());
    setKeyFileUrl(url);
    keyDownloadLink.current?.click();
  };

  const uploadFiles = async (data: any, mode: 'enc' | 'dec' = 'enc') => {
    const formData = new FormData();

    formData.append('keyFile', data.keyFile[0]);
    formData.append('file', data.file[0]);

    setLoadingFile(true);
    const res = await fetch(`/api/${mode}`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) return;

    const { filename } = await res.json();

    setFileUrl(`/tmp/${filename}`);

    console.log(filename);

    setLoadingFile(false);
  };

  const downloadFile = useCallback(async () => {
    if (fileUrl && fileDownloadLink.current) fileDownloadLink.current.click();
  }, [fileUrl]);

  const onEncrypt = (data: any) => {
    console.log(data);
    uploadFiles(data, 'enc');
  };

  const onDecrypt = (data: any) => {
    console.log(data);
    uploadFiles(data, 'dec');
  };

  useEffect(() => {
    (async () => {
      await downloadFile();
    })();
  }, [fileUrl, downloadFile]);

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
          onClick={downloadFile}
          leftIcon={<FontAwesomeIcon icon={faCloudDownload} />}
        >
          {t('Download')} {fileName.current}
        </Button>
      </ButtonGroup>
      <a ref={fileDownloadLink} download={fileName.current} href={fileUrl}>
        Download file
      </a>
      <a ref={keyDownloadLink} download={keyFileName.current} href={keyFileUrl}>
        Download key file
      </a>
    </Flex>
  );
};
