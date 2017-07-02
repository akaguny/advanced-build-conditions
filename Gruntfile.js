module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    watch: {
      files: ['*.js', '**/*.js', '!node_modules'],
      tasks: ['testDev'],
      options: {
        debounceDelay: 250
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('testDev', ['runTest', 'watch']);
  grunt.registerTask('runTest', () => {
    const sh = require('shelljs');

    sh.exec(`npm test`);
  });
};
