import inlineCss from '../../../dist/callLLM/index.css?inline';
import { initAppWithShadow } from '@extension/shared';
import App from '@src/matches/callLLM/App';

initAppWithShadow({ id: 'CEB-extension-runtime-fourth', app: <App />, inlineCss });
