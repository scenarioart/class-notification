function myFunction() {
  var config = getConfig();

  var events = listupEvents(config.googleCalendarId, config.colorCode);

  if (events != "") {
    var payload = {
      text: config.topMessage + events
    };

    postSlack(payload, config.WebhookURL);
  }
}

function getConfig() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("config");
  var data = sheet.getDataRange().getValues();

  var config = data.reduce(function(configDict, property) {
    var key = property[0];
    var value = property[1];
    configDict[key] = value;
    return configDict;
  }, {});
  return config;
}

function listupEvents(calId, colorCode) {
  var calendar = CalendarApp.getCalendarById(calId);
  var now = new Date();
  var events = calendar.getEventsForDay(
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  );
  var list = "";
  for (var i = 0; i < events.length; i++) {
    var color = events[i].getColor();
    if (colorCode && color == colorCode) {
      var startTime = Utilities.formatDate(
        events[i].getStartTime(),
        "GMT+0900",
        "HH:mm"
      );
      var endTime = Utilities.formatDate(
        events[i].getEndTime(),
        "GMT+0900",
        "-HH:mm  "
      );
      var title = events[i].getTitle();
      var location = events[i].getLocation();

      list += startTime + endTime + title + "@" + location + "\n";
    }
  }

  return list;
}

function postSlack(payload, url) {
  var options = {
    method: "POST",
    payload: JSON.stringify(payload)
  };

  var response = UrlFetchApp.fetch(url, options);
  var content = response.getContentText("UTF-8");
}
