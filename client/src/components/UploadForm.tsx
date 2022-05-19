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
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export const UploadForm = () => {
  const [loadingKey, setLoadingKey] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);

  const fileName = useRef('');
  const keyFileName = useRef('');

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
  };

  const readChunks = (reader: any) => {
    return {
      async *[Symbol.asyncIterator]() {
        let readResult = await reader.read();
        while (!readResult.done) {
          yield readResult.value;
          readResult = await reader.read();
        }
      },
    };
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

    const reader = res.body?.getReader();
    for await (const chunk of readChunks(reader)) {
      console.log(chunk);
    }
    setLoadingFile(false);

    if (!res.ok) return;
  };

  const downloadBlob = async () => {
    // TODO
  };

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
          leftIcon={<FontAwesomeIcon icon={faCloudDownload} />}
        >
          {t('Download')} {fileName.current}
        </Button>
      </ButtonGroup>
    </Flex>
  );
};
