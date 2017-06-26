describe('Установка значений teamcity',() => {
  describe('входные данные получены',()=>{
    const path = require('path'),
      pathToTestPackageJson = path.resolve(__dirname,'fixtures/package.json');

    beforeAll(()=>{
      console.log(pathToTestPackageJson);
    });

    beforeEach(()=>{
      spyOn(console, 'log');
    });

    it('package.json', () => {
      var teamcityParametersSet = require('../index')(pathToTestPackageJson);
    });

    it('anyConfig.json', () => {

    });
  });

  it('Подтест', () => {
    assert('tobi' === 'master');
  });

  it('ddsa', () => {
    expect(Object.keys(teamcityParametersSet.set)).toEqual(['a','d']);
  });
});