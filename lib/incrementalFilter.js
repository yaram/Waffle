import fs from 'fs';
import path from 'path';
import {readFileContent} from '../lib/utils';
import defaultConfig from './defaultConfig';

const IMPORT_REGEXP = /^import "([\w-_.\/]*)";$/;

export default class IncrementalFilter {
  constructor(config) {
    this.config = {...defaultConfig, ...config};
  }

  inputToOutputPath(inputPath) {
    const extension = path.extname(inputPath);
    const name = path.basename(inputPath, extension);
    return path.format({
      dir: this.config.targetPath,
      ext: '.json',
      name
    });
  }

  getFileDependencies(inputPath) {
    const isImportLine = (line) => IMPORT_REGEXP.test(line);
    const getImport = (line) => IMPORT_REGEXP.exec(line)[1];
    const normalizePath = (filePath) => path.join(path.dirname(inputPath), filePath);
    const pathForImport = (filePath) => {
      const moduleFilePath = path.join(this.config.npmPath, filePath);
      return fs.existsSync(moduleFilePath) ? moduleFilePath : normalizePath(filePath);
    };
    return readFileContent(inputPath)
      .split('\n')
      .filter(isImportLine)
      .map(getImport)
      .map(pathForImport);
  }

  requireRecompilation(inputPath, outputPath) {
    if (!fs.existsSync(outputPath)) {
      return true;
    }
    const outputModificationDate = new Date(fs.statSync(outputPath).mtime);
    const inputModificationDate = new Date(fs.statSync(inputPath).mtime);
    return outputModificationDate < inputModificationDate;
  }

  getFileInfo(inputPath) {
    const outputPath = this.inputToOutputPath(inputPath);
    const requireRecompilation = this.requireRecompilation(inputPath, outputPath);
    const dependencies = this.getFileDependencies(inputPath);
    return {
      inputPath,
      outputPath,
      requireRecompilation,
      dependencies
    };
  }

  getFileInfos(sources) {
    const result = {};
    for (const filePath of sources) {
      result[filePath] = this.getFileInfo(filePath);
    }
    return result;
  }

  calculateReversedDependencies(fileInfos) {
    for (const filePath of Object.keys(fileInfos)) {
      for (const dependency of fileInfos[filePath].dependencies) {
        fileInfos[dependency] = fileInfos[dependency] || {};
        fileInfos[dependency].reversedDependencies = fileInfos[dependency].reversedDependencies || [];
        fileInfos[dependency].reversedDependencies.push(filePath);
      }
    }
    return fileInfos;
  }
}
