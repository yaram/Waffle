import chai from 'chai';
import IncrementalFilter from '../../lib/incrementalFilter';
import {touch} from '../../lib/utils';

const {expect} = chai;

const inputs = [
  'test/incrementalCompilation/contracts/BasicToken.sol',
  'test/incrementalCompilation/contracts/ERC20Basic.sol',
  'test/incrementalCompilation/contracts/mock/BasicTokenMock.sol'
];

const outputs = [
  './test/incrementalCompilation/build/BasicToken.json',
  './test/incrementalCompilation/build/ERC20Basic.json',
  './test/incrementalCompilation/build/BasicTokenMock.json'
];

const sourcesPath = './test/incrementalCompilation/contracts';
const targetPath = './test/incrementalCompilation/build';
const config = {sourcesPath, targetPath};


describe('Incremental compilation', () => {
  let compiler;

  beforeEach(async () => {
    compiler = new IncrementalFilter(config);
  });

  it('inputToOutputPath', async () => {
    const input = 'test/incrementalCompilation/contracts/BasicToken.sol';
    const output = './test/incrementalCompilation/build/BasicToken.json';
    expect(compiler.inputToOutputPath(input)).to.eq(output);
  });

  it('inputToOutputPath (other directory)', async () => {
    const input = 'test/incrementalCompilation/contracts/mock/BasicTokenMock.sol';
    const output = './test/incrementalCompilation/build/BasicTokenMock.json';
    expect(compiler.inputToOutputPath(input)).to.eq(output);
  });

  it('getFileDependencies', async () => {
    const input = 'test/incrementalCompilation/contracts/mock/BasicTokenMock.sol';
    const expectedOutput = ['test/incrementalCompilation/contracts/BasicToken.sol'];
    expect(compiler.getFileDependencies(input)).to.deep.eq(expectedOutput);
  });

  it('getFileDependencies with node module dependencies', async () => {
    const input = 'test/incrementalCompilation/contracts/BasicToken.sol';
    const expectedOutput = [
      'test/incrementalCompilation/contracts/ERC20Basic.sol',
      'node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol'
    ];
    expect(compiler.getFileDependencies(input)).to.deep.eq(expectedOutput);
  });

  it('requireRecompilation - non existing output', () => {
    const inputPath = 'test/incrementalCompilation/contracts/ERC20Basic.sol';
    const outputPath = 'test/incrementalCompilation/build/ERC20Basic.json';
    expect(compiler.requireRecompilation(inputPath, outputPath)).to.be.true;
  });

  it('requireRecompilation - newer input', () => {
    const inputPath = 'test/incrementalCompilation/contracts/BasicToken.sol';
    const outputPath = 'test/incrementalCompilation/build/BasicToken.json';
    touch(inputPath);
    expect(compiler.requireRecompilation(inputPath, outputPath)).to.be.true;
  });

  it('requireRecompilation - newer output', () => {
    const inputPath = 'test/incrementalCompilation/contracts/BasicToken.sol';
    const outputPath = 'test/incrementalCompilation/build/BasicToken.json';
    touch(outputPath);
    expect(compiler.requireRecompilation(inputPath, outputPath)).to.be.false;
  });

  it('calculateReversedDependencies', async () => {
    const fileInfos = compiler.getFileInfos(inputs);
    compiler.calculateReversedDependencies(fileInfos);
    expect(fileInfos['test/incrementalCompilation/contracts/BasicToken.sol'].reversedDependencies).to.deep.eq([
      'test/incrementalCompilation/contracts/mock/BasicTokenMock.sol'
    ]);
    expect(fileInfos['node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol'].reversedDependencies).to.deep.eq([
      'test/incrementalCompilation/contracts/BasicToken.sol'
    ]);
    expect(fileInfos['test/incrementalCompilation/contracts/ERC20Basic.sol'].reversedDependencies).to.deep.eq([
      'test/incrementalCompilation/contracts/BasicToken.sol'
    ]);
  });
});
