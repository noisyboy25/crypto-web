import { Select } from '@chakra-ui/react';
import React, { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <Select
      value={i18n.language}
      onChange={handleChange}
      width="10ch"
      color="gray"
    >
      <option value="en">En</option>
      <option value="ru">Ru</option>
    </Select>
  );
};
