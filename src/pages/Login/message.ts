import { defineMessages } from 'react-intl';

export const scope = 'containers.LoginPage';

export default defineMessages({
  inputLogin: {
    id: `${scope}.inputLogin`,
    defaultMessage: 'Log in',
  },
  submit: {
    id: `${scope}.submit`,
    defaultMessage: 'Sign in',
  },
  rememberMe: {
    id: `${scope}.rememberMe`,
    defaultMessage: 'Remember me',
  },
  lostPassword: {
    id: `${scope}.lostPassword`,
    defaultMessage: 'Lost password?',
  },
  register: {
    id: `${scope}.register`,
    defaultMessage: 'Register now!',
  },
});
