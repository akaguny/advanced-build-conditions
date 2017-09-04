const config = require('../spec/fixtures/.config'),
      buildFailedConditions = require('../index'),
      eslint = require('./eslint'),
      masterJsonPath = './master.json';

let resultPromise;

config.eslint = {
  currentJson: `/home/alexey/IdeaProjects/sfa/toSFA/toApache/htdocs/ps/reports/eslint-report.json`,
  masterJSON: `/home/alexey/Documents/IdeaProjects/eslint-teamcity-failed-conditions/spec/fixtures/error.json`
};
config.teamcity = {
  login: '***REMOVED***',
  password: '***REMOVED***',
  host: 'https://***REMOVED***',
  projectId: '***REMOVED***'
};

resultPromise = buildFailedConditions(config);

resultPromise.then((res) => {
  console.log(res);
});
