const inquirer = require('inquirer')

inquirer
  .prompt([
    {
      type: 'input',
      name: 'title',
      message: 'Title'
    },
    {
      type: 'list',
      name: 'storeType',
      message: 'Do you plan to sell a single product or multiple products?',
      choices: ['Single', 'Multiple']
    },
    {
      type: 'password',
      message: 'Enter a password',
      name: 'password',
      mask: '*'
    }
  ])
  .then(answers => {
    console.log(JSON.stringify(answers, null, 2))
    // generate('originstore', answers.password)
  })
