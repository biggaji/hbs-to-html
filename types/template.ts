export type templateInitOption = {
  templateDirPath: string,
  extName?: string;
  partialDirPath?: string,
  defaultLayoutFilePath? : string,
}

export type templateGenerationOption = {
  templateName: string,
  context?: {}
}