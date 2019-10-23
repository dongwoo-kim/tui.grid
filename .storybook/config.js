import { configure } from '@storybook/html';

configure(require.context('../my-stories', true, /.stories.tsx?$/), module);
