const {getBuildStatistics, init} = require('../lib/teamcity');

init({
  username: '',
  password: '',
  host: '',
  buildTypeId: ''
}, '').then(function () {
  return getBuildStatistics('ArtifactsSize');
}).then(console.log);