import inlineCss from '../../../dist/fourth/index.css?inline';
import { initAppWithShadow } from '@extension/shared';
import App from '@src/matches/fourth/App';

initAppWithShadow({ id: 'CEB-extension-runtime-fourth', app: <App />, inlineCss });
