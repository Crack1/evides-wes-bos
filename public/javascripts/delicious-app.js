import '../sass/style.scss'

import { $, $$ } from './modules/bling'
import autoComplete from './modules/autocomplete'
import typeAhead from './modules/typeAhead'
import makeMap from './modules/map'
import ajaxHearts from './modules/heart'

autoComplete($('#address'), $('#lat'), $('#lng'))
typeAhead($('.search'))
makeMap($('#map'))

// $$ hear all the forms in the same time
const heartForms = $$('form.heart')
heartForms.on('submit', ajaxHearts)
