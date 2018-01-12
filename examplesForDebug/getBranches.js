const {getBranches, init} = require('../lib/teamcity');

init({
  username: '',
  password: '',
  host: '',
  buildTypeId: ''
}, function (branches) {
  return branches[1];
}).then(function () {
  return getBranches();
}).then(console.log);