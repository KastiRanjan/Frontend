import { defineMessages } from 'react-intl';

export const scope = 'common';

export default defineMessages({
  emailRequired: {
    id: `${scope}.emailRequired`,
    defaultMessage: 'Please enter your email address',
  },
  passwordRequired: {
    id: `${scope}.passwordRequired`,
    defaultMessage: 'Please enter your password',
  },
  emailPlaceHolder: {
    id: `${scope}.emailPlaceHolder`,
    defaultMessage: 'Email address',
  },
  passwordPlaceHolder: {
    id: `${scope}.passwordPlaceHolder`,
    defaultMessage: 'Password',
  },
});
