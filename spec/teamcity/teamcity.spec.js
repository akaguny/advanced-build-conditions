const sh = require('shelljs'),
      path = require('path'),
      basePackagePath = path.resolve(__dirname, '..');

let tc;

describe('teamcity', () => {
  beforeEach(() => {
    tc = require(path.resolve(basePackagePath, 'teamcity'));
  });

  describe('Модуль', () => {
    it('успешно подключен', () => {
      expect(tc).toBeDefined();
    });
    it('поддердивает необходимое api', () => {
      expect(tc.setBuildStatus).toBeDefined();
      expect(tc.getMasterBuildArtifact).toBeDefined();
      expect(tc.setBuildName).toBeDefined();
      expect(tc.getPullRequestNumber).toBeDefined();
    });
  });
});
