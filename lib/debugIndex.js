const config = require('../spec/fixtures/.config'),
      buildFailedConditions = require('../index'),
      nock = require('nock'),
      path = require('path'),
      basePackagePath = path.resolve(__dirname, '..'),
      fs = require('fs-extra'),
      eslintReportJSON = fs.readJSONSync(`${basePackagePath}/spec/fixtures/error.json`),
      testBuildCountId = 999;

let resultPromise;

config.eslint = {
  masterPath: `/home/alexey/IdeaProjects/sfa`,
  // currentJson: `C:\\Git\\sfa\\toSFA\\toApache\\htdocs\\ps\\reports\\eslint-report.json`
  // currentJson: `/home/alexey/Documents/IdeaProjects/eslint-teamcity-failed-conditions/temp/oneLessErrors/eslint.json`
  // currentJson: `/home/alexey/Documents/IdeaProjects/eslint-teamcity-failed-conditions/temp/manyErrors/eslint.json`
  // currentJson: `C:\\Git\\eslint-teamcity-failed-conditions\\temp\\oneLessErrors\\eslint.json`
  currentJson: `C:\\Git\\eslint-teamcity-failed-conditions\\temp\\manyErrors\\eslint.json`
  // masterJSON: `../spec/fixtures/error.json`
};
config.teamcity = {
  login: '***REMOVED***',
  password: '***REMOVED***',
  host: 'https://***REMOVED***',
  projectId: 'Sfa_Sfa_Develop_QaTest_Ci_Qa',
  buildId: '2.1.0/develop'
};

config.local = true;

// nock(config.teamcity.host)
//   .persist()
//   .log(console.log)
//   .get(`/httpAuth/app/rest/builds?locator=buildType:${config.teamcity.projectId},branch:name:${config.teamcity.buildId},count:1,status:SUCCESS,state:finished`)
//   .reply(200, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><builds count="1" href="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:name:1.12.0/develop,count:1,status:SUCCESS,state:finished" nextHref="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:(name:1.12.0/develop),count:1,status:SUCCESS,state:finished,start:1"><build id="${testBuildCountId}" buildTypeId="***REMOVED***" number="1.12.0/develop" status="SUCCESS" state="finished" branchName="1.12.0/develop" href="/httpAuth/app/rest/builds/id:1900030" webUrl="https://***REMOVED***/viewLog.html?buildId=1900030&amp;buildTypeId=***REMOVED***"/></builds>`)
//   .get(`/repository/download/${config.teamcity.projectId}/${testBuildCountId}:id/reports.zip%21/eslint.json`)
//   .reply(200, eslintReportJSON);

resultPromise = buildFailedConditions(config);

resultPromise.then((res) => {
  console.log(res);
});
