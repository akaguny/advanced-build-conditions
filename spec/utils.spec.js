const utils = require('../lib/utils');

describe('utils', () => {
  it('есть нужные функции', () => {
    expect(typeof utils.mergePathsFromAnyEnv === 'function').toBeTruthy();
  });

  it('mergePathsFromAnyEnv', () => {
    let path = utils.mergePathsFromAnyEnv('/home/alexey/IdeaProjects/sfa',
      '/opt/teamcity-agent/work/89d8f1306cb75ef7/devTools/js/grunt-config/clean.js');

    expect(path).toEqual('/home/alexey/IdeaProjects/sfa/devTools/js/grunt-config/clean.js');
  });
});
