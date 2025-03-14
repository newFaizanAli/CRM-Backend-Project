const codeCreator = async ({ model, codeStr }) => {
    // let code = "";
    
    if (!model || !model.findOne) {
      throw new Error("Invalid model provided");
    }
  
    const lastItem = await model.findOne().sort({ code: -1 }).exec();
  
    if (lastItem && lastItem.code) {
      const lastCode = parseInt(lastItem.code.split("-")[2], 10);
      const newCode = (lastCode + 1).toString().padStart(4, "0");
      return `CRM-${codeStr}-${newCode}`;
    } else {
      return `CRM-${codeStr}-0001`;
    }
  };
  

module.exports = { codeCreator };
