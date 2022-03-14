/**
 * Sometimes you just want to run some code to test something, use "bit test app" to run this test
 */

import * as utils from '@hectare/platform.components.utils/helpers'

it('util test for running some code', () => {
  console.log(utils.base64_encode('nick'))
})
