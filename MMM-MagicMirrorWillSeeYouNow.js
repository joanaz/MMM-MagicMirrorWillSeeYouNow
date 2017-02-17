/* global Module */

/* Magic Mirror
 * Module: MMM-MagicMirrorWillSeeYouNow
 *
 * 
 * MIT Licensed.
 */

Module.register('MMM-MagicMirrorWillSeeYouNow', {

  defaults: {
    'alexaUserId': "YOUR ALEXA USER ID",
  },

  start: function() {
    Log.info('Starting module: ' + this.name);
    this.sendSocketNotification('START_WATSON', this.config);
  },

  getStyles: function() {
    return [
      "MMM-MagicMirrorWillSeeYouNow.css",
      // "https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.5.2/animate.min.css"
    ]
  },

  getScripts: function() {
    return [
      this.file("node_modules/chart.js/dist/Chart.bundle.js")
    ]
  },

  // Override socket notification handler.
  socketNotificationReceived: function(notification, payload) {
    Log.info(this.name + "received a socket notification:\n" + notification);

    if (notification === "RESULT") {

      this.result = payload;
      this.updateDom()

    } else if (notification === "PERSONALITY" || notification === "VALUES" || notification === "NEEDS") {
      let id = notification.toLowerCase()
      this.drawRadarChart(id, payload)
    } else if (notification === "ENTITIES") {
      Log.log(payload)
      this.result = payload;
      this.updateDom()
    } else if (notification === "EMOTION_TONE" || notification === "LANGUAGE_TONE" || notification === "SOCIAL_TONE") {
      let id = notification.toLowerCase()
      this.drawRadarChart(id, payload)
    }
  },

  drawRadarChart: function(id, payload) {
    let data = {
      labels: payload.labels,
      datasets: [{
        label: id,
        // fill: true,
        backgroundColor: "rgba(179,181,198,0.3)",
        borderColor: "#fff",
        pointBackgroundColor: "#fff",
        pointBorderColor: "rgba(179,181,198,1)",
        data: payload.data
      }]
    }

    var myChart = new Chart(document.getElementById(id), {
      type: 'radar',
      data: data,
      options: {
        legend: {
          labels: {
            fontColor: "#fff",
            fontSize: 14
          }
        },
        scale: {
          gridLines: {
            color: "rgba(179,181,198,1)",
          },
          angleLines: {
            color: "rgba(179,181,198,1)",
          },
          pointLabels: {
            fontColor: "#fff",
            fontSize: 9
          },
          ticks: {
            backdropColor: "#000",
            fontSize: 12,
            fontColor: "#fff",
            min: 0,
            max: 1
          }
        }
      }
    })
  },

  getDom: function() {
    wrapper = document.createElement("div");
    wrapper.className = 'thin medium bright';



    var row = document.createElement("div")
    row.className = "row"

    var div1 = document.createElement("div")
    div1.className = 'canvas'
    var canvas_personality = document.createElement("canvas")
    canvas_personality.id = "personality"
    div1.appendChild(canvas_personality)
    row.appendChild(div1)

    var div2 = document.createElement("div")
    div2.className = 'canvas'
    var canvas_needs = document.createElement("canvas")
    canvas_needs.id = "needs"
    div2.appendChild(canvas_needs)
    row.appendChild(div2)

    var div3 = document.createElement("div")
    div3.className = 'canvas'
    var canvas_values = document.createElement("canvas")
    canvas_values.id = "values"
    div3.appendChild(canvas_values)
    row.appendChild(div3)



    var div4 = document.createElement("div")
    div4.className = 'canvas'
    var canvas_emotion_tone = document.createElement("canvas")
    canvas_emotion_tone.id = "emotion_tone"
    div4.appendChild(canvas_emotion_tone)
    row.appendChild(div4)

    var div5 = document.createElement("div")
    div5.className = 'canvas'
    var canvas_language_tone = document.createElement("canvas")
    canvas_language_tone.id = "language_tone"
    div5.appendChild(canvas_language_tone)
    row.appendChild(div5)

    var div6 = document.createElement("div")
    div6.className = 'canvas'
    var canvas_social_tone = document.createElement("canvas")
    canvas_social_tone.id = "social_tone"
    div6.appendChild(canvas_social_tone)
    row.appendChild(div6)



    wrapper.appendChild(row)


    var div_entities = document.createElement("div")
    var p_entities = document.createElement("p")
    p_entities.className = "animated fadeIn entities"
    var entities = document.createTextNode(this.result.entities)
    p_entities.appendChild(entities)


    var p_keywords = document.createElement("p")
    p_keywords.className = "animated fadeIn entities"
    var keywords = document.createTextNode(this.result.keywords)
    p_keywords.appendChild(keywords)

    div_entities.appendChild(p_entities)
    div_entities.appendChild(p_keywords)
    wrapper.appendChild(div_entities)



    return wrapper;
  }
});