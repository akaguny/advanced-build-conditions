const {getBranches, init} = require('../lib/teamcity');

init({
  username: 'sbmsac_techuser',
  password: 'ad123456',
  host: 'https://teamcity.billing.ru',
  buildTypeId: 'SbmsClassic_ExperimentsClassic_TestUniSubsCtBuild_SbmsCommunityCtTestBuild'
}, 'develop/001.00').then(function () {
  return getBranches();
}).then(console.log);