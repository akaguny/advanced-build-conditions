// .reply(200, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><testOccurrences count="0" href="https://***REMOVED***/app/rest/testOccurrences/?locator=build:%28buildType:%28id:***REMOVED***%29,revision:latest%29"/>');
const path = require('path'),
      basePackagePath = path.resolve(__dirname, '../..'),
      nock = require('nock'),
      teamcityHost = 'http://localhost:8080';

let tc;

describe('teamcity', () => {
  beforeEach(() => {
    tc = require(path.resolve(basePackagePath, 'lib/teamcity'));
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Модуль', () => {
    const testMasterBuildName = '1.12.0/develop',
          testBuildStatus = 'Failed',
          testBuildFailedReason = 'It`s not good build',
          testBuildProblem = 'It`s real big problem',
          testUsername = 'teamcity',
          testPassword = 'password',
          testHost = 'http://localhost:8080',
          testProjectId = 'testProjectId';

    it('подключен', () => {
      expect(tc).toBeDefined();
    });

    it('поддердивает необходимое api', () => {
      expect(tc.init).toBeDefined();

      expect(tc.setBuildStatus).toBeDefined();

      expect(tc.getBuildArtifact).toBeDefined();
    });

    describe('в работе', () => {
      fit('использует входные данные', () => {
        let url;

        nock(testHost)
          .get(function (url) {
            expect(url).toEqual('/httpAuth/app/rest/builds');
            return true;
          })
          .query(
            function (actualQueryObject) {
              expect(actualQueryObject.locator).toEqual(`buildType:${testProjectId},branch:name:${testMasterBuildName},count:1,status:SUCCESS,state:finished`)
              console.log(`actualQueryObject:,`, actualQueryObject);
              return true;
            }
          ).reply(200, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><builds count="1" href="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:name:1.12.0/develop,count:1,status:SUCCESS,state:finished" nextHref="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:(name:1.12.0/develop),count:1,status:SUCCESS,state:finished,start:1"><build id="1900030" buildTypeId="***REMOVED***" number="1.12.0/develop" status="SUCCESS" state="finished" branchName="1.12.0/develop" href="/httpAuth/app/rest/builds/id:1900030" webUrl="https://***REMOVED***/viewLog.html?buildId=1900030&amp;buildTypeId=***REMOVED***"/></builds>');

        tc.init({login: testUsername, password: testPassword, host: testHost, projectId: testProjectId}, testMasterBuildName);

        expect(nock.pendingMocks()).toEqual([]);
      });

      describe('позволяет получать', () => {
        it('артефакт мастер сборки', () => {
          // https://confluence.jetbrains.com/display/TCD10/REST+API#RESTAPI-BuildArtifacts
          nock(teamcityHost).get('repository/download/***REMOVED***/2041953:id/reports.zip%21/eslint.json');

        });
      });

      describe('позволяет устанавливать', () => {
        it('имя сборки', () => {
          tc.setBuildName(`${testBuildName}`);

          expect(process.stdout).toContain(`anyIsn't contain in stdout, ${testBuildName}`);
        });

        it('проблему сборки', () => {
          tc.setBuildProblem(testBuildProblem);

          expect(process.stdout).toContain(`##teamcity[buildProblem desтзьcription='${testBuildProblem}' identity='']`);
        });

        it('статус сборки', () => {
          tc.setBuildStatus(`${testBuildStatus.failed}`, `${testBuildFailedReason}`);

          expect(process.stdout).toContain(`##teamcity[buildStatus status='${testBuildStatus.failed}' text='${testBuildFailedReason}']`);
        });
      });
    });
  });
});
