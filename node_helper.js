'use strict';
const NodeHelper = require('node_helper');
const AWS = require('aws-sdk');
AWS.config.loadFromPath(__dirname + '/config.json');
var ddb = new AWS.DynamoDB()

const credentials = require("./credentials.json");

const AlchemyLanguageV1 = require('watson-developer-cloud/alchemy-language/v1');
var alchemy_language = new AlchemyLanguageV1(credentials.alchemy);

const PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');
var personality_insights = new PersonalityInsightsV3(credentials.personality);

const ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');
var tone_analyzer = new ToneAnalyzerV3(credentials.tone);

module.exports = NodeHelper.create({
  // Subclass socketNotificationReceived received.
  socketNotificationReceived: function(notification, payload) {
    if (notification === 'START_WATSON') {
      this.start_watson(payload);
    }
  },
  start_watson: function(payload) {
    var self = this



    // var completeLog = "my day was good I have been busy lately First I went to school then I had to work and after that I had to go to my guitar class I have you been playing guitar for three years already My guitar is AcousticAn acoustic guitar is a guitar that produces sound acoustically—by transmitting the vibration of the strings to the air—as opposed to relying on electronic amplification (see electric guitar) The sound waves from the strings of an acoustic guitar resonate through the guitar's body creating sound This typically involves the use of a sound board and a sound box to strengthen the vibrations of the strings The main source of sound in an acoustic guitar is the string which is plucked or strummed with the finger or with a pick The string vibrates at a necessary frequency and also create many harmonics at various different frequencies The frequencies produced can depend on string length mass and tension The string causes the soundboard and sound box to vibrate and as these have their own resonances at certain frequencies they amplify some string harmonics more strongly than others hence affecting the timbre produced by the instrument"


    // var completeLog = "My vision / hopes for the AI assistant / bot platforms of the future BOT: Hi how can I help you today? ME: I want to lose ten pounds. Setup my schedule to make it happen. BOT: Ok, but why do you want to lose ten pounds? ME: Because I look gross and need to lose weight. BOT: Ok, I can set up your schedule and diet to ensure you lose ten pounds within the next 30 days, but what will happen in the 30 days after? I suggest you rethink your request to optimize for wanting to live a healthier lifestyle. ME: Explain BOT: Well, we can regulate your intake of calories but when that regulation stops if you have not picked up the habits of choosing your own food, exercising, and managing your stress and sleep you will quickly bounce back to gaining weight and being unhappy. The weight is an affect of the lifestyle so to fix the weight fix the lifestyle and habits and the weight will adjust. ME: Ok Bot, setup my schedule to help me adjust to healthier lifestyle habits. BOT: Ok, starting a habit adjustment plan. The above conversation does not exist nor is it possible in any existing bot or AI platform regardless of all the glitter and buzz words entrepreneurs and big firms exhort to VCs and clients. The main reason? Inference. As people we rarely know what we want let alone understand why we want things. I don’t want my AI assistant / bot to just execute my commands blindly and automatically order me toilet paper once a month or spam colleagues with calendar invites until they fit an arbitrary log constraint chunk of my calendar. I want these systems to have my best interest in mind and be able to help me better understand myself as a person and actually improve my life beyond the material trinkets."

    // retrieve logs from DynamoDB
    var fetchDB = function() {
      ddb.query({
        TableName: 'JournalLogs',
        KeyConditionExpression: 'userId = :uid',
        ExpressionAttributeValues: {
          ':uid': {
            "S": payload.alexaUserId
          }
        }
      }, function(err, results) {

        // combine all text to a single string
        let allLogText = ''
        let logs = results.Items[0].mapAttr.M
        for (let key in logs) {
          if (logs[key].L) {
            for (let i = 0; i < logs[key].L.length; i++) {
              // console.log(logs[key].L[i].S)
              allLogText += logs[key].L[i].S + " "
            }
          }
        }
        // console.log(allLogText)

        // send all text to Watson
        self.profilePersonality(allLogText)
        self.generateEntities(allLogText)
        self.setTone(allLogText)
          // self.sendSocketNotification("RESULT", results.Items[0].mapAttr.M.notes.L);

        // do this every 60 minute to update the list
        setTimeout(fetchDB, 3600000);
      })
    }

    fetchDB();
  },

  generateEntities: function(text) {
    let self = this
    alchemy_language.combined({
      text: text,
      extract: 'entities,keywords',
      sentiment: 1,
      maxRetrieve: 3,
    }, function(err, response) {
      if (err)
        console.log('error:', err);
      else {
        // console.log(JSON.stringify(response, null, 2));

        let entities = response.entities.reduce(function(total, curr) {
          return total += curr.text + '; '
        }, '')

        let keywords = response.keywords.reduce(function(total, curr) {
          return total += curr.text + '; '
        }, '')

        // console.log(entities)
        // console.log(keywords)

        self.sendSocketNotification('ENTITIES', {
          entities: entities,
          keywords: keywords
        })

        // var locations = response
        // self.sendSocketNotification("RESULT", payload);
        // 
        // app.device.publish(app.TOPIC_LOCATIONS, JSON.stringify(locations), function() {
        //   console.log(locations)
        // })

        // var people = response
        // app.device.publish(app.TOPIC_PEOPLE, JSON.stringify(people), function() {
        //   console.log(people)
        // })
      }
    });
  },
  setTone: function(text) {
    let self = this
    tone_analyzer.tone({
      text: text
    }, function(err, results) {
      if (err)
        console.log(err);
      else {
        // console.log(JSON.stringify(results.document_tone.tone_categories, null, 2));
        let tones = results.document_tone.tone_categories

        function processData(response) {
          let raw = response.tones
          let labels = []
          let data = []
          raw.forEach(elem => {
            labels.push(elem.tone_name)
            data.push(elem.score)
          })

          // console.log(labels)
          // console.log(data)


          self.sendSocketNotification(response.category_id.toUpperCase(), {
            "labels": labels,
            "data": data
          });
        }

        for (let i = 0; i < tones.length; i++) {
          processData(tones[i])
        }
        // processData("needs")
        // processData("values")

        // app.device.publish(app.TOPIC_TONE, JSON.stringify(tone), function() {})
      }
    });
  },
  profilePersonality: function(text) {
    let self = this
    personality_insights.profile({
      text: text,
      consumption_preferences: true
    }, function(err, response) {
      if (err)
        console.log('error:', err);
      else {
        // console.log(JSON.stringify(response, null, 2));
        function processData(id) {
          let raw = response[id]
          let labels = []
          let data = []
          raw.forEach(elem => {
            labels.push(elem.name)
            data.push(elem.percentile)
          })

          // console.log(labels)
          // console.log(data)


          self.sendSocketNotification(id.toUpperCase(), {
            "labels": labels,
            "data": data
          });
        }

        processData("personality")
        processData("needs")
        processData("values")



        let consumption_preferences = response.consumption_preferences



        // app.device.publish(app.TOPIC_PERSONALITY, JSON.stringify(response), function() {})
      }
    });
  },

});