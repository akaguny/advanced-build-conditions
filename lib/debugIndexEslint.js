const config = require('../spec/fixtures/.config'),
      fs = require('fs-extra'),
      tc = require('./teamcity'),
      eslint = require('./eslint'),
      masterJsonPath = './master.json';

config.eslint = {
  currentJson: `/home/alexey/IdeaProjects/sfa/toSFA/toApache/htdocs/ps/reports/eslint-report.json`
};
config.teamcity = {
  login: '***REMOVED***',
  password: '***REMOVED***',
  host: 'https://***REMOVED***',
  projectId: '***REMOVED***'
};
tc.init(config.teamcity, '2.1.0/develop').then(() => {
  return tc.getBuildArtifact();
}).then((eslintResult) => {
  return fs.writeJSON('./master-server', eslintResult);
}).then(() => {
  return eslint(fs.readJSON(masterJsonPath), fs.readJSON(config.eslint.currentJson));
}).then((unicalErrors) => {
  if (unicalErrors.length > 0) {
    throw new Error(`Failed, new errors: ${unicalErrors.length}`);
  } else {
    console.log('Success');
  }
}).catch((e) => {
  console.error(e);
});
