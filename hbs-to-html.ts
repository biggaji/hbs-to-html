import * as fs from "fs/promises";
import * as path from "path";
import * as handlebars from "handlebars";
import { templateInitOption, templateGenerationOption } from "./types/template";

/**
 * @class 
 * @description A wrapper around handlebars that easily converts a handlebars file to a html file
 * @author Tobi Ajibade
 */

export default class HbsToHtml {
  private templateDirPath: string
  private extName?: string = "hbs";
  private defaultLayoutFilePath?: string
  private partialDirPath?: string

  constructor(initOption: templateInitOption) {
    const { extName, templateDirPath, defaultLayoutFilePath, partialDirPath } = initOption;

    // validate required config param
    if (!templateDirPath) {
      throw new Error("template directory is required");
    }

    this.templateDirPath = templateDirPath;
    this.extName = (extName !== undefined) ? extName : this.extName;
    this.defaultLayoutFilePath = defaultLayoutFilePath;
    this.partialDirPath = partialDirPath;
  }

  /**
   * @method compileToHtml
   * @description Compiles and generate a html code
   * @param {object} opts - The needed configuration data containing the template name and optional context to find and generate the html code.
   * @memberof HbsToHtml
  */
  
  async compileToHtml(opts: templateGenerationOption) {
    try {
      const { templateName, context } = opts;
      // validate required fields
      if (!templateName || templateName === "" || Object.keys(opts).length === 0) {
        throw new Error("template name is required");
      }

      const template = await fs.readFile(path.join(this.templateDirPath, `${templateName}.${this.extName}`), "utf-8")
      const contextPayload = {};

      // if partial is provided, register it
      if (this.partialDirPath) {
        await this.registerPartials(this.partialDirPath);
      }
      
      // compile template
      const compiledTemplate = handlebars.compile(template);

      // if context object is provided
      if (context) {
        Object.assign(contextPayload, context);
      }
      // if layout file path is provided, register it
      if (this.defaultLayoutFilePath) {
        const layoutFileContent = await fs.readFile(this.defaultLayoutFilePath, "utf-8");
        
        const layout = handlebars.compile(layoutFileContent);
        const viewTemplate = compiledTemplate(contextPayload);
        
        // injects the template into the main layout
        return layout({ body: viewTemplate, ...contextPayload });
      } else {
        return compiledTemplate(contextPayload);
      }
    } catch (error) {
      console.error(`error compiling file to html`, error);
      throw error;
    }
  };

  protected async registerPartials(dir: string) {
    try {
      if (!dir || dir === "") {
        throw new Error("partial directory is required");
      }

      const files = await fs.readdir(dir);

      if (files.length === 0) {
        throw new Error("partial directory is empty, no file(s) found");
      }

      for (const file of files) {
        // check file extention and use accordingly
        let extName = "hbs";
        let fileMeta = file.split(".");

        if (fileMeta[1] !== extName) {
          extName = "handlebars"
        };

        const partialFileName = file.replace(extName, "");
        const partialFileContent = await fs.readFile(path.join(dir, `${partialFileName}${extName}`), "utf-8");

        // this slice the . after the filename away
        const keyName = partialFileName.split(".")[0];

        // construct partial object 
        const partialObject = {};
        partialObject[keyName] = partialFileContent;

        //register the partials on the hanldebar partial object
        Object.assign(handlebars.partials, partialObject);
      };
    } catch (error) {
      console.error(`error registering partial files`, error);
      throw error;
    }
  };
};