const ddmmyyReg = /((0?[13578]|10|12)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[01]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1}))|(0?[2469]|11)(-|\/)(([1-9])|(0[1-9])|([12])([0-9]?)|(3[0]?))(-|\/)((19)([2-9])(\d{1})|(20)([01])(\d{1})|([8901])(\d{1})))$/;
const daytimeReg = /(?=Last|Yesterday|Today)(.*)|((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$/;
const IRCReg = /^([[0-9]{1,2}:[0-9][0-9].*?)\]/;
const telegramReg = /\[([0-9]{2}.[0-9]{2}.[0-9]{2})( )(([0]?[0-9]|1[0-9]|2[0-3])(:)[0-5][0-9]((:)[0-5][0-9])?)\]$/;

const discordReg = /^(?=Last|Yesterday|Today)(.*)|((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm)))$/;
const slackReg = /^(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?)$/;

class Parser {
  static parse(chatLogs) {
    const parser = new Parser();

    let messages = [];
    let currentMessage;

    const lines = Array.isArray(chatLogs) ? chatLogs : chatLogs.split(/\r?\n/);
    lines.forEach(line => {
      currentMessage = parser.processMessage(line);
      if (currentMessage) {
        messages.push(currentMessage);
      }
    });

    return {
      messages: messages,
      service: {
        discord: messages[0].timeStamp.match(discordReg) != null,
        slack: messages[0].timeStamp.match(slackReg) != null,
        telegram: messages[0].timeStamp.match(telegramReg) != null,
        irc: messages[0].timeStamp.match(IRCReg) != null,
      }
    };
  }

  processMessage(line) {
    let sortLine;

    //Identify username and timestamp line
    sortLine = parseLine(line);
    if (sortLine) {
      this.username = sortLine.username;
      this.timeStamp = sortLine.timeStamp;
    }

    if (!sortLine || this.irc) {
      this.currentMessage = line;
      if (this.irc) {
        this.currentMessage = line.substring(
          line.indexOf("]") + this.username.length + 4,
          line.length
        );
      }
      this.messages = {
        username: this.username,
        timeStamp: this.timeStamp,
        message: this.currentMessage
      };

      return this.messages;
    }
  }

}

module.exports = Parser;


function parseLine(line) {
  let matchesDDMMYY = line.match(ddmmyyReg);
  let matchesDaytimeReg = line.match(daytimeReg);
  let matchesIRC = line.match(IRCReg);
  let matchesTelegram = line.match(telegramReg);
  let irc = matchesIRC;

  let matchesOne = matchesDDMMYY || matchesDaytimeReg || matchesIRC || matchesTelegram;

  let username;
  if (matchesOne && matchesOne[0].length) {
    username = line.substring(0, line.length - matchesOne[0].length);
    if (matchesTelegram) {
      username = line.substring(0, line.length - matchesOne[0].length - 2);
    }
  }
  if (matchesOne) {
    if (irc) {
      username = line.substring(matchesOne[0].length + 1, line.indexOf(": "));
    }
    matchesOne[0] = matchesOne[0].replace(/[\[\]]/g, "");
  }

  return !matchesOne ? null : {
    username: String(username).trim(),
    timeStamp: String(matchesOne[0])
  };

}