// .reply(200, '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><testOccurrences count="0" href="https://***REMOVED***/app/rest/testOccurrences/?locator=build:%28buildType:%28id:***REMOVED***%29,revision:latest%29"/>');
const path = require('path'),
      basePackagePath = path.resolve(__dirname, '../..'),
      nock = require('nock'),
      teamcityHost = 'http://localhost:8080',
      eslintReportJSON = require(`${basePackagePath}/spec/fixtures/error.json`);

let tc;

nock.disableNetConnect();

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
          testProjectId = 'testProjectId',
          testBuildName = 'pull-requests/2741',
          testBuildId = 19994;

    it('подключен', () => {
      expect(tc).toBeDefined();
    });

    it('поддердивает необходимое api', () => {
      expect(tc.init).toBeDefined();

      expect(tc.setBuildStatus).toBeDefined();

      expect(tc.getBuildArtifact).toBeDefined();
    });

    describe('в работе', () => {
      beforeEach(() => {
        nock(testHost)
          .persist()
          .get(`/httpAuth/app/rest/builds?locator=buildType:${testProjectId},branch:name:${testMasterBuildName},count:1,status:SUCCESS,state:finished`)
          .reply(200, `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><builds count="1" href="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:name:1.12.0/develop,count:1,status:SUCCESS,state:finished" nextHref="/httpAuth/app/rest/builds?locator=buildType:***REMOVED***,branch:(name:1.12.0/develop),count:1,status:SUCCESS,state:finished,start:1"><build id="${testBuildId}" buildTypeId="***REMOVED***" number="1.12.0/develop" status="SUCCESS" state="finished" branchName="1.12.0/develop" href="/httpAuth/app/rest/builds/id:1900030" webUrl="https://***REMOVED***/viewLog.html?buildId=1900030&amp;buildTypeId=***REMOVED***"/></builds>`);

        // URL from https://confluence.jetbrains.com/display/TCD10/REST+API#RESTAPI-BuildArtifacts
        nock(testHost).get(`repository/download/${testProjectId}/${testBuildId}:id/reports.zip%21/eslint.json`)
          .reply(200, eslintReportJSON);
      });

      afterEach(() => {
        nock.cleanAll();
      });

      it('использует входные данные', () => {
        let url;

        nock(testHost)
          .get(function (url) {
            expect(url).toEqual('/httpAuth/app/rest/builds');
            return false;
          })
          .query(
            function (actualQueryObject) {
              expect(actualQueryObject.locator).toEqual(`buildType:${testProjectId},branch:name:${testMasterBuildName},count:1,status:SUCCESS,state:finished`);
              return false;
            }
          );

        tc.init({login: testUsername, password: testPassword, host: testHost, projectId: testProjectId}, testMasterBuildName);
      });

      describe('позволяет получать', () => {
        it('артефакт мастер сборки', () => {
          nock(testHost)
            .get(function (url) {
              expect(url).toEqual(`repository/download/${testProjectId}/${testBuildId}:id/reports.zip%21/eslint.json`);
              return false;
            });
          tc.getBuildArtifact().then(() => {
            expect(require(`${basePackagePath}/eslint-eport.json`)).toEqual(eslintReportJSON);
          });
        });
      });

      describe('позволяет устанавливать', () => {
        it('имя сборки', () => {
          tc.setBuildName(`${testBuildName}`);

          expect(process.stdout).toContain(`##teamcity[buildNumber '${testBuildName}']`);
        });

        it('проблему сборки', () => {
          tc.setBuildProblem(testBuildProblem);

          expect(process.stdout).toContain(`##teamcity[buildProblem description='${testBuildProblem}' identity='']`);
        });

        it('статус сборки', () => {
          tc.setBuildStatus(`${testBuildStatus.failed}`, `${testBuildFailedReason}`);

          expect(process.stdout).toContain(`##teamcity[buildStatus status='${testBuildStatus.failed}' text='${testBuildFailedReason}']`);
        });
      });
    });
  });
});
