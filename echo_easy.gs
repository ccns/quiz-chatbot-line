var channelToken = 'hpTLi2WX2A5Df5wNAru6EJ39Hyrzss1F5I1xRK+L4DwTul7lP/dqEwTBUHg/iaRAG7Pi2Dt7nAsxmolWh0V2oDmuyDsmZuLmt9I8N5eb3s9Ab32irg2NhPLH/qpFzKAVVkIJtbDNxi1hKtWUgY3GHQdB04t89/1O/w1cDnyilFU=';
//頻道的Token(通關密語)

function doGet(e) {
  return ContentService.createTextOutput(UrlFetchApp.fetch('http://ip-api.com/json'));
} 
//複製貼上


//好戲登場
function doPost(e) {
  //e 是Line 給我們的資料 其中最重要的是 reToken 和 Message
  
  var reToken = JSON.parse(e.postData.contents).events[0].replyToken;
  //要回復訊息 reToken
  
  var userMsg = JSON.parse(e.postData.contents).events[0].message.text;
  //使用者的 Message_字串
  
  botEcho(reToken, userMsg + ' WOW, HaHaHa');//How to debug
  //把使用者說的話 加上' WOW, HaHaHa' 回復
}
  
function botEcho(reToken, userMsg) {
//實作Echo  

  var url = 'https://api.line.me/v2/bot/message/reply';
  var opt = {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + channelToken,
	},
	'method': 'post',
	'payload': JSON.stringify({
      'replyToken': reToken,
      'messages': [{'type': 'text', 'text': userMsg}]
      })
	};
    UrlFetchApp.fetch(url, opt);
}
