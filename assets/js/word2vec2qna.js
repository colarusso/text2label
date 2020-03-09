/*-----------------------------------------------------------------

     FUNCTIONS FROM https://github.com/turbomaze/word2vecjson

-----------------------------------------------------------------*/

function getNClosestMatches(n, vec) {
  var sims = [];
  for (var word in wordVecs) {
    var sim = getCosSim(vec, wordVecs[word]);
    sims.push([word, sim]);
  }
  sims.sort(function(a, b) {
    return b[1] - a[1];
  });
  return sims.slice(0, n);
}

function getCosSim(f1, f2) {
  return Math.abs(f1.reduce(function(sum, a, idx) {
    return sum + a*f2[idx];
  }, 0)/(mag(f1)*mag(f2))); //magnitude is 1 for all feature vectors
}

function mag(a) {
  return Math.sqrt(a.reduce(function(sum, val) {
    return sum + val*val;
  }, 0));
}

function norm(a) {
  var a_mag = mag(a);
  return a.map(function(val) {
    return val/a_mag;
  });
}

/*-----------------------------------------------------------------

     NEW FUNCTIONS

-----------------------------------------------------------------*/
var QVecs;
var QLabels;

function vectorize(string){
  // get a list of words
  words = string.replace(/[^a-zA-Z\s]+/g,'').replace(/\s{2,}/g,' ').toLowerCase().trim().split(" ");
  var vector = [];
  var usable_words = 0;
  var found = []
  var notfound = []
  // get the vector for each word
  for (i = 0, len = words.length, text = ""; i < len; i++) {
    // only do this if the word is in our list
    if (wordVecs.hasOwnProperty(words[i])) {
      found.push(words[i]);
      //console.log(wordVecs[words[i]]);
      if (usable_words==0) {
        vector = wordVecs[words[i]]
      } else {
        // average the word vectors
        for (j = 0; j < 300; j++) {
          vector[j] = vector[j] + wordVecs[words[i]][j];
        }
      }
      usable_words += 1
    } else {
      notfound.push(words[i]);
    }
  }

  for (j = 0; j < 300; j++) {
    vector[j] = vector[j]/usable_words;
  }
  // return a best-guess vector for the string
  return norm(vector);
}

function make_vectors(id) {
  $('#thinking').html("<span style='background:yellow'><b>Thinking...</b></span>")

  unknown_global(id)

  var textToRead = document.getElementById(id).value;
  var csvarr = CSVToArray(textToRead);
  var ValuesToWrite = {};
  var LabelsToWrite = {};
  for(var i=0; i < csvarr.length; i++) {
    ValuesToWrite[csvarr[i][1] + '#' + i] = vectorize(csvarr[i][0])
    LabelsToWrite[csvarr[i][1] + '#' + i] = csvarr[i][1]
  }
  QVecs = ValuesToWrite
  QLabels = LabelsToWrite
  $('#thinking').html("Your vectors are done.")
}

function download_vectors() {
  textToWrite = "var QVecs = "+JSON.stringify(QVecs)
  saveTextAsFile(textToWrite,'q2v.js');
}


function getNClosestAnswer(n, vec) {
  var sims = [];
  for (var ans in QVecs) {
    var sim = getCosSim(vec, QVecs[ans]);
    sims.push([ans, sim]);
  }
  sims.sort(function(a, b) {
    return b[1] - a[1];
  });
  return sims.slice(0, n);
}

function test_understanding() {
  var good_ans = 0;
  if (QVecs == null) {
      alert("You must build vectors before testing.")
  } else {
    var string = document.getElementById("test").value;
    answers = getNClosestAnswer(20, vectorize(string))
    refined_ans = []

    var table = "<h2>Potential Matches:</h2><table border='1px' cellpadding='5px'><tr><td><b>Label</b></td><td><b> Cosine Similarity</b></td></tr>"
    label_list = []
    most_sim = 0
    for(var i=0; i < answers.length; i++) {
      if (i==0){
        most_sim = answers[i][1]
      }
      if (!isNaN(answers[i][1]) && ((most_sim-answers[i][1])/((most_sim+answers[i][1])/2))<0.25 ) {
        if (!label_list.includes(QLabels[answers[i][0]])) {
          label_list.push(QLabels[answers[i][0]])
          refined_ans[good_ans] = [QLabels[answers[i][0]],answers[i][1]]
          good_ans += 1;
        }
      }
    }
    good_ans = 0;
    for(var i=0; i < refined_ans.length; i++) {
      if (!isNaN(refined_ans[i][1])) {
        table = table + "<tr><td>" + refined_ans[i][0] + "</td><td>" + refined_ans[i][1] + "</td></tr>"
        good_ans += 1;
      }
    }
    if (good_ans == 0) {
      table = table + "<tr><td> No Matches Found </td><td> n/a </td></tr>"
    }
    $('#answers').html(table + "</table>")
  }
  return true
}

function unknown(string) {
  // get a list of words
  words = string.replace(/[^a-zA-Z\s]+/g,'').replace(/\s{2,}/g,' ').toLowerCase().trim().split(" ");
  var notfound = []
  for (i = 0, len = words.length, text = ""; i < len; i++) {
    if (!wordVecs.hasOwnProperty(words[i])) {
      notfound.push(words[i]);
    }
  }
  return notfound;
}

function unknown_global(id) {
  var textToRead = document.getElementById(id).value;
  var csvarr = CSVToArray(textToRead);
  var notfound = []
  for(var i=0; i < csvarr.length; i++) {
     notfound = notfound.concat(unknown(csvarr[i][0]))
     notfound = notfound.filter((item, pos) => notfound.indexOf(item) === pos)
  }
  if (notfound.length > 0) {
    console.log("Words without vectors ("+notfound.length +"): "+ notfound);
    console.log("Building custome vectors...");
    if (notfound.length < 301) {
      for(var i=0; i < notfound.length; i++) {
         var empty_vect = Array(300).fill(0);
         empty_vect[i] = 1
         wordVecs[notfound[i]] = empty_vect
      }
    } else {
      for(var i=0; i < 300; i++) {
         var empty_vect = Array(300).fill(0);
         empty_vect[i] = 1
         wordVecs[notfound[i]] = empty_vect
      }
      console.log("Only the frist 300 unknown words were added.");
    }
    console.log("Done");
  }


  return notfound
}