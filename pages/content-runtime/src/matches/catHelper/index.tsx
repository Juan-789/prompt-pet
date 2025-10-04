import inlineCss from '../../../dist/catHelper/index.css?inline';
import { initAppWithShadow } from '@extension/shared';
import App from '@src/matches/catHelper/App';

initAppWithShadow({ id: 'catHelper-id', app: <App />, inlineCss });
