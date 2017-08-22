const tc = require('./teamcity'),
      nock = require('nock'),
      testMasterBuildName = '1.12.0/develop',
      testUsername = 'teamcity',
      testPassword = 'password',
      testHost = 'https://***REMOVED***',
      testProjectId = 'testProjectId',
      path = require('path'),
      basePackagePath = path.resolve(__dirname, '..'),
      fs = require('fs-extra'),
      eslintReportJSON = fs.readJSONSync(`${basePackagePath}/spec/fixtures/error.json`),
      testBuildId = 19994;

nock(testHost)
  .persist()
  .log(console.log)
  .get(`/httpAuth/app/rest/builds?locator=buildType:${testProjectId},branch:name:${testMasterBuildName},count:1,status:SUCCESS,state:finished`)
  .reply(200, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><builds count="1" href="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:name:1.12.0/develop,count:1,status:SUCCESS,state:finished" nextHref="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:(name:1.12.0/develop),count:1,status:SUCCESS,state:finished,start:1"><build id="${testBuildId}" buildTypeId="***REMOVED***" number="1.12.0/develop" status="SUCCESS" state="finished" branchName="1.12.0/develop" href="/httpAuth/app/rest/builds/id:1900030" webUrl="https://***REMOVED***/viewLog.html?buildId=1900030&amp;buildTypeId=***REMOVED***"/></builds>`)
  .get(`/repository/download/${testProjectId}/${testBuildId}:id/reports.zip%21/eslint.json`)
  .reply(200, eslintReportJSON);

tc.init({login: testUsername, password: testPassword, host: testHost, projectId: testProjectId}, testMasterBuildName).then(() => {
  tc.getBuildArtifact().then((res) => {
    console.log('success');
  });
});
