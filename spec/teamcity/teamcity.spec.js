const path = require('path'),
      basePackagePath = path.resolve(__dirname, '../..'),
      nock = require('nock'),
      teamcityHost = 'https://***REMOVED***';

let tc;

describe('teamcity', () => {
  beforeEach(() => {
    tc = require(path.resolve(basePackagePath, 'lib/teamcity'));
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('Модуль', () => {
    const testBuildName = 'testBuildName',
          testMasterBuildName = '1.12.0/develop',
          testBuildStatus = 'Failed',
          testBuildFailedReason = 'It`s not good build',
          testBuildProblem = 'It`s real big problem',
          testUsername = 'teamcity',
          testPassword = 'password',
          testHost = 'localhost:8010',
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
      beforeEach(() => {
        tc.init({login: testUsername, pasword: testPassword, host: testHost, projectId: testProjectId},testMasterBuildName);
      });

      it('использует входные данные', () => {
        nock(teamcityHost)
      });

      describe('позволяет получать', () => {
        it('артефакт мастер сборки', () => {
          // https://confluence.jetbrains.com/display/TCD10/REST+API#RESTAPI-BuildArtifacts
          nock(teamcityHost).get(/app\/rest\/builds\/.*\/artifacts\/content\/reports\.zip\/eslint.json/);
          tc.getBuildArtifact(`${testMasterBuildName}`);

          expect('buildArtifactURL').toEqual('anotherBuildArtifactURL');

          expect(nock.pendingMocks()).toEqual([]);
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
