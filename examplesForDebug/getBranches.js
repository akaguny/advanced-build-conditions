const {getBranches, init} = require('../lib/teamcity');

init({
  username: '',
  password: '',
  host: '',
  buildTypeId: ''
}, 'develop/001.00').then(function () {
  return getBranches();
}).then(console.log);