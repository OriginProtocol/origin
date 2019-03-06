import React, { Component } from 'react'
import { connect } from 'react-redux'
import { defineMessages, injectIntl } from 'react-intl'

// sample list of available countries for phone number prefix
class CountryOptions extends Component {
  constructor(props) {
    super(props)

    this.intlMessages = defineMessages({
      andorra: {
        id: '_countryOptions.andorra',
        defaultMessage: 'Andorra'
      },
      unitedArabEmirates: {
        id: '_countryOptions.unitedArabEmirates',
        defaultMessage: 'United Arab Emirates'
      },
      afghanistan: {
        id: '_countryOptions.afghanistan',
        defaultMessage: 'Afghanistan'
      },
      antiguaAndBarbuda: {
        id: '_countryOptions.antiguaAndBarbuda',
        defaultMessage: 'Antigua and Barbuda'
      },
      anguilla: {
        id: '_countryOptions.anguilla',
        defaultMessage: 'Anguilla'
      },
      albania: {
        id: '_countryOptions.albania',
        defaultMessage: 'Albania'
      },
      armenia: {
        id: '_countryOptions.armenia',
        defaultMessage: 'Armenia'
      },
      angola: {
        id: '_countryOptions.angola',
        defaultMessage: 'Angola'
      },
      antarctica: {
        id: '_countryOptions.antarctica',
        defaultMessage: 'Antarctica'
      },
      argentina: {
        id: '_countryOptions.argentina',
        defaultMessage: 'Argentina'
      },
      austria: {
        id: '_countryOptions.austria',
        defaultMessage: 'Austria'
      },
      australia: {
        id: '_countryOptions.australia',
        defaultMessage: 'Australia'
      },
      aruba: {
        id: '_countryOptions.aruba',
        defaultMessage: 'Aruba'
      },
      azerbaijan: {
        id: '_countryOptions.azerbaijan',
        defaultMessage: 'Azerbaijan'
      },
      bosniaAndHerzegovina: {
        id: '_countryOptions.bosniaAndHerzegovina',
        defaultMessage: 'Bosnia and Herzegovina'
      },
      barbados: {
        id: '_countryOptions.barbados',
        defaultMessage: 'Barbados'
      },
      bangladesh: {
        id: '_countryOptions.bangladesh',
        defaultMessage: 'Bangladesh'
      },
      belgium: {
        id: '_countryOptions.belgium',
        defaultMessage: 'Belgium'
      },
      burkinaFaso: {
        id: '_countryOptions.burkinaFaso',
        defaultMessage: 'Burkina Faso'
      },
      bulgaria: {
        id: '_countryOptions.bulgaria',
        defaultMessage: 'Bulgaria'
      },
      bahrain: {
        id: '_countryOptions.bahrain',
        defaultMessage: 'Bahrain'
      },
      burundi: {
        id: '_countryOptions.burundi',
        defaultMessage: 'Burundi'
      },
      benin: {
        id: '_countryOptions.benin',
        defaultMessage: 'Benin'
      },
      bermuda: {
        id: '_countryOptions.bermuda',
        defaultMessage: 'Bermuda'
      },
      bruneiDarussalam: {
        id: '_countryOptions.bruneiDarussalam',
        defaultMessage: 'Brunei Darussalam'
      },
      bolivia: {
        id: '_countryOptions.bolivia',
        defaultMessage: 'Bolivia, Plurinational State of'
      },
      brazil: {
        id: '_countryOptions.brazil',
        defaultMessage: 'Brazil'
      },
      bahamas: {
        id: '_countryOptions.bahamas',
        defaultMessage: 'Bahamas'
      },
      bhutan: {
        id: '_countryOptions.bhutan',
        defaultMessage: 'Bhutan'
      },
      botswana: {
        id: '_countryOptions.botswana',
        defaultMessage: 'Botswana'
      },
      belarus: {
        id: '_countryOptions.belarus',
        defaultMessage: 'Belarus'
      },
      belize: {
        id: '_countryOptions.belize',
        defaultMessage: 'Belize'
      },
      canada: {
        id: '_countryOptions.canada',
        defaultMessage: 'Canada'
      },
      democraticRepublicOfTheCongo: {
        id: '_countryOptions.democraticRepublicOfTheCongo',
        defaultMessage: 'Congo, The Democratic Republic of the'
      },
      centralAfricanRepublic: {
        id: '_countryOptions.centralAfricanRepublic',
        defaultMessage: 'Central African Republic'
      },
      congo: {
        id: '_countryOptions.congo',
        defaultMessage: 'Congo'
      },
      switzerland: {
        id: '_countryOptions.switzerland',
        defaultMessage: 'Switzerland'
      },
      ivoryCoast: {
        id: '_countryOptions.ivoryCoast',
        defaultMessage: 'Côte d\'Ivoire'
      },
      cookIslands: {
        id: '_countryOptions.cookIslands',
        defaultMessage: 'Cook Islands'
      },
      chile: {
        id: '_countryOptions.chile',
        defaultMessage: 'Chile'
      },
      cameroon: {
        id: '_countryOptions.cameroon',
        defaultMessage: 'Cameroon'
      },
      china: {
        id: '_countryOptions.china',
        defaultMessage: 'China'
      },
      colombia: {
        id: '_countryOptions.colombia',
        defaultMessage: 'Colombia'
      },
      costaRica: {
        id: '_countryOptions.costaRica',
        defaultMessage: 'Costa Rica'
      },
      cuba: {
        id: '_countryOptions.cuba',
        defaultMessage: 'Cuba'
      },
      caboVerde: {
        id: '_countryOptions.caboVerde',
        defaultMessage: 'Cabo Verde'
      },
      curacao: {
        id: '_countryOptions.curacao',
        defaultMessage: 'Curaçao'
      },
      cyprus: {
        id: '_countryOptions.cyprus',
        defaultMessage: 'Cyprus'
      },
      czechia: {
        id: '_countryOptions.czechia',
        defaultMessage: 'Czechia'
      },
      germany: {
        id: '_countryOptions.germany',
        defaultMessage: 'Germany'
      },
      djibouti: {
        id: '_countryOptions.djibouti',
        defaultMessage: 'Djibouti'
      },
      denmark: {
        id: '_countryOptions.denmark',
        defaultMessage: 'Denmark'
      },
      dominica: {
        id: '_countryOptions.dominica',
        defaultMessage: 'Dominica'
      },
      dominicanRepublic: {
        id: '_countryOptions.dominicanRepublic',
        defaultMessage: 'Dominican Republic'
      },
      algeria: {
        id: '_countryOptions.algeria',
        defaultMessage: 'Algeria'
      },
      ecuador: {
        id: '_countryOptions.ecuador',
        defaultMessage: 'Ecuador'
      },
      estonia: {
        id: '_countryOptions.estonia',
        defaultMessage: 'Estonia'
      },
      egypt: {
        id: '_countryOptions.egypt',
        defaultMessage: 'Egypt'
      },
      eritrea: {
        id: '_countryOptions.eritrea',
        defaultMessage: 'Eritrea'
      },
      spain: {
        id: '_countryOptions.spain',
        defaultMessage: 'Spain'
      },
      ethiopia: {
        id: '_countryOptions.ethiopia',
        defaultMessage: 'Ethiopia'
      },
      finland: {
        id: '_countryOptions.finland',
        defaultMessage: 'Finland'
      },
      fiji: {
        id: '_countryOptions.fiji',
        defaultMessage: 'Fiji'
      },
      falklandIslands: {
        id: '_countryOptions.falklandIslands',
        defaultMessage: 'Falkland Islands (Malvinas)'
      },
      micronesia: {
        id: '_countryOptions.micronesia',
        defaultMessage: 'Micronesia, Federated States of'
      },
      faroeIslands: {
        id: '_countryOptions.faroeIslands',
        defaultMessage: 'Faroe Islands'
      },
      france: {
        id: '_countryOptions.france',
        defaultMessage: 'France'
      },
      gabon: {
        id: '_countryOptions.gabon',
        defaultMessage: 'Gabon'
      },
      unitedKingdom: {
        id: '_countryOptions.unitedKingdom',
        defaultMessage: 'United Kingdom'
      },
      grenada: {
        id: '_countryOptions.grenada',
        defaultMessage: 'Grenada'
      },
      georgia: {
        id: '_countryOptions.georgia',
        defaultMessage: 'Georgia'
      },
      frenchGuiana: {
        id: '_countryOptions.frenchGuiana',
        defaultMessage: 'French Guiana'
      },
      ghana: {
        id: '_countryOptions.ghana',
        defaultMessage: 'Ghana'
      },
      gibraltar: {
        id: '_countryOptions.gibraltar',
        defaultMessage: 'Gibraltar'
      },
      greenland: {
        id: '_countryOptions.greenland',
        defaultMessage: 'Greenland'
      },
      gambia: {
        id: '_countryOptions.gambia',
        defaultMessage: 'Gambia'
      },
      guinea: {
        id: '_countryOptions.guinea',
        defaultMessage: 'Guinea'
      },
      guadeloupe: {
        id: '_countryOptions.guadeloupe',
        defaultMessage: 'Guadeloupe'
      },
      equatorialGuinea: {
        id: '_countryOptions.equatorialGuinea',
        defaultMessage: 'Equatorial Guinea'
      },
      greece: {
        id: '_countryOptions.greece',
        defaultMessage: 'Greece'
      },
      guatemala: {
        id: '_countryOptions.guatemala',
        defaultMessage: 'Guatemala'
      },
      guineaBissau: {
        id: '_countryOptions.guineaBissau',
        defaultMessage: 'Guinea-Bissau'
      },
      guyana: {
        id: '_countryOptions.guyana',
        defaultMessage: 'Guyana'
      },
      hongKong: {
        id: '_countryOptions.hongKong',
        defaultMessage: 'Hong Kong'
      },
      honduras: {
        id: '_countryOptions.honduras',
        defaultMessage: 'Honduras'
      },
      croatia: {
        id: '_countryOptions.croatia',
        defaultMessage: 'Croatia'
      },
      haiti: {
        id: '_countryOptions.haiti',
        defaultMessage: 'Haiti'
      },
      hungary: {
        id: '_countryOptions.hungary',
        defaultMessage: 'Hungary'
      },
      indonesia: {
        id: '_countryOptions.indonesia',
        defaultMessage: 'Indonesia'
      },
      ireland: {
        id: '_countryOptions.ireland',
        defaultMessage: 'Ireland'
      },
      israel: {
        id: '_countryOptions.israel',
        defaultMessage: 'Israel'
      },
      india: {
        id: '_countryOptions.india',
        defaultMessage: 'India'
      },
      iraq: {
        id: '_countryOptions.iraq',
        defaultMessage: 'Iraq'
      },
      iran: {
        id: '_countryOptions.iran',
        defaultMessage: 'Iran, Islamic Republic of'
      },
      iceland: {
        id: '_countryOptions.iceland',
        defaultMessage: 'Iceland'
      },
      italy: {
        id: '_countryOptions.italy',
        defaultMessage: 'Italy'
      },
      jamaica: {
        id: '_countryOptions.jamaica',
        defaultMessage: 'Jamaica'
      },
      jordan: {
        id: '_countryOptions.jordan',
        defaultMessage: 'Jordan'
      },
      japan: {
        id: '_countryOptions.japan',
        defaultMessage: 'Japan'
      },
      kenya: {
        id: '_countryOptions.kenya',
        defaultMessage: 'Kenya'
      },
      kyrgyzstan: {
        id: '_countryOptions.kyrgyzstan',
        defaultMessage: 'Kyrgyzstan'
      },
      cambodia: {
        id: '_countryOptions.cambodia',
        defaultMessage: 'Cambodia'
      },
      kiribati: {
        id: '_countryOptions.kiribati',
        defaultMessage: 'Kiribati'
      },
      comoros: {
        id: '_countryOptions.comoros',
        defaultMessage: 'Comoros'
      },
      saintKittsAndNevis: {
        id: '_countryOptions.saintKittsAndNevis',
        defaultMessage: 'Saint Kitts and Nevis'
      },
      northKorea: {
        id: '_countryOptions.northKorea',
        defaultMessage: 'North Korea'
      },
      southKorea: {
        id: '_countryOptions.southKorea',
        defaultMessage: 'South Korea'
      },
      kuwait: {
        id: '_countryOptions.kuwait',
        defaultMessage: 'Kuwait'
      },
      caymanIslands: {
        id: '_countryOptions.caymanIslands',
        defaultMessage: 'Cayman Islands'
      },
      lao: {
        id: '_countryOptions.lao',
        defaultMessage: 'Lao People\'s Democratic Republic'
      },
      lebanon: {
        id: '_countryOptions.lebanon',
        defaultMessage: 'Lebanon'
      },
      saintLucia: {
        id: '_countryOptions.saintLucia',
        defaultMessage: 'Saint Lucia'
      },
      liechtenstein: {
        id: '_countryOptions.liechtenstein',
        defaultMessage: 'Liechtenstein'
      },
      sriLanka: {
        id: '_countryOptions.sriLanka',
        defaultMessage: 'Sri Lanka'
      },
      liberia: {
        id: '_countryOptions.liberia',
        defaultMessage: 'Liberia'
      },
      lesotho: {
        id: '_countryOptions.lesotho',
        defaultMessage: 'Lesotho'
      },
      lithuania: {
        id: '_countryOptions.lithuania',
        defaultMessage: 'Lithuania'
      },
      luxembourg: {
        id: '_countryOptions.luxembourg',
        defaultMessage: 'Luxembourg'
      },
      latvia: {
        id: '_countryOptions.latvia',
        defaultMessage: 'Latvia'
      },
      libya: {
        id: '_countryOptions.libya',
        defaultMessage: 'Libya'
      },
      morocco: {
        id: '_countryOptions.morocco',
        defaultMessage: 'Morocco'
      },
      monaco: {
        id: '_countryOptions.monaco',
        defaultMessage: 'Monaco'
      },
      moldova: {
        id: '_countryOptions.moldova',
        defaultMessage: 'Moldova, Republic of'
      },
      montenegro: {
        id: '_countryOptions.montenegro',
        defaultMessage: 'Montenegro'
      },
      madagascar: {
        id: '_countryOptions.madagascar',
        defaultMessage: 'Madagascar'
      },
      marshallIslands: {
        id: '_countryOptions.marshallIslands',
        defaultMessage: 'Marshall Islands'
      },
      macedonia: {
        id: '_countryOptions.macedonia',
        defaultMessage: 'Macedonia, Republic of'
      },
      mali: {
        id: '_countryOptions.mali',
        defaultMessage: 'Mali'
      },
      myanmar: {
        id: '_countryOptions.myanmar',
        defaultMessage: 'Myanmar'
      },
      mongolia: {
        id: '_countryOptions.mongolia',
        defaultMessage: 'Mongolia'
      },
      macao: {
        id: '_countryOptions.macao',
        defaultMessage: 'Macao'
      },
      northernMarianaIslands: {
        id: '_countryOptions.northernMarianaIslands',
        defaultMessage: 'Northern Mariana Islands'
      },
      martinique: {
        id: '_countryOptions.martinique',
        defaultMessage: 'Martinique'
      },
      mauritania: {
        id: '_countryOptions.mauritania',
        defaultMessage: 'Mauritania'
      },
      montserrat: {
        id: '_countryOptions.montserrat',
        defaultMessage: 'Montserrat'
      },
      malta: {
        id: '_countryOptions.malta',
        defaultMessage: 'Malta'
      },
      mauritius: {
        id: '_countryOptions.mauritius',
        defaultMessage: 'Mauritius'
      },
      maldives: {
        id: '_countryOptions.maldives',
        defaultMessage: 'Maldives'
      },
      malawi: {
        id: '_countryOptions.malawi',
        defaultMessage: 'Malawi'
      },
      mexico: {
        id: '_countryOptions.mexico',
        defaultMessage: 'Mexico'
      },
      malaysia: {
        id: '_countryOptions.malaysia',
        defaultMessage: 'Malaysia'
      },
      mozambique: {
        id: '_countryOptions.mozambique',
        defaultMessage: 'Mozambique'
      },
      namibia: {
        id: '_countryOptions.namibia',
        defaultMessage: 'Namibia'
      },
      newCaledonia: {
        id: '_countryOptions.newCaledonia',
        defaultMessage: 'New Caledonia'
      },
      niger: {
        id: '_countryOptions.niger',
        defaultMessage: 'Niger'
      },
      nigeria: {
        id: '_countryOptions.nigeria',
        defaultMessage: 'Nigeria'
      },
      nicaragua: {
        id: '_countryOptions.nicaragua',
        defaultMessage: 'Nicaragua'
      },
      netherlands: {
        id: '_countryOptions.netherlands',
        defaultMessage: 'Netherlands'
      },
      norway: {
        id: '_countryOptions.norway',
        defaultMessage: 'Norway'
      },
      nepal: {
        id: '_countryOptions.nepal',
        defaultMessage: 'Nepal'
      },
      nauru: {
        id: '_countryOptions.nauru',
        defaultMessage: 'Nauru'
      },
      niue: {
        id: '_countryOptions.niue',
        defaultMessage: 'Niue'
      },
      newZealand: {
        id: '_countryOptions.newZealand',
        defaultMessage: 'New Zealand'
      },
      oman: {
        id: '_countryOptions.oman',
        defaultMessage: 'Oman'
      },
      panama: {
        id: '_countryOptions.panama',
        defaultMessage: 'Panama'
      },
      peru: {
        id: '_countryOptions.peru',
        defaultMessage: 'Peru'
      },
      frenchPolynesia: {
        id: '_countryOptions.frenchPolynesia',
        defaultMessage: 'French Polynesia'
      },
      papuaNewGuinea: {
        id: '_countryOptions.papuaNewGuinea',
        defaultMessage: 'Papua New Guinea'
      },
      philippines: {
        id: '_countryOptions.philippines',
        defaultMessage: 'Philippines'
      },
      pakistan: {
        id: '_countryOptions.pakistan',
        defaultMessage: 'Pakistan'
      },
      poland: {
        id: '_countryOptions.poland',
        defaultMessage: 'Poland'
      },
      saintPierreAndMiquelon: {
        id: '_countryOptions.saintPierreAndMiquelon',
        defaultMessage: 'Saint Pierre and Miquelon'
      },
      puertoRico: {
        id: '_countryOptions.puertoRico',
        defaultMessage: 'Puerto Rico'
      },
      portugal: {
        id: '_countryOptions.portugal',
        defaultMessage: 'Portugal'
      },
      palau: {
        id: '_countryOptions.palau',
        defaultMessage: 'Palau'
      },
      paraguay: {
        id: '_countryOptions.paraguay',
        defaultMessage: 'Paraguay'
      },
      qatar: {
        id: '_countryOptions.qatar',
        defaultMessage: 'Qatar'
      },
      reunion: {
        id: '_countryOptions.reunion',
        defaultMessage: 'Réunion'
      },
      romania: {
        id: '_countryOptions.romania',
        defaultMessage: 'Romania'
      },
      serbia: {
        id: '_countryOptions.serbia',
        defaultMessage: 'Serbia'
      },
      russianFederation: {
        id: '_countryOptions.russianFederation',
        defaultMessage: 'Russian Federation'
      },
      rwanda: {
        id: '_countryOptions.rwanda',
        defaultMessage: 'Rwanda'
      },
      saudiArabia: {
        id: '_countryOptions.saudiArabia',
        defaultMessage: 'Saudi Arabia'
      },
      solomonIslands: {
        id: '_countryOptions.solomonIslands',
        defaultMessage: 'Solomon Islands'
      },
      seychelles: {
        id: '_countryOptions.seychelles',
        defaultMessage: 'Seychelles'
      },
      sudan: {
        id: '_countryOptions.sudan',
        defaultMessage: 'Sudan'
      },
      sweden: {
        id: '_countryOptions.sweden',
        defaultMessage: 'Sweden'
      },
      singapore: {
        id: '_countryOptions.singapore',
        defaultMessage: 'Singapore'
      },
      saintHelena: {
        id: '_countryOptions.saintHelena',
        defaultMessage: 'Saint Helena, Ascension and Tristan da Cunha'
      },
      slovenia: {
        id: '_countryOptions.slovenia',
        defaultMessage: 'Slovenia'
      },
      slovakia: {
        id: '_countryOptions.slovakia',
        defaultMessage: 'Slovakia'
      },
      sierraLeone: {
        id: '_countryOptions.sierraLeone',
        defaultMessage: 'Sierra Leone'
      },
      sanMarino: {
        id: '_countryOptions.sanMarino',
        defaultMessage: 'San Marino'
      },
      senegal: {
        id: '_countryOptions.senegal',
        defaultMessage: 'Senegal'
      },
      somalia: {
        id: '_countryOptions.somalia',
        defaultMessage: 'Somalia'
      },
      suriname: {
        id: '_countryOptions.suriname',
        defaultMessage: 'Suriname'
      },
      southSudan: {
        id: '_countryOptions.southSudan',
        defaultMessage: 'South Sudan'
      },
      saoTomeAndPrincipe: {
        id: '_countryOptions.saoTomeAndPrincipe',
        defaultMessage: 'Sao Tome and Principe'
      },
      elSalvador: {
        id: '_countryOptions.elSalvador',
        defaultMessage: 'El Salvador'
      },
      sintMaarten: {
        id: '_countryOptions.sintMaarten',
        defaultMessage: 'Sint Maarten (Dutch part)'
      },
      syrianArabRepublic: {
        id: '_countryOptions.syrianArabRepublic',
        defaultMessage: 'Syrian Arab Republic'
      },
      swaziland: {
        id: '_countryOptions.swaziland',
        defaultMessage: 'Swaziland'
      },
      turksAndCaicosIslands: {
        id: '_countryOptions.turksAndCaicosIslands',
        defaultMessage: 'Turks and Caicos Islands'
      },
      chad: {
        id: '_countryOptions.chad',
        defaultMessage: 'Chad'
      },
      togo: {
        id: '_countryOptions.togo',
        defaultMessage: 'Togo'
      },
      thailand: {
        id: '_countryOptions.thailand',
        defaultMessage: 'Thailand'
      },
      tajikistan: {
        id: '_countryOptions.tajikistan',
        defaultMessage: 'Tajikistan'
      },
      tokelau: {
        id: '_countryOptions.tokelau',
        defaultMessage: 'Tokelau'
      },
      timorLeste: {
        id: '_countryOptions.timorLeste',
        defaultMessage: 'Timor-Leste'
      },
      turkmenistan: {
        id: '_countryOptions.turkmenistan',
        defaultMessage: 'Turkmenistan'
      },
      tunisia: {
        id: '_countryOptions.tunisia',
        defaultMessage: 'Tunisia'
      },
      tonga: {
        id: '_countryOptions.tonga',
        defaultMessage: 'Tonga'
      },
      turkey: {
        id: '_countryOptions.turkey',
        defaultMessage: 'Turkey'
      },
      trinidadAndTobago: {
        id: '_countryOptions.trinidadAndTobago',
        defaultMessage: 'Trinidad and Tobago'
      },
      tuvalu: {
        id: '_countryOptions.tuvalu',
        defaultMessage: 'Tuvalu'
      },
      taiwan: {
        id: '_countryOptions.taiwan',
        defaultMessage: 'Taiwan, Province of China'
      },
      tanzania: {
        id: '_countryOptions.tanzania',
        defaultMessage: 'Tanzania, United Republic of'
      },
      ukraine: {
        id: '_countryOptions.ukraine',
        defaultMessage: 'Ukraine'
      },
      uganda: {
        id: '_countryOptions.uganda',
        defaultMessage: 'Uganda'
      },
      unitedStates: {
        id: '_countryOptions.unitedStates',
        defaultMessage: 'United States'
      },
      uruguay: {
        id: '_countryOptions.uruguay',
        defaultMessage: 'Uruguay'
      },
      uzbekistan: {
        id: '_countryOptions.uzbekistan',
        defaultMessage: 'Uzbekistan'
      },
      holySee: {
        id: '_countryOptions.holySee',
        defaultMessage: 'Holy See (Vatican City State)'
      },
      saintVincentAndTheGrenadines: {
        id: '_countryOptions.saintVincentAndTheGrenadines',
        defaultMessage: 'Saint Vincent and the Grenadines'
      },
      venezuela: {
        id: '_countryOptions.venezuela',
        defaultMessage: 'Venezuela, Bolivarian Republic of'
      },
      britishVirginIslands: {
        id: '_countryOptions.britishVirginIslands',
        defaultMessage: 'Virgin Islands, British'
      },
      usVirginIslands: {
        id: '_countryOptions.usVirginIslands',
        defaultMessage: 'Virgin Islands, U.S.'
      },
      vietNam: {
        id: '_countryOptions.vietNam',
        defaultMessage: 'Viet Nam'
      },
      vanuatu: {
        id: '_countryOptions.vanuatu',
        defaultMessage: 'Vanuatu'
      },
      wallisAndFutuna: {
        id: '_countryOptions.wallisAndFutuna',
        defaultMessage: 'Wallis and Futuna'
      },
      samoa: {
        id: '_countryOptions.samoa',
        defaultMessage: 'Samoa'
      },
      yemen: {
        id: '_countryOptions.yemen',
        defaultMessage: 'Yemen'
      },
      southAfrica: {
        id: '_countryOptions.southAfrica',
        defaultMessage: 'South Africa'
      },
      zambia: {
        id: '_countryOptions.zambia',
        defaultMessage: 'Zambia'
      },
      zimbabwe: {
        id: '_countryOptions.zimbabwe',
        defaultMessage: 'Zimbabwe'
      }
    })

    this.countryOptions = [
      {
        code: 'ad',
        name: this.props.intl.formatMessage(this.intlMessages.andorra),
        prefix: '376'
      },
      {
        code: 'ae',
        name: this.props.intl.formatMessage(this.intlMessages.unitedArabEmirates),
        prefix: '971'
      },
      {
        code: 'af',
        name: this.props.intl.formatMessage(this.intlMessages.afghanistan),
        prefix: '93'
      },
      {
        code: 'ag',
        name: this.props.intl.formatMessage(this.intlMessages.antiguaAndBarbuda),
        prefix: '1268'
      },
      {
        code: 'ai',
        name: this.props.intl.formatMessage(this.intlMessages.anguilla),
        prefix: '1264'
      },
      {
        code: 'al',
        name: this.props.intl.formatMessage(this.intlMessages.albania),
        prefix: '355'
      },
      {
        code: 'am',
        name: this.props.intl.formatMessage(this.intlMessages.armenia),
        prefix: '374'
      },
      {
        code: 'ao',
        name: this.props.intl.formatMessage(this.intlMessages.angola),
        prefix: '244'
      },
      {
        code: 'aq',
        name: this.props.intl.formatMessage(this.intlMessages.antarctica),
        prefix: '672'
      },
      {
        code: 'ar',
        name: this.props.intl.formatMessage(this.intlMessages.argentina),
        prefix: '54'
      },
      {
        code: 'at',
        name: this.props.intl.formatMessage(this.intlMessages.austria),
        prefix: '43'
      },
      {
        code: 'au',
        name: this.props.intl.formatMessage(this.intlMessages.australia),
        prefix: '61'
      },
      {
        code: 'aw',
        name: this.props.intl.formatMessage(this.intlMessages.aruba),
        prefix: '297'
      },
      {
        code: 'az',
        name: this.props.intl.formatMessage(this.intlMessages.azerbaijan),
        prefix: '994'
      },
      {
        code: 'ba',
        name: this.props.intl.formatMessage(this.intlMessages.bosniaAndHerzegovina),
        prefix: '387'
      },
      {
        code: 'bb',
        name: this.props.intl.formatMessage(this.intlMessages.barbados),
        prefix: '1246'
      },
      {
        code: 'bd',
        name: this.props.intl.formatMessage(this.intlMessages.bangladesh),
        prefix: '880'
      },
      {
        code: 'be',
        name: this.props.intl.formatMessage(this.intlMessages.belgium),
        prefix: '32'
      },
      {
        code: 'bf',
        name: this.props.intl.formatMessage(this.intlMessages.burkinaFaso),
        prefix: '226'
      },
      {
        code: 'bg',
        name: this.props.intl.formatMessage(this.intlMessages.bulgaria),
        prefix: '359'
      },
      {
        code: 'bh',
        name: this.props.intl.formatMessage(this.intlMessages.bahrain),
        prefix: '973'
      },
      {
        code: 'bi',
        name: this.props.intl.formatMessage(this.intlMessages.burundi),
        prefix: '257'
      },
      {
        code: 'bj',
        name: this.props.intl.formatMessage(this.intlMessages.benin),
        prefix: '229'
      },
      {
        code: 'bm',
        name: this.props.intl.formatMessage(this.intlMessages.bermuda),
        prefix: '1441'
      },
      {
        code: 'bn',
        name: this.props.intl.formatMessage(this.intlMessages.bruneiDarussalam),
        prefix: '673'
      },
      {
        code: 'bo',
        name: this.props.intl.formatMessage(this.intlMessages.bolivia),
        prefix: '591'
      },
      {
        code: 'br',
        name: this.props.intl.formatMessage(this.intlMessages.brazil),
        prefix: '55'
      },
      {
        code: 'bs',
        name: this.props.intl.formatMessage(this.intlMessages.bahamas),
        prefix: '1242'
      },
      {
        code: 'bt',
        name: this.props.intl.formatMessage(this.intlMessages.bhutan),
        prefix: '975'
      },
      {
        code: 'bw',
        name: this.props.intl.formatMessage(this.intlMessages.botswana),
        prefix: '267'
      },
      {
        code: 'by',
        name: this.props.intl.formatMessage(this.intlMessages.belarus),
        prefix: '375'
      },
      {
        code: 'bz',
        name: this.props.intl.formatMessage(this.intlMessages.belize),
        prefix: '501'
      },
      {
        code: 'ca',
        name: this.props.intl.formatMessage(this.intlMessages.canada),
        prefix: '1'
      },
      {
        code: 'cd',
        name: this.props.intl.formatMessage(this.intlMessages.congo),
        prefix: '243'
      },
      {
        code: 'cf',
        name: this.props.intl.formatMessage(this.intlMessages.centralAfricanRepublic),
        prefix: '236'
      },
      {
        code: 'cg',
        name: this.props.intl.formatMessage(this.intlMessages.congo),
        prefix: '242'
      },
      {
        code: 'ch',
        name: this.props.intl.formatMessage(this.intlMessages.switzerland),
        prefix: '41'
      },
      {
        code: 'ci',
        name: this.props.intl.formatMessage(this.intlMessages.ivoryCoast),
        prefix: '225'
      },
      {
        code: 'ck',
        name: this.props.intl.formatMessage(this.intlMessages.cookIslands),
        prefix: '682'
      },
      {
        code: 'cl',
        name: this.props.intl.formatMessage(this.intlMessages.chile),
        prefix: '56'
      },
      {
        code: 'cm',
        name: this.props.intl.formatMessage(this.intlMessages.cameroon),
        prefix: '237'
      },
      {
        code: 'cn',
        name: this.props.intl.formatMessage(this.intlMessages.china),
        prefix: '86'
      },
      {
        code: 'co',
        name: this.props.intl.formatMessage(this.intlMessages.colombia),
        prefix: '57'
      },
      {
        code: 'cr',
        name: this.props.intl.formatMessage(this.intlMessages.costaRica),
        prefix: '506'
      },
      {
        code: 'cu',
        name: this.props.intl.formatMessage(this.intlMessages.cuba),
        prefix: '53'
      },
      {
        code: 'cv',
        name: this.props.intl.formatMessage(this.intlMessages.caboVerde),
        prefix: '238'
      },
      {
        code: 'cw',
        name: this.props.intl.formatMessage(this.intlMessages.curacao),
        prefix: '599'
      },
      {
        code: 'cy',
        name: this.props.intl.formatMessage(this.intlMessages.cyprus),
        prefix: '357'
      },
      {
        code: 'cz',
        name: this.props.intl.formatMessage(this.intlMessages.czechia),
        prefix: '420'
      },
      {
        code: 'de',
        name: this.props.intl.formatMessage(this.intlMessages.germany),
        prefix: '49'
      },
      {
        code: 'dj',
        name: this.props.intl.formatMessage(this.intlMessages.djibouti),
        prefix: '253'
      },
      {
        code: 'dk',
        name: this.props.intl.formatMessage(this.intlMessages.denmark),
        prefix: '45'
      },
      {
        code: 'dm',
        name: this.props.intl.formatMessage(this.intlMessages.dominica),
        prefix: '1767'
      },
      {
        code: 'do',
        name: this.props.intl.formatMessage(this.intlMessages.dominicanRepublic),
        prefix: '1849'
      },
      {
        code: 'dz',
        name: this.props.intl.formatMessage(this.intlMessages.algeria),
        prefix: '213'
      },
      {
        code: 'ec',
        name: this.props.intl.formatMessage(this.intlMessages.ecuador),
        prefix: '593'
      },
      {
        code: 'ee',
        name: this.props.intl.formatMessage(this.intlMessages.estonia),
        prefix: '372'
      },
      {
        code: 'eg',
        name: this.props.intl.formatMessage(this.intlMessages.egypt),
        prefix: '20'
      },
      {
        code: 'er',
        name: this.props.intl.formatMessage(this.intlMessages.eritrea),
        prefix: '291'
      },
      {
        code: 'es',
        name: this.props.intl.formatMessage(this.intlMessages.spain),
        prefix: '34'
      },
      {
        code: 'et',
        name: this.props.intl.formatMessage(this.intlMessages.ethiopia),
        prefix: '251'
      },
      {
        code: 'fi',
        name: this.props.intl.formatMessage(this.intlMessages.finland),
        prefix: '358'
      },
      {
        code: 'fj',
        name: this.props.intl.formatMessage(this.intlMessages.fiji),
        prefix: '679'
      },
      {
        code: 'fk',
        name: this.props.intl.formatMessage(this.intlMessages.falklandIslands),
        prefix: '500'
      },
      {
        code: 'fm',
        name: this.props.intl.formatMessage(this.intlMessages.micronesia),
        prefix: '691'
      },
      {
        code: 'fo',
        name: this.props.intl.formatMessage(this.intlMessages.faroeIslands),
        prefix: '298'
      },
      {
        code: 'fr',
        name: this.props.intl.formatMessage(this.intlMessages.france),
        prefix: '33'
      },
      {
        code: 'ga',
        name: this.props.intl.formatMessage(this.intlMessages.gabon),
        prefix: '241'
      },
      {
        code: 'gb',
        name: this.props.intl.formatMessage(this.intlMessages.unitedKingdom),
        prefix: '44'
      },
      {
        code: 'gd',
        name: this.props.intl.formatMessage(this.intlMessages.grenada),
        prefix: '1473'
      },
      {
        code: 'ge',
        name: this.props.intl.formatMessage(this.intlMessages.georgia),
        prefix: '995'
      },
      {
        code: 'gf',
        name: this.props.intl.formatMessage(this.intlMessages.frenchGuiana),
        prefix: '594'
      },
      {
        code: 'gh',
        name: this.props.intl.formatMessage(this.intlMessages.ghana),
        prefix: '233'
      },
      {
        code: 'gi',
        name: this.props.intl.formatMessage(this.intlMessages.gibraltar),
        prefix: '350'
      },
      {
        code: 'gl',
        name: this.props.intl.formatMessage(this.intlMessages.greenland),
        prefix: '299'
      },
      {
        code: 'gm',
        name: this.props.intl.formatMessage(this.intlMessages.gambia),
        prefix: '220'
      },
      {
        code: 'gn',
        name: this.props.intl.formatMessage(this.intlMessages.guinea),
        prefix: '224'
      },
      {
        code: 'gp',
        name: this.props.intl.formatMessage(this.intlMessages.guadeloupe),
        prefix: '590'
      },
      {
        code: 'gq',
        name: this.props.intl.formatMessage(this.intlMessages.equatorialGuinea),
        prefix: '240'
      },
      {
        code: 'gr',
        name: this.props.intl.formatMessage(this.intlMessages.greece),
        prefix: '30'
      },
      {
        code: 'gt',
        name: this.props.intl.formatMessage(this.intlMessages.guatemala),
        prefix: '502'
      },
      {
        code: 'gw',
        name: this.props.intl.formatMessage(this.intlMessages.guineaBissau),
        prefix: '245'
      },
      {
        code: 'gy',
        name: this.props.intl.formatMessage(this.intlMessages.guyana),
        prefix: '592'
      },
      {
        code: 'hk',
        name: this.props.intl.formatMessage(this.intlMessages.hongKong),
        prefix: '852'
      },
      {
        code: 'hn',
        name: this.props.intl.formatMessage(this.intlMessages.honduras),
        prefix: '504'
      },
      {
        code: 'hr',
        name: this.props.intl.formatMessage(this.intlMessages.croatia),
        prefix: '385'
      },
      {
        code: 'ht',
        name: this.props.intl.formatMessage(this.intlMessages.haiti),
        prefix: '509'
      },
      {
        code: 'hu',
        name: this.props.intl.formatMessage(this.intlMessages.hungary),
        prefix: '36'
      },
      {
        code: 'id',
        name: this.props.intl.formatMessage(this.intlMessages.indonesia),
        prefix: '62'
      },
      {
        code: 'ie',
        name: this.props.intl.formatMessage(this.intlMessages.ireland),
        prefix: '353'
      },
      {
        code: 'il',
        name: this.props.intl.formatMessage(this.intlMessages.israel),
        prefix: '972'
      },
      {
        code: 'in',
        name: this.props.intl.formatMessage(this.intlMessages.india),
        prefix: '91'
      },
      {
        code: 'iq',
        name: this.props.intl.formatMessage(this.intlMessages.iraq),
        prefix: '964'
      },
      {
        code: 'ir',
        name: this.props.intl.formatMessage(this.intlMessages.iran),
        prefix: '98'
      },
      {
        code: 'is',
        name: this.props.intl.formatMessage(this.intlMessages.iceland),
        prefix: '354'
      },
      {
        code: 'it',
        name: this.props.intl.formatMessage(this.intlMessages.italy),
        prefix: '39'
      },
      {
        code: 'jm',
        name: this.props.intl.formatMessage(this.intlMessages.jamaica),
        prefix: '1876'
      },
      {
        code: 'jo',
        name: this.props.intl.formatMessage(this.intlMessages.jordan),
        prefix: '962'
      },
      {
        code: 'jp',
        name: this.props.intl.formatMessage(this.intlMessages.japan),
        prefix: '81'
      },
      {
        code: 'ke',
        name: this.props.intl.formatMessage(this.intlMessages.kenya),
        prefix: '254'
      },
      {
        code: 'kg',
        name: this.props.intl.formatMessage(this.intlMessages.kyrgyzstan),
        prefix: '996'
      },
      {
        code: 'kh',
        name: this.props.intl.formatMessage(this.intlMessages.cambodia),
        prefix: '855'
      },
      {
        code: 'ki',
        name: this.props.intl.formatMessage(this.intlMessages.kiribati),
        prefix: '686'
      },
      {
        code: 'km',
        name: this.props.intl.formatMessage(this.intlMessages.comoros),
        prefix: '269'
      },
      {
        code: 'kn',
        name: this.props.intl.formatMessage(this.intlMessages.saintKittsAndNevis),
        prefix: '1869'
      },
      {
        code: 'kp',
        name: this.props.intl.formatMessage(this.intlMessages.northKorea),
        prefix: '850'
      },
      {
        code: 'kr',
        name: this.props.intl.formatMessage(this.intlMessages.southKorea),
        prefix: '82'
      },
      {
        code: 'kw',
        name: this.props.intl.formatMessage(this.intlMessages.kuwait),
        prefix: '965'
      },
      {
        code: 'ky',
        name: this.props.intl.formatMessage(this.intlMessages.caymanIslands),
        prefix: '1345'
      },
      {
        code: 'la',
        name: this.props.intl.formatMessage(this.intlMessages.lao),
        prefix: '856'
      },
      {
        code: 'lb',
        name: this.props.intl.formatMessage(this.intlMessages.lebanon),
        prefix: '961'
      },
      {
        code: 'lc',
        name: this.props.intl.formatMessage(this.intlMessages.saintLucia),
        prefix: '1758'
      },
      {
        code: 'li',
        name: this.props.intl.formatMessage(this.intlMessages.liechtenstein),
        prefix: '423'
      },
      {
        code: 'lk',
        name: this.props.intl.formatMessage(this.intlMessages.sriLanka),
        prefix: '94'
      },
      {
        code: 'lr',
        name: this.props.intl.formatMessage(this.intlMessages.liberia),
        prefix: '231'
      },
      {
        code: 'ls',
        name: this.props.intl.formatMessage(this.intlMessages.lesotho),
        prefix: '266'
      },
      {
        code: 'lt',
        name: this.props.intl.formatMessage(this.intlMessages.lithuania),
        prefix: '370'
      },
      {
        code: 'lu',
        name: this.props.intl.formatMessage(this.intlMessages.luxembourg),
        prefix: '352'
      },
      {
        code: 'lv',
        name: this.props.intl.formatMessage(this.intlMessages.latvia),
        prefix: '371'
      },
      {
        code: 'ly',
        name: this.props.intl.formatMessage(this.intlMessages.libya),
        prefix: '218'
      },
      {
        code: 'ma',
        name: this.props.intl.formatMessage(this.intlMessages.morocco),
        prefix: '212'
      },
      {
        code: 'mc',
        name: this.props.intl.formatMessage(this.intlMessages.monaco),
        prefix: '377'
      },
      {
        code: 'md',
        name: this.props.intl.formatMessage(this.intlMessages.moldova),
        prefix: '373'
      },
      {
        code: 'me',
        name: this.props.intl.formatMessage(this.intlMessages.montenegro),
        prefix: '382'
      },
      {
        code: 'mg',
        name: this.props.intl.formatMessage(this.intlMessages.madagascar),
        prefix: '261'
      },
      {
        code: 'mh',
        name: this.props.intl.formatMessage(this.intlMessages.marshallIslands),
        prefix: '692'
      },
      {
        code: 'mk',
        name: this.props.intl.formatMessage(this.intlMessages.macedonia),
        prefix: '389'
      },
      {
        code: 'ml',
        name: this.props.intl.formatMessage(this.intlMessages.mali),
        prefix: '223'
      },
      {
        code: 'mm',
        name: this.props.intl.formatMessage(this.intlMessages.myanmar),
        prefix: '95'
      },
      {
        code: 'mn',
        name: this.props.intl.formatMessage(this.intlMessages.mongolia),
        prefix: '976'
      },
      {
        code: 'mo',
        name: this.props.intl.formatMessage(this.intlMessages.macao),
        prefix: '853'
      },
      {
        code: 'mp',
        name: this.props.intl.formatMessage(this.intlMessages.northernMarianaIslands),
        prefix: '1670'
      },
      {
        code: 'mq',
        name: this.props.intl.formatMessage(this.intlMessages.martinique),
        prefix: '596'
      },
      {
        code: 'mr',
        name: this.props.intl.formatMessage(this.intlMessages.mauritania),
        prefix: '222'
      },
      {
        code: 'ms',
        name: this.props.intl.formatMessage(this.intlMessages.montserrat),
        prefix: '1664'
      },
      {
        code: 'mt',
        name: this.props.intl.formatMessage(this.intlMessages.malta),
        prefix: '356'
      },
      {
        code: 'mu',
        name: this.props.intl.formatMessage(this.intlMessages.mauritius),
        prefix: '230'
      },
      {
        code: 'mv',
        name: this.props.intl.formatMessage(this.intlMessages.maldives),
        prefix: '960'
      },
      {
        code: 'mw',
        name: this.props.intl.formatMessage(this.intlMessages.malawi),
        prefix: '265'
      },
      {
        code: 'mx',
        name: this.props.intl.formatMessage(this.intlMessages.mexico),
        prefix: '52'
      },
      {
        code: 'my',
        name: this.props.intl.formatMessage(this.intlMessages.malaysia),
        prefix: '60'
      },
      {
        code: 'mz',
        name: this.props.intl.formatMessage(this.intlMessages.mozambique),
        prefix: '258'
      },
      {
        code: 'na',
        name: this.props.intl.formatMessage(this.intlMessages.namibia),
        prefix: '264'
      },
      {
        code: 'nc',
        name: this.props.intl.formatMessage(this.intlMessages.newCaledonia),
        prefix: '687'
      },
      {
        code: 'ne',
        name: this.props.intl.formatMessage(this.intlMessages.niger),
        prefix: '227'
      },
      {
        code: 'ng',
        name: this.props.intl.formatMessage(this.intlMessages.nigeria),
        prefix: '234'
      },
      {
        code: 'ni',
        name: this.props.intl.formatMessage(this.intlMessages.nicaragua),
        prefix: '505'
      },
      {
        code: 'nl',
        name: this.props.intl.formatMessage(this.intlMessages.netherlands),
        prefix: '31'
      },
      {
        code: 'no',
        name: this.props.intl.formatMessage(this.intlMessages.norway),
        prefix: '47'
      },
      {
        code: 'np',
        name: this.props.intl.formatMessage(this.intlMessages.nepal),
        prefix: '977'
      },
      {
        code: 'nr',
        name: this.props.intl.formatMessage(this.intlMessages.nauru),
        prefix: '674'
      },
      {
        code: 'nu',
        name: this.props.intl.formatMessage(this.intlMessages.niue),
        prefix: '683'
      },
      {
        code: 'nz',
        name: this.props.intl.formatMessage(this.intlMessages.newZealand),
        prefix: '64'
      },
      {
        code: 'om',
        name: this.props.intl.formatMessage(this.intlMessages.oman),
        prefix: '968'
      },
      {
        code: 'pa',
        name: this.props.intl.formatMessage(this.intlMessages.panama),
        prefix: '507'
      },
      {
        code: 'pe',
        name: this.props.intl.formatMessage(this.intlMessages.peru),
        prefix: '51'
      },
      {
        code: 'pf',
        name: this.props.intl.formatMessage(this.intlMessages.frenchPolynesia),
        prefix: '689'
      },
      {
        code: 'pg',
        name: this.props.intl.formatMessage(this.intlMessages.papuaNewGuinea),
        prefix: '675'
      },
      {
        code: 'ph',
        name: this.props.intl.formatMessage(this.intlMessages.philippines),
        prefix: '63'
      },
      {
        code: 'pk',
        name: this.props.intl.formatMessage(this.intlMessages.pakistan),
        prefix: '92'
      },
      {
        code: 'pl',
        name: this.props.intl.formatMessage(this.intlMessages.poland),
        prefix: '48'
      },
      {
        code: 'pm',
        name: this.props.intl.formatMessage(this.intlMessages.saintPierreAndMiquelon),
        prefix: '508'
      },
      {
        code: 'pr',
        name: this.props.intl.formatMessage(this.intlMessages.puertoRico),
        prefix: '1939'
      },
      {
        code: 'pt',
        name: this.props.intl.formatMessage(this.intlMessages.portugal),
        prefix: '351'
      },
      {
        code: 'pw',
        name: this.props.intl.formatMessage(this.intlMessages.palau),
        prefix: '680'
      },
      {
        code: 'py',
        name: this.props.intl.formatMessage(this.intlMessages.paraguay),
        prefix: '595'
      },
      {
        code: 'qa',
        name: this.props.intl.formatMessage(this.intlMessages.qatar),
        prefix: '974'
      },
      {
        code: 're',
        name: this.props.intl.formatMessage(this.intlMessages.reunion),
        prefix: '262'
      },
      {
        code: 'ro',
        name: this.props.intl.formatMessage(this.intlMessages.romania),
        prefix: '40'
      },
      {
        code: 'rs',
        name: this.props.intl.formatMessage(this.intlMessages.serbia),
        prefix: '381'
      },
      {
        code: 'ru',
        name: this.props.intl.formatMessage(this.intlMessages.russianFederation),
        prefix: '7'
      },
      {
        code: 'rw',
        name: this.props.intl.formatMessage(this.intlMessages.rwanda),
        prefix: '250'
      },
      {
        code: 'sa',
        name: this.props.intl.formatMessage(this.intlMessages.saudiArabia),
        prefix: '966'
      },
      {
        code: 'sb',
        name: this.props.intl.formatMessage(this.intlMessages.solomonIslands),
        prefix: '677'
      },
      {
        code: 'sc',
        name: this.props.intl.formatMessage(this.intlMessages.seychelles),
        prefix: '248'
      },
      {
        code: 'sd',
        name: this.props.intl.formatMessage(this.intlMessages.sudan),
        prefix: '249'
      },
      {
        code: 'se',
        name: this.props.intl.formatMessage(this.intlMessages.sweden),
        prefix: '46'
      },
      {
        code: 'sg',
        name: this.props.intl.formatMessage(this.intlMessages.singapore),
        prefix: '65'
      },
      {
        code: 'sh',
        name: this.props.intl.formatMessage(this.intlMessages.saintHelena),
        prefix: '290'
      },
      {
        code: 'si',
        name: this.props.intl.formatMessage(this.intlMessages.slovenia),
        prefix: '386'
      },
      {
        code: 'sk',
        name: this.props.intl.formatMessage(this.intlMessages.slovakia),
        prefix: '421'
      },
      {
        code: 'sl',
        name: this.props.intl.formatMessage(this.intlMessages.sierraLeone),
        prefix: '232'
      },
      {
        code: 'sm',
        name: this.props.intl.formatMessage(this.intlMessages.sanMarino),
        prefix: '378'
      },
      {
        code: 'sn',
        name: this.props.intl.formatMessage(this.intlMessages.senegal),
        prefix: '221'
      },
      {
        code: 'so',
        name: this.props.intl.formatMessage(this.intlMessages.somalia),
        prefix: '252'
      },
      {
        code: 'sr',
        name: this.props.intl.formatMessage(this.intlMessages.suriname),
        prefix: '597'
      },
      {
        code: 'ss',
        name: this.props.intl.formatMessage(this.intlMessages.southSudan),
        prefix: '211'
      },
      {
        code: 'st',
        name: this.props.intl.formatMessage(this.intlMessages.saoTomeAndPrincipe),
        prefix: '239'
      },
      {
        code: 'sv',
        name: this.props.intl.formatMessage(this.intlMessages.elSalvador),
        prefix: '503'
      },
      {
        code: 'sx',
        name: this.props.intl.formatMessage(this.intlMessages.sintMaarten),
        prefix: '1721'
      },
      {
        code: 'sy',
        name: this.props.intl.formatMessage(this.intlMessages.syrianArabRepublic),
        prefix: '963'
      },
      {
        code: 'sz',
        name: this.props.intl.formatMessage(this.intlMessages.swaziland),
        prefix: '268'
      },
      {
        code: 'tc',
        name: this.props.intl.formatMessage(this.intlMessages.turksAndCaicosIslands),
        prefix: '1649'
      },
      {
        code: 'td',
        name: this.props.intl.formatMessage(this.intlMessages.chad),
        prefix: '235'
      },
      {
        code: 'tg',
        name: this.props.intl.formatMessage(this.intlMessages.togo),
        prefix: '228'
      },
      {
        code: 'th',
        name: this.props.intl.formatMessage(this.intlMessages.thailand),
        prefix: '66'
      },
      {
        code: 'tj',
        name: this.props.intl.formatMessage(this.intlMessages.tajikistan),
        prefix: '992'
      },
      {
        code: 'tk',
        name: this.props.intl.formatMessage(this.intlMessages.tokelau),
        prefix: '690'
      },
      {
        code: 'tl',
        name: this.props.intl.formatMessage(this.intlMessages.timorLeste),
        prefix: '670'
      },
      {
        code: 'tm',
        name: this.props.intl.formatMessage(this.intlMessages.turkmenistan),
        prefix: '993'
      },
      {
        code: 'tn',
        name: this.props.intl.formatMessage(this.intlMessages.tunisia),
        prefix: '216'
      },
      {
        code: 'to',
        name: this.props.intl.formatMessage(this.intlMessages.tonga),
        prefix: '676'
      },
      {
        code: 'tr',
        name: this.props.intl.formatMessage(this.intlMessages.turkey),
        prefix: '90'
      },
      {
        code: 'tt',
        name: this.props.intl.formatMessage(this.intlMessages.trinidadAndTobago),
        prefix: '1868'
      },
      {
        code: 'tv',
        name: this.props.intl.formatMessage(this.intlMessages.tuvalu),
        prefix: '688'
      },
      {
        code: 'tw',
        name: this.props.intl.formatMessage(this.intlMessages.taiwan),
        prefix: '886'
      },
      {
        code: 'tz',
        name: this.props.intl.formatMessage(this.intlMessages.tanzania),
        prefix: '255'
      },
      {
        code: 'ua',
        name: this.props.intl.formatMessage(this.intlMessages.ukraine),
        prefix: '380'
      },
      {
        code: 'ug',
        name: this.props.intl.formatMessage(this.intlMessages.uganda),
        prefix: '256'
      },
      {
        code: 'us',
        name: this.props.intl.formatMessage(this.intlMessages.unitedStates),
        prefix: '1'
      },
      {
        code: 'uy',
        name: this.props.intl.formatMessage(this.intlMessages.uruguay),
        prefix: '598'
      },
      {
        code: 'uz',
        name: this.props.intl.formatMessage(this.intlMessages.uzbekistan),
        prefix: '998'
      },
      {
        code: 'va',
        name: this.props.intl.formatMessage(this.intlMessages.holySee),
        prefix: '379'
      },
      {
        code: 'vc',
        name: this.props.intl.formatMessage(
          this.intlMessages.saintVincentAndTheGrenadines
        ),
        prefix: '1784'
      },
      {
        code: 've',
        name: this.props.intl.formatMessage(this.intlMessages.venezuela),
        prefix: '58'
      },
      {
        code: 'vg',
        name: this.props.intl.formatMessage(this.intlMessages.britishVirginIslands),
        prefix: '1284'
      },
      {
        code: 'vi',
        name: this.props.intl.formatMessage(this.intlMessages.usVirginIslands),
        prefix: '1340'
      },
      {
        code: 'vn',
        name: this.props.intl.formatMessage(this.intlMessages.vietNam),
        prefix: '84'
      },
      {
        code: 'vu',
        name: this.props.intl.formatMessage(this.intlMessages.vanuatu),
        prefix: '678'
      },
      {
        code: 'wf',
        name: this.props.intl.formatMessage(this.intlMessages.wallisAndFutuna),
        prefix: '681'
      },
      {
        code: 'ws',
        name: this.props.intl.formatMessage(this.intlMessages.samoa),
        prefix: '685'
      },
      {
        code: 'ye',
        name: this.props.intl.formatMessage(this.intlMessages.yemen),
        prefix: '967'
      },
      {
        code: 'za',
        name: this.props.intl.formatMessage(this.intlMessages.southAfrica),
        prefix: '27'
      },
      {
        code: 'zm',
        name: this.props.intl.formatMessage(this.intlMessages.zambia),
        prefix: '260'
      },
      {
        code: 'zw',
        name: this.props.intl.formatMessage(this.intlMessages.zimbabwe),
        prefix: '263'
      }
    ].sort((a, b) => {
      if (a.name < b.name) {
        return -1
      } else if (a.name > b.name) {
        return 1
      }
      return 0
    })
  }

  render() {
    return (
      <div>
        {this.countryOptions.map(c => (
          <div
            key={c.code}
            className="dropdown-item d-flex"
            onClick={() => {
              this.props.setSelectedCountry(c)
            }}
          >
            <div>
              <img
                src={`images/flags/${c.code}.svg`}
                role="presentation"
                alt={`${c.code.toUpperCase()} flag`}
              />
            </div>
            <div>{c.name}</div>
            <div>+{c.prefix}</div>
          </div>
        ))}
      </div>
    )
  }
}

export default connect()(injectIntl(CountryOptions))
