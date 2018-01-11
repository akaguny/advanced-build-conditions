const {getBranches, init} = require('../lib/teamcity');

init({
  username: '***REMOVED***',
  password: '***REMOVED***',
  host: '***REMOVED***',
  buildTypeId: '***REMOVED***'
}, 'develop/001.00').then(function () {
  return getBranches();
}).then(console.log);