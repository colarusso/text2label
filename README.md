# Text2Label: A Quick and Dirty Client-Side Text "Classifier"

This is not a true text classifier, hence the quotes. It is a JavaScript-only implementation that mostly does the job. I needed a solution that would run on something like GitHub Pages (where you only can do client-side scripting). Anyhow, you start with a two-column CSV file. The first column is an example of some text, and the second column is the label for each text item. We then build vectors based on these texts and associate them with their labels. Instead of using this as training data for a honest-to-goodness classifier, we just match the vectors of novel texts with existing examples, looking for the closest match.

You can "train" you classifier and test it out here: https://colarusso.github.io/text2label/

I got the idea for this after seeing word2veckson, which is where the word2vec json files came from originally. See https://github.com/turbomaze/word2vecjson
