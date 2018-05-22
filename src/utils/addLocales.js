import { addLocaleData } from 'react-intl'
import ar from 'react-intl/locale-data/ar'
import de from 'react-intl/locale-data/de'
import el from 'react-intl/locale-data/el'
import en from 'react-intl/locale-data/en'
import es from 'react-intl/locale-data/es'
import fr from 'react-intl/locale-data/fr'
import he from 'react-intl/locale-data/he'
import hr from 'react-intl/locale-data/hr'
import it from 'react-intl/locale-data/it'
import ja from 'react-intl/locale-data/ja'
import ko from 'react-intl/locale-data/ko'
import nl from 'react-intl/locale-data/nl'
import pt from 'react-intl/locale-data/pt'
import ru from 'react-intl/locale-data/ru'
import th from 'react-intl/locale-data/th'
import tr from 'react-intl/locale-data/tr'
import zh from 'react-intl/locale-data/zh'
// import zh_Hans from 'react-intl/locale-data/zh_Hans'
// import zh_Hant from 'react-intl/locale-data/zh_Hant'

const addLocales = () => { 
  addLocaleData([
    ...ar,
    ...de,
    ...el,
    ...en,
    ...es,
    ...fr,
    ...he,
    ...hr,
    ...it,
    ...ja,
    ...ko,
    ...nl,
    ...pt,
    ...ru,
    ...th,
    ...tr,
    // ...zh_Hans,
    // ...zh_Hant
    ...zh])
}

export default addLocales
