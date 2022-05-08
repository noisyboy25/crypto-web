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
  const [url, setUrl] = useState('');
  const fileName = useRef('');
  const link = useRef<HTMLAnchorElement>(null);

  const { register, handleSubmit, reset } = useForm();

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
    reset({ file: null });
    console.log('reset');
  }, [url, reset]);

  const onEncrypt = (data: any) => {
    uploadFiles(data.file[0], 'enc');
    console.log(data.file[0]);
  };

  const onDecrypt = (data: any) => {
    uploadFiles(data.file[0], 'dec');
    console.log(data.file[0]);
  };

  return (
    <Flex flexDirection="column" gap={4}>
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
          isDisabled={!url}
          leftIcon={<FontAwesomeIcon icon={faCloudDownload} />}
        >
          Download
        </Button>
      </ButtonGroup>
      <a
        style={{ display: 'none' }}
        href={url}
        download={fileName.current}
        ref={link}
      >
        Download
      </a>
    </Flex>
  );
};
