import {App} from 'documittu-template-default/cjs/components/app'
import apiDocs from '../analyze-result.json'

export default () =>
  process.browser ? <App tile="iterates" apiDocs={{data: apiDocs}} /> : null
