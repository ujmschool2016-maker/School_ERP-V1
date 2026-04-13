
/*
INSTRUCTIONS:
1. Create a Google Sheet.
2. Create 4 tabs named: "Students", "Teachers", "Fees", "Results".
3. In Extensions > Apps Script, paste this code.
4. Set correct column names in the sheets (matching the variables below).
5. Deploy as "Web App" and set access to "Anyone".
*/

const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // Optional if using getActive()

function doGet(e) {
  const sheetName = e.parameter.sheet;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  
  const result = data.map(row => {
    const obj = {};
    headers.forEach((header, i) => obj[header] = row[i]);
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const params = JSON.parse(e.postData.contents);
  const action = params.action;
  const sheetName = params.sheet;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  if (action === "save") {
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => params.data[header] || "");
    sheet.appendRow(newRow);
    return ContentService.createTextOutput(JSON.stringify({status: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === "delete") {
    const id = params.id;
    const data = sheet.getDataRange().getValues();
    for(let i=1; i<data.length; i++) {
      if(data[i][0] == id) { // Assumes ID is in 1st column
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({status: "deleted"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
