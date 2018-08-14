import Compiler from '../lib/compiler';

const buildExampleContracts = async () => {
  console.log('\nBuilding example contracts...');
  const sourcesPath = './test/compiler/contracts';
  const targetPath = './test/example/build';
  const config = {sourcesPath, targetPath};
  const compiler = new Compiler(config);
  await compiler.compile();
};

const buildMatchersContracts = async () => {
  console.log('\nBuilding matchers contracts...');
  const sourcesPath = './test/matchers/contracts';
  const targetPath = './test/matchers/build';
  const config = {sourcesPath, targetPath};
  const compiler = new Compiler(config);
  await compiler.compile();
};

const buildIncrementalCompilationContracts = async () => {
  console.log('\nBuilding matchers contracts...');
  const sourcesPath = './test/incrementalCompilation/contracts';
  const targetPath = './test/incrementalCompilation/build';
  const config = {sourcesPath, targetPath};
  const compiler = new Compiler(config);
  await compiler.compile();
};

const buildAll = async () => {
  await buildExampleContracts();
  await buildMatchersContracts();
  await buildIncrementalCompilationContracts();
};

buildAll();
