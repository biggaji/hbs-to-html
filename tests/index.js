const http = require("http");
const path = require("path");
const hbstohtml = require("../lib/index");

const hbs = new hbstohtml({
    templateDirPath: path.join(__dirname, "views"),
    defaultLayoutFilePath: path.join(__dirname, "views", "layouts", "main.hbs"),
    partialDirPath: path.join(__dirname, "views", "partials") 
  });

// local test renders the generated html
const server = http.createServer(async function(request, response) {
  try {
      const htmlToRender =  await hbs.compileToHtml({
        templateName: "index",
        context: {
          year: new Date().getFullYear(),
          title: "Testing package"
        }
      })
    response.end(htmlToRender)
    
  } catch (error) {
    throw error;
  }
});

server.listen(4000, () => {
  console.log(`Server running ...`)
});