/*
 * Copyright 2017 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import * as _gulp from 'gulp';
import * as help from 'gulp-help';

import * as fs from 'fs';
import * as mocha from 'gulp-mocha';
import * as path from 'path';
import * as execa from 'execa';
import * as semver from 'semver';

// gulp-help monkeypatches tasks to have an additional description parameter
const gulp = help(_gulp);

Error.stackTraceLimit = Infinity;

const protojsDir = __dirname;
const tslintPath = path.resolve(protojsDir, 'node_modules/google-ts-style/tslint.json');
const tsconfigPath = path.resolve(protojsDir, 'tsconfig.json');
const outDir = path.resolve(protojsDir, 'build');
const srcDir = path.resolve(protojsDir, 'src');
const testDir = path.resolve(protojsDir, 'test');

const execNpmVerb = (verb: string, ...args: string[]) =>
  execa('npm', [verb, ...args], {cwd: protojsDir, stdio: 'inherit'});
const execNpmCommand = execNpmVerb.bind(null, 'run');

gulp.task('install', 'Install native core dependencies', () =>
          execNpmVerb('install', '--unsafe-perm'));

/**
 * Runs tslint on files in src/, with linting rules defined in tslint.json.
 */
gulp.task('lint', 'Emits linting errors found in src/ and test/.', () =>
          execNpmCommand('check'));

gulp.task('clean', 'Deletes transpiled code.', ['install'],
  () => execNpmCommand('clean'));

gulp.task('clean.all', 'Deletes all files added by targets', ['clean']);

/**
 * Transpiles TypeScript files in src/ and test/ to JavaScript according to the settings
 * found in tsconfig.json.
 */
gulp.task('compile', 'Transpiles src/ and test/.', () => execNpmCommand('compile'));

/**
 * Transpiles src/ and test/, and then runs all tests.
 */
gulp.task('test', 'Runs all tests.', () => {
  if (semver.satisfies(process.version, ">=6")) {
    return gulp.src(`${outDir}/test/**/*.js`)
      .pipe(mocha({reporter: 'mocha-jenkins-reporter',
                    require: ['ts-node/register']}));
  } else {
    console.log(`Skipping proto-loader tests for Node ${process.version}`);
    return Promise.resolve(null);
  }
});
