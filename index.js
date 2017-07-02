#!/usr/bin/env node

/* eslint-env es6:true */
'use-strict';
const fs = require('fs-extra'),
      isEqual = require('lodash.isequal');

let error = fs.readJSON('./report1.json'),
    newErrors = fs.readJSON('./report2.json'),
    noNewErrors = fs.readJSON('./report3.json'),
    newErrorsAndFiles = fs.readJSON('./report4.json'),
    promises = [error, newErrors, noNewErrors, newErrorsAndFiles];

Promise.all(promises).then((result) => {

});

function diffMessages (messages) {

}

function newErrorFiles () {

}
