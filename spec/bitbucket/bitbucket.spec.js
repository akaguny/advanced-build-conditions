const nock = require('nock'),
      fs = require('fs-extra'),
      prInfo = require('../fixtures/bitbucket/pull-request.json');

let bitbucket;

nock.disableNetConnect();

describe('bitbucket', () => {
  beforeEach(() => {
    bitbucket = require('../../lib/bitbucket.js');
  });

  afterEach(() => {
    nock.cleanAll();
  });

  describe('предоставляет api для', () => {
    it('использования как модуля', () => {
      expect(bitbucket !== null && typeof bitbucket === 'object').toBeTruthy();
    });

    it('инициализации реквизитов', () => {
      expect(typeof bitbucket.init).toEqual('function');
    });

    it('получения id целевой ветки по id пулл-реквеста', () => {
      expect(typeof bitbucket.getTargetBranchIdByPrId).toEqual('function');
    });

    it('получения id пулл-реквеста по id ветки', () => {
      expect(typeof bitbucket.getPrIdByTargetBranchId).toEqual('function');
    });
  });

  describe('позволяет получать', () => {
    const testHost = 'https://stash.bitbucket.com',
          projectKey = 'testProject',
          repositorySlug = 'testRepository',
          pullRequestId = 'testPullRequestId',
          targetBranchId = 'testTargetBranch';

    beforeAll(() => {
      nock(testHost)
        .get(`/rest/api/1.0/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/`)
        .reply(200, prInfo);
    });

    it('id целевой ветки по id пулл-реквеста', () => {
      nock(testHost)
        .get(function (url) {
          expect(url).toEqual(`/rest/api/1.0/projects/${projectKey}/repos/${repositorySlug}/pull-requests/${pullRequestId}/`);
          return false;
        });

      expect(bitbucket.getTargetBranchIdByPrId(projectKey, repositorySlug, pullRequestId)).toEqual(targetBranchId);
    });
  });
});
