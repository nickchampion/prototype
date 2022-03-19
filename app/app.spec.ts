/**
 * Sometimes you just want to run some code to test something, use "bit test app" to run this test
 */

import * as utils from '@hectare/platform.components.utils'

const env = {
  key: 'F688B96E64794571854BEF2C392B9B15',
  environment: 'dev',
  salt: 'somethingrandom'
}

it('test for when you just want to run some code', () => {
  console.log(utils.base64_encode(JSON.stringify(env)))
})
