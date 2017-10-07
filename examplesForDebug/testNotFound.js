/**
 * https://github.com/akaguny/advanced-build-conditions/issues/27
 */
const path = require('path'),
      basePackagePath = path.resolve(__dirname, '..'),
      nock = require('nock'),
      TeamcityError = require(`${basePackagePath}/lib/errors.js`).teamcity,
      testMasterBuildName = '1.12.0/develop',
      encodedTestMasterBuildName = encodeURIComponent(testMasterBuildName),
      testUsername = 'teamcity',
      testPassword = 'password',
      testProtocol = 'http://',
      testHost = 'localhost:8080',
      testHostFullUrl = `${testProtocol}${testHost}`,
      testBuildTypeId = 'testBuildTypeId',
      testBuildId = 19994,
      tc = require(path.resolve(basePackagePath, 'lib/teamcity'));

// Моки
nock(testHostFullUrl)
  .persist()
  .log(console.log)
  .get(`/httpAuth/app/rest/builds?locator=buildType:${testBuildTypeId},branch:name:${encodedTestMasterBuildName},count:1,status:SUCCESS,state:finished`)
  .reply(200, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><builds count="1" href="/httpAuth/app/rest/builds?locator=buildType:project_id,branch:name:1.12.0/develop,count:1,status:SUCCESS,state:finished" nextHref="/httpAuth/app/rest/builds?locator=buildType:project_id,branch:(name:1.12.0/develop),count:1,status:SUCCESS,state:finished,start:1"><build id="${testBuildId}" buildTypeId="project_id" number="1.12.0/develop" status="SUCCESS" state="finished" branchName="1.12.0/develop" href="/httpAuth/app/rest/builds/id:1900030" webUrl="https://teamcity.host/viewLog.html?buildId=1900030&amp;buildTypeId=project_id"/></builds>`)
  .get(`/repository/download/${testBuildTypeId}/${testBuildId}:id/reports.zip%21/eslint.json`)
  .reply(404);

// Код
tc.init({username: testUsername, password: testPassword, host: testHostFullUrl, buildTypeId: testBuildTypeId}, testMasterBuildName)
  .then(tc.getBuildArtifact)
  .then((result) => {
    console.log(result);
  }).catch((e) => {
    if (e instanceof TeamcityError) {
      console.log('успех!');
    } else {
      throw new Error(e);
    }
  });
