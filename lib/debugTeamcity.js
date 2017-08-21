const tc = require('./teamcity'),
      nock = require('nock'),
      testBuildName = 'testBuildName',
      testMasterBuildName = '1.12.0/develop',
      testBuildStatus = 'Failed',
      testBuildFailedReason = 'It`s not good build',
      testBuildProblem = 'It`s real big problem',
      testUsername = 'teamcity',
      testPassword = 'password',
      testHost = 'https://***REMOVED***',
      testProjectId = 'testProjectId';

nock(testHost)
    .get(function (url) {
        console.log(`host http://localhost:8080, url: ${url}`);
        return true;
    })
    .query(
        function (actualQueryObject) {
            console.log(`actualQueryObject:,`, actualQueryObject);
            return true;
        }
    ).reply(200, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><builds count="1" href="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:name:1.12.0/develop,count:1,status:SUCCESS,state:finished" nextHref="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:(name:1.12.0/develop),count:1,status:SUCCESS,state:finished,start:1"><build id="1900030" buildTypeId="***REMOVED***" number="1.12.0/develop" status="SUCCESS" state="finished" branchName="1.12.0/develop" href="/httpAuth/app/rest/builds/id:1900030" webUrl="https://***REMOVED***/viewLog.html?buildId=1900030&amp;buildTypeId=***REMOVED***"/></builds>');

tc.init({login: "***REMOVED***", password: "***REMOVED***", host: "https://***REMOVED***", projectId: "***REMOVED***"}, testMasterBuildName);
