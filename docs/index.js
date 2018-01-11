import {start} from 'documittu-template-default'
import apiData from './analyze-result.json'

start({
  title: 'iterates',
  apiDocs: {
    data: apiData,
  },
})
